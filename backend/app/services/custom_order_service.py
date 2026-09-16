import datetime
import uuid
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import BusinessRuleViolationError, ResourceNotFoundError
from app.core.logging import logger
from app.models.custom_order import CustomOrderRequest, ProductionStatus
from app.schemas.custom_order import CustomOrderCreate, CustomOrderQuoteUpdate
from app.services.payment_service import PaymentService


class CustomOrderService:
    @staticmethod
    async def create_custom_order_request(
        db: AsyncSession,
        user_id: str,
        data: CustomOrderCreate,
    ) -> CustomOrderRequest:
        """
        Submits a made-to-order commission request for custom handcrafted murtis.
        Does not touch standard inventory stock.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        req_number = f"SRA-COMM-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

        custom_order = CustomOrderRequest(
            request_number=req_number,
            user_id=user_id,
            deity=data.deity,
            requested_dimensions=data.requested_dimensions,
            medium_preference=data.medium_preference,
            specifications=data.specifications,
            reference_images=data.reference_images,
            devotee_notes=data.devotee_notes,
            production_status=ProductionStatus.REQUESTED,
        )
        db.add(custom_order)
        await db.flush()
        logger.info(f"Created custom order request {req_number} for user {user_id}")
        return custom_order

    @staticmethod
    async def provide_quote(
        db: AsyncSession,
        custom_order_id: str,
        quote: CustomOrderQuoteUpdate,
    ) -> CustomOrderRequest:
        """
        Staff/Admin provides total price quotation and deposit requirement.
        """
        stmt = select(CustomOrderRequest).where(CustomOrderRequest.id == custom_order_id)
        result = await db.execute(stmt)
        custom_order = result.scalar_one_or_none()

        if not custom_order:
            raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

        if quote.deposit_required_amount > quote.quoted_total_price:
            raise BusinessRuleViolationError("Deposit amount cannot exceed total quoted price")

        custom_order.quoted_total_price = quote.quoted_total_price
        custom_order.deposit_required_amount = quote.deposit_required_amount
        custom_order.balance_amount = quote.quoted_total_price - quote.deposit_required_amount
        custom_order.production_status = ProductionStatus.QUOTED
        if quote.artisan_notes:
            custom_order.artisan_notes = quote.artisan_notes

        await db.flush()
        return custom_order

    @staticmethod
    async def initiate_deposit_payment(
        db: AsyncSession,
        custom_order_id: str,
        user_id: str,
    ) -> dict:
        """
        Creates a Razorpay gateway order for the deposit amount.
        """
        stmt = select(CustomOrderRequest).where(
            CustomOrderRequest.id == custom_order_id,
            CustomOrderRequest.user_id == user_id,
        )
        result = await db.execute(stmt)
        custom_order = result.scalar_one_or_none()

        if not custom_order:
            raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

        if not custom_order.deposit_required_amount:
            raise BusinessRuleViolationError("Quotation not provided yet for this custom order")

        rp_order = PaymentService.create_razorpay_order(
            amount_in_inr=custom_order.deposit_required_amount,
            receipt=f"DEP-{custom_order.request_number}",
            notes={"custom_order_id": custom_order.id, "type": "deposit"},
        )

        custom_order.deposit_razorpay_order_id = rp_order.get("id")
        await db.flush()
        return rp_order

    @staticmethod
    async def verify_deposit_payment(
        db: AsyncSession,
        custom_order_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> CustomOrderRequest:
        """
        Verifies deposit signature and advances status to DEPOSIT_PAID -> IN_PRODUCTION.
        """
        stmt = select(CustomOrderRequest).where(CustomOrderRequest.id == custom_order_id)
        result = await db.execute(stmt)
        custom_order = result.scalar_one_or_none()

        if not custom_order:
            raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

        PaymentService.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        custom_order.deposit_razorpay_payment_id = razorpay_payment_id
        custom_order.production_status = ProductionStatus.IN_PRODUCTION
        await db.flush()
        logger.info(f"Custom commission {custom_order.request_number} deposit paid. Moved to IN_PRODUCTION.")
        return custom_order

    @staticmethod
    async def initiate_balance_payment(
        db: AsyncSession,
        custom_order_id: str,
        user_id: str,
    ) -> dict:
        """
        Creates a Razorpay gateway order for the final balance payment once sculpting is complete.
        """
        stmt = select(CustomOrderRequest).where(
            CustomOrderRequest.id == custom_order_id,
            CustomOrderRequest.user_id == user_id,
        )
        result = await db.execute(stmt)
        custom_order = result.scalar_one_or_none()

        if not custom_order:
            raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

        if not custom_order.balance_amount or custom_order.balance_amount <= 0:
            raise BusinessRuleViolationError("No outstanding balance for this commission")

        rp_order = PaymentService.create_razorpay_order(
            amount_in_inr=custom_order.balance_amount,
            receipt=f"BAL-{custom_order.request_number}",
            notes={"custom_order_id": custom_order.id, "type": "balance"},
        )

        custom_order.balance_razorpay_order_id = rp_order.get("id")
        await db.flush()
        return rp_order

    @staticmethod
    async def verify_balance_payment(
        db: AsyncSession,
        custom_order_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> CustomOrderRequest:
        """
        Verifies balance signature and marks commission as COMPLETED.
        """
        stmt = select(CustomOrderRequest).where(CustomOrderRequest.id == custom_order_id)
        result = await db.execute(stmt)
        custom_order = result.scalar_one_or_none()

        if not custom_order:
            raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

        PaymentService.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        custom_order.balance_razorpay_payment_id = razorpay_payment_id
        custom_order.production_status = ProductionStatus.COMPLETED
        await db.flush()
        logger.info(f"Custom commission {custom_order.request_number} balance paid. Commission COMPLETED.")
        return custom_order
