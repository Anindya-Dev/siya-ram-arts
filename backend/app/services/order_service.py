import datetime
import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.errors import (
    BusinessRuleViolationError,
    PaymentVerificationError,
    ResourceNotFoundError,
)
from app.core.logging import logger
from app.events import OrderCancelledEvent, PaymentCapturedEvent, event_bus
from app.models.address import Address
from app.models.inventory import LedgerReason, ReservationStatus, StockReservation
from app.models.order import Order, OrderItem, OrderStatus, Shipment, ShipmentStatus
from app.models.product import ProductVariant
from app.schemas.order import CheckoutItem
from app.services.inventory_service import InventoryService
from app.services.invoice_service import InvoiceService
from app.services.payment_service import PaymentService


class OrderService:
    @staticmethod
    async def create_order_and_payment(
        db: AsyncSession,
        user_id: str,
        items: List[CheckoutItem],
        shipping_address_id: str,
        customer_notes: Optional[str] = None,
    ) -> Tuple[Order, dict]:
        """
        Creates an order, reserves inventory, and initializes Razorpay checkout.
        Server calculates all prices, GST, and totals strictly from database state.
        """
        # 1. Fetch shipping address and construct immutable snapshot
        addr_stmt = select(Address).where(Address.id == shipping_address_id)
        addr_res = await db.execute(addr_stmt)
        address = addr_res.scalar_one_or_none()
        if not address:
            raise ResourceNotFoundError("Address", shipping_address_id)

        address_snapshot = {
            "full_name": address.full_name,
            "phone": address.phone,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "state_code": address.state_code,
            "postal_code": address.postal_code,
            "country": address.country,
        }

        # 2. Process each item and secure reservations
        subtotal = 0
        order_items_to_create = []
        reservation_ids = []

        for item_req in items:
            var_stmt = (
                select(ProductVariant)
                .options(selectinload(ProductVariant.product))
                .where(ProductVariant.id == item_req.variant_id)
            )
            var_res = await db.execute(var_stmt)
            variant = var_res.scalar_one_or_none()
            if not variant or not variant.is_active:
                raise ResourceNotFoundError("ProductVariant", item_req.variant_id)

            # Ensure stock reservation
            if item_req.reservation_id:
                res_stmt = select(StockReservation).where(StockReservation.id == item_req.reservation_id)
                res_res = await db.execute(res_stmt)
                reservation = res_res.scalar_one_or_none()
                if not reservation or reservation.status != ReservationStatus.ACTIVE:
                    raise BusinessRuleViolationError("Reservation is invalid or expired. Please re-add to bag.")
                reservation_id = reservation.id
            else:
                # Create reservation on the fly
                reservation = await InventoryService.create_reservation(
                    db=db,
                    variant_id=variant.id,
                    location_id=item_req.location_id,
                    quantity=item_req.quantity,
                    user_id=user_id,
                )
                reservation_id = reservation.id

            reservation_ids.append(reservation_id)

            item_unit_price = variant.base_price
            item_subtotal = item_unit_price * item_req.quantity
            subtotal += item_subtotal

            image_url = None
            if variant.product and variant.product.images:
                for img in variant.product.images:
                    if isinstance(img, dict) and img.get("isPrimary"):
                        image_url = img.get("url")
                        break
                if not image_url and len(variant.product.images) > 0 and isinstance(variant.product.images[0], dict):
                    image_url = variant.product.images[0].get("url")

            variant_snapshot = {
                "sku": variant.sku,
                "name": variant.product.name,
                "deity": variant.product.deity,
                "size": variant.size,
                "material": variant.material,
                "finish": variant.finish,
                "image_url": image_url,
            }

            order_items_to_create.append(
                {
                    "variant_id": variant.id,
                    "fulfilling_location_id": reservation.location_id,
                    "quantity": item_req.quantity,
                    "unit_price": item_unit_price,
                    "subtotal": item_subtotal,
                    "variant_snapshot": variant_snapshot,
                }
            )

        # 3. Calculate GST and Totals
        customer_state_code = str(address_snapshot.get("state_code", "08"))
        cgst, sgst, igst = InvoiceService.calculate_gst(subtotal, customer_state_code)
        tax_amount = cgst + sgst + igst
        shipping_fee = 0  # Complimentary sacred freight
        total_amount = subtotal + tax_amount + shipping_fee

        # 4. Generate order number
        now = datetime.datetime.now(datetime.timezone.utc)
        order_number = f"SRA-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

        # 5. Create Razorpay gateway order
        razorpay_order = PaymentService.create_razorpay_order(
            amount_in_inr=total_amount,
            receipt=order_number,
            notes={"user_id": user_id, "order_number": order_number},
        )
        razorpay_order_id = razorpay_order.get("id")

        # 6. Save Order and OrderItems
        order = Order(
            order_number=order_number,
            user_id=user_id,
            status=OrderStatus.PENDING_PAYMENT,
            shipping_address_id=shipping_address_id,
            shipping_address_snapshot=address_snapshot,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_fee=shipping_fee,
            total_amount=total_amount,
            razorpay_order_id=razorpay_order_id,
        )
        db.add(order)
        await db.flush()

        for oi_data in order_items_to_create:
            oi = OrderItem(
                order_id=order.id,
                variant_id=oi_data["variant_id"],
                fulfilling_location_id=oi_data["fulfilling_location_id"],
                quantity=oi_data["quantity"],
                unit_price=oi_data["unit_price"],
                subtotal=oi_data["subtotal"],
                variant_snapshot=oi_data["variant_snapshot"],
            )
            db.add(oi)

        # Link reservations to order
        for res_id in reservation_ids:
            res_stmt = select(StockReservation).where(StockReservation.id == res_id)
            res_res = await db.execute(res_stmt)
            r = res_res.scalar_one_or_none()
            if r:
                r.order_id = order.id

        await db.flush()
        return order, razorpay_order

    @staticmethod
    async def verify_payment_and_complete_order(
        db: AsyncSession,
        order_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        actor: str = "customer",
    ) -> Order:
        """
        Verifies payment cryptographic signature, converts reservations to permanent sales,
        and generates a GST invoice. Idempotent: safe to invoke repeatedly from checkout and webhooks.
        """
        # Row-level lock on order
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.invoice),
                selectinload(Order.shipment),
            )
            .where(Order.id == order_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()

        if not order:
            raise ResourceNotFoundError("Order", order_id)

        # Idempotency check: if already paid, return existing state safely
        if order.status in (OrderStatus.PAID, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.DELIVERED):
            logger.info(f"Order {order_id} already marked {order.status}. Returning idempotent response.")
            return order

        # Verify gateway cryptographic signature
        PaymentService.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        # Convert all stock reservations to permanent sales (decrements stock & writes ledger rows)
        res_stmt = select(StockReservation).where(StockReservation.order_id == order.id)
        res_result = await db.execute(res_stmt)
        reservations = res_result.scalars().all()

        for res in reservations:
            if res.status == ReservationStatus.ACTIVE:
                await InventoryService.convert_reservation_to_sale(
                    db=db,
                    reservation_id=res.id,
                    order_id=order.id,
                    actor=actor,
                )

        # Update order status
        order.status = OrderStatus.PAID
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature

        # Create GST Invoice
        await InvoiceService.create_invoice_for_order(db=db, order=order)

        # Initialize Shipment tracking
        shipment = Shipment(
            order_id=order.id,
            courier="Specialized Sacred Art Freight",
            status=ShipmentStatus.PENDING,
            timeline=[
                {
                    "status": "Order Placed & Payment Confirmed",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "notes": "Preparing consecrated wooden crate for transit.",
                }
            ],
        )
        db.add(shipment)
        await db.flush()

        # Emit payment event
        await event_bus.publish(
            PaymentCapturedEvent(
                order_id=order.id,
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                amount=order.total_amount,
                user_id=order.user_id,
            )
        )

        logger.info(f"Order {order.order_number} successfully marked PAID with GST invoice generated.")
        return order

    @staticmethod
    async def cancel_order(
        db: AsyncSession,
        order_id: str,
        actor: str,
        reason: str = "Devotee cancellation",
    ) -> Order:
        """
        Cancels an order atomically.
        If already paid, triggers gateway refund and restocks inventory with ledger entry in one single transaction.
        """
        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()

        if not order:
            raise ResourceNotFoundError("Order", order_id)

        if order.status in (OrderStatus.CANCELLED, OrderStatus.REFUNDED):
            return order

        refund_processed = False
        if order.status == OrderStatus.PAID:
            if order.razorpay_payment_id:
                PaymentService.process_refund(
                    payment_id=order.razorpay_payment_id,
                    amount_in_inr=order.total_amount,
                    reason=reason,
                )
                refund_processed = True

            # Restock physical inventory with audit ledger entry
            for item in order.items:
                await InventoryService.adjust_stock(
                    db=db,
                    variant_id=item.variant_id,
                    location_id=item.fulfilling_location_id,
                    delta=item.quantity,
                    reason=LedgerReason.RESTOCK,
                    actor=actor,
                    note=f"Restock from cancelled Order {order.order_number}",
                    reference_id=order.id,
                )

            order.status = OrderStatus.REFUNDED
        else:
            # Release active reservations
            res_stmt = select(StockReservation).where(StockReservation.order_id == order.id)
            res_res = await db.execute(res_stmt)
            for res in res_res.scalars().all():
                if res.status == ReservationStatus.ACTIVE:
                    await InventoryService.release_reservation(db, res.id, reason="order_cancelled", actor=actor)
            order.status = OrderStatus.CANCELLED

        await db.flush()

        await event_bus.publish(
            OrderCancelledEvent(
                order_id=order.id,
                user_id=order.user_id,
                reason=reason,
                refund_issued=refund_processed,
            )
        )
        return order
