import datetime
from typing import List, Optional, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.errors import (
    ResourceNotFoundError,
    StockReservationExpiredError,
    StockUnavailableError,
)
from app.core.logging import logger
from app.events import (
    StockReleasedEvent,
    StockReservedEvent,
    StockThresholdCrossedEvent,
    event_bus,
)
from app.models.inventory import (
    InventoryItem,
    LedgerReason,
    ReservationStatus,
    StockLedgerEntry,
    StockReservation,
)
from app.models.location import Location
from app.models.product import ProductVariant


class InventoryService:
    @staticmethod
    async def create_reservation(
        db: AsyncSession,
        variant_id: str,
        location_id: Optional[str] = None,
        quantity: int = 1,
        user_id: Optional[str] = None,
        duration_minutes: Optional[int] = None,
    ) -> StockReservation:
        """
        Creates a stock reservation holding inventory for checkout.
        Automatically selects fulfillment location with highest available stock if location_id is omitted.
        Uses atomic DB updates and row-level locking to strictly prevent race conditions and overselling.
        """
        minutes = duration_minutes or settings.RESERVATION_EXPIRY_MINUTES
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(minutes=minutes)

        if not location_id:
            # Auto-select fulfillment location: pick location with maximum available stock
            loc_stmt = (
                select(InventoryItem)
                .where(
                    InventoryItem.variant_id == variant_id,
                    (InventoryItem.stock_count - InventoryItem.reserved_count) >= quantity,
                )
                .order_by((InventoryItem.stock_count - InventoryItem.reserved_count).desc())
            )
            loc_res = await db.execute(loc_stmt)
            best_item = loc_res.scalars().first()
            if not best_item:
                raise StockUnavailableError(
                    f"Insufficient stock available across all atelier locations for variant {variant_id}.",
                    sku=None,
                )
            location_id = best_item.location_id

        # Atomic conditional update on DB level to strictly prevent race conditions and overselling
        update_stmt = (
            update(InventoryItem)
            .where(
                InventoryItem.variant_id == variant_id,
                InventoryItem.location_id == location_id,
                (InventoryItem.stock_count - InventoryItem.reserved_count) >= quantity,
            )
            .values(reserved_count=InventoryItem.reserved_count + quantity)
        )
        update_res = await db.execute(update_stmt)

        if update_res.rowcount == 0:
            # Check if item exists
            chk = await db.execute(
                select(InventoryItem).where(
                    InventoryItem.variant_id == variant_id,
                    InventoryItem.location_id == location_id,
                )
            )
            existing_item = chk.scalar_one_or_none()
            if not existing_item:
                raise ResourceNotFoundError("InventoryItem", f"variant:{variant_id} at location:{location_id}")
            
            available = existing_item.stock_count - existing_item.reserved_count
            logger.warning(
                f"Oversell prevented: Variant {variant_id} at location {location_id} has only {available} available, requested {quantity}"
            )
            raise StockUnavailableError(
                f"Insufficient stock available. Requested: {quantity}, Available: {available}",
                sku=None,
            )

        # Retrieve the updated item
        stmt = (
            select(InventoryItem)
            .where(
                InventoryItem.variant_id == variant_id,
                InventoryItem.location_id == location_id,
            )
        )
        result = await db.execute(stmt)
        item = result.scalar_one()

        # Create reservation record
        reservation = StockReservation(
            variant_id=variant_id,
            location_id=location_id,
            quantity=quantity,
            user_id=user_id,
            status=ReservationStatus.ACTIVE,
            expires_at=expires_at,
        )
        db.add(reservation)

        # Record audit ledger entry for reservation hold
        ledger_entry = StockLedgerEntry(
            variant_id=variant_id,
            location_id=location_id,
            delta=0,  # Physical stock does not change yet, reserved increases
            reason=LedgerReason.RESERVATION,
            actor=user_id or "system",
            reference_id=reservation.id,
            note=f"Reserved {quantity} units for {minutes}m window",
        )
        db.add(ledger_entry)
        await db.flush()

        # Emit domain event
        await event_bus.publish(
            StockReservedEvent(
                reservation_id=reservation.id,
                variant_id=variant_id,
                location_id=location_id,
                quantity=quantity,
                user_id=user_id,
                expires_at=expires_at,
            )
        )

        # Check if remaining available crossed low-stock threshold
        remaining_available = item.stock_count - item.reserved_count
        if remaining_available <= item.low_stock_threshold:
            # Query variant and location for descriptive alert
            var_stmt = select(ProductVariant).where(ProductVariant.id == variant_id)
            loc_stmt = select(Location).where(Location.id == location_id)
            var_res = await db.execute(var_stmt)
            loc_res = await db.execute(loc_stmt)
            variant_obj = var_res.scalar_one_or_none()
            loc_obj = loc_res.scalar_one_or_none()
            sku = variant_obj.sku if variant_obj else variant_id
            loc_name = loc_obj.name if loc_obj else location_id

            await event_bus.publish(
                StockThresholdCrossedEvent(
                    variant_id=variant_id,
                    location_id=location_id,
                    sku=sku,
                    current_stock=remaining_available,
                    threshold=item.low_stock_threshold,
                    location_name=loc_name,
                )
            )

        return reservation

    @staticmethod
    async def convert_reservation_to_sale(
        db: AsyncSession,
        reservation_id: str,
        order_id: str,
        actor: str = "system",
    ) -> None:
        """
        Converts an active reservation into a permanent sale upon payment confirmation.
        Decrements both physical stock_count and reserved_count atomically with an immutable ledger entry.
        """
        res_stmt = (
            select(StockReservation)
            .where(StockReservation.id == reservation_id)
            .with_for_update()
        )
        res_result = await db.execute(res_stmt)
        reservation = res_result.scalar_one_or_none()

        if not reservation:
            raise ResourceNotFoundError("StockReservation", reservation_id)

        now = datetime.datetime.now(datetime.timezone.utc)
        if reservation.status != ReservationStatus.ACTIVE:
            raise StockReservationExpiredError(reservation_id)
        
        # Check expiry (with slight 30s grace period for in-flight webhooks)
        expires_at = reservation.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
        if expires_at < (now - datetime.timedelta(seconds=30)):
            reservation.status = ReservationStatus.EXPIRED
            raise StockReservationExpiredError(reservation_id)

        # Lock inventory item
        item_stmt = (
            select(InventoryItem)
            .where(
                InventoryItem.variant_id == reservation.variant_id,
                InventoryItem.location_id == reservation.location_id,
            )
            .with_for_update()
        )
        item_res = await db.execute(item_stmt)
        item = item_res.scalar_one_or_none()
        if not item:
            raise ResourceNotFoundError("InventoryItem", f"{reservation.variant_id}")

        # Permanent deduction
        item.reserved_count = max(0, item.reserved_count - reservation.quantity)
        item.stock_count = max(0, item.stock_count - reservation.quantity)

        # Update reservation
        reservation.status = ReservationStatus.CONVERTED
        reservation.order_id = order_id

        # Write immutable audit ledger entry
        ledger = StockLedgerEntry(
            variant_id=reservation.variant_id,
            location_id=reservation.location_id,
            delta=-reservation.quantity,
            reason=LedgerReason.SALE,
            actor=actor,
            reference_id=order_id,
            note=f"Sale confirmed via Order {order_id}",
        )
        db.add(ledger)
        await db.flush()
        logger.info(f"Reservation {reservation_id} converted to sale for Order {order_id}. Stock decremented by {reservation.quantity}.")

    @staticmethod
    async def release_reservation(
        db: AsyncSession,
        reservation_id: str,
        reason: str = "expired",
        actor: str = "system",
    ) -> bool:
        """
        Releases reserved stock back into available inventory.
        """
        stmt = (
            select(StockReservation)
            .where(StockReservation.id == reservation_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        reservation = result.scalar_one_or_none()

        if not reservation or reservation.status != ReservationStatus.ACTIVE:
            return False

        # Lock inventory item
        item_stmt = (
            select(InventoryItem)
            .where(
                InventoryItem.variant_id == reservation.variant_id,
                InventoryItem.location_id == reservation.location_id,
            )
            .with_for_update()
        )
        item_res = await db.execute(item_stmt)
        item = item_res.scalar_one_or_none()

        if item:
            item.reserved_count = max(0, item.reserved_count - reservation.quantity)

        reservation.status = (
            ReservationStatus.EXPIRED if reason == "expired" else ReservationStatus.RELEASED
        )

        ledger = StockLedgerEntry(
            variant_id=reservation.variant_id,
            location_id=reservation.location_id,
            delta=0,
            reason=LedgerReason.RESERVATION_RELEASED,
            actor=actor,
            reference_id=reservation.id,
            note=f"Released reservation {reservation_id} ({reason})",
        )
        db.add(ledger)
        await db.flush()

        await event_bus.publish(
            StockReleasedEvent(
                reservation_id=reservation.id,
                variant_id=reservation.variant_id,
                location_id=reservation.location_id,
                quantity=reservation.quantity,
                reason=reason,
                actor=actor,
            )
        )
        logger.info(f"Released stock reservation {reservation_id} ({reason}).")
        return True

    @staticmethod
    async def release_expired_reservations(db: AsyncSession) -> int:
        """
        Scans for all active stock reservations past their expiry timestamp and releases them.
        Called by background worker.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        stmt = select(StockReservation.id).where(
            StockReservation.status == ReservationStatus.ACTIVE,
            StockReservation.expires_at < now,
        )
        result = await db.execute(stmt)
        expired_ids = result.scalars().all()

        count = 0
        for res_id in expired_ids:
            try:
                success = await InventoryService.release_reservation(db, res_id, reason="expired")
                if success:
                    count += 1
            except Exception as e:
                logger.error(f"Error releasing expired reservation {res_id}: {e}")
        return count

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        variant_id: str,
        location_id: str,
        delta: int,
        reason: LedgerReason,
        actor: str,
        note: Optional[str] = None,
        reference_id: Optional[str] = None,
    ) -> InventoryItem:
        """
        Performs manual stock adjustments, damages, or direct restocks.
        Ensures every single stock mutation writes an immutable ledger entry.
        """
        stmt = (
            select(InventoryItem)
            .where(
                InventoryItem.variant_id == variant_id,
                InventoryItem.location_id == location_id,
            )
            .with_for_update()
        )
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()

        if not item:
            item = InventoryItem(
                variant_id=variant_id,
                location_id=location_id,
                stock_count=0,
                reserved_count=0,
                low_stock_threshold=settings.LOW_STOCK_DEFAULT_THRESHOLD,
            )
            db.add(item)
            await db.flush()

        if item.stock_count + delta < 0:
            raise StockUnavailableError(
                f"Cannot adjust stock by {delta}: would cause negative inventory ({item.stock_count + delta})"
            )

        item.stock_count += delta

        ledger = StockLedgerEntry(
            variant_id=variant_id,
            location_id=location_id,
            delta=delta,
            reason=reason,
            actor=actor,
            reference_id=reference_id,
            note=note,
        )
        db.add(ledger)
        await db.flush()

        # Check threshold
        available = item.stock_count - item.reserved_count
        if available <= item.low_stock_threshold:
            var_stmt = select(ProductVariant).where(ProductVariant.id == variant_id)
            loc_stmt = select(Location).where(Location.id == location_id)
            var_res = await db.execute(var_stmt)
            loc_res = await db.execute(loc_stmt)
            variant_obj = var_res.scalar_one_or_none()
            loc_obj = loc_res.scalar_one_or_none()

            await event_bus.publish(
                StockThresholdCrossedEvent(
                    variant_id=variant_id,
                    location_id=location_id,
                    sku=variant_obj.sku if variant_obj else variant_id,
                    current_stock=available,
                    threshold=item.low_stock_threshold,
                    location_name=loc_obj.name if loc_obj else location_id,
                )
            )

        return item
