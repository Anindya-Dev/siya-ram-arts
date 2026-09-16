from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.errors import ResourceNotFoundError
from app.core.security import get_current_user, get_optional_current_user, require_staff_or_admin
from app.models.inventory import InventoryItem, StockLedgerEntry, StockReservation
from app.models.location import Location
from app.models.product import ProductVariant
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.inventory import (
    InventoryItemRead,
    StockAdjustmentRequest,
    StockLedgerEntryRead,
    StockReservationCreate,
    StockReservationRead,
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory & Multi-Location Stock"])


@router.post("/reserve", response_model=StockReservationRead, status_code=status.HTTP_201_CREATED)
async def reserve_stock(
    data: StockReservationCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a temporary 15-minute stock hold for checkout.
    Uses row-level locking (SELECT ... FOR UPDATE) to prevent overselling.
    """
    user_id = current_user.id if current_user else None
    reservation = await InventoryService.create_reservation(
        db=db,
        variant_id=data.variant_id,
        location_id=data.location_id,
        quantity=data.quantity,
        user_id=user_id,
    )
    return StockReservationRead.model_validate(reservation)


@router.post("/release/{reservation_id}", response_model=MessageResponse)
async def release_reservation(
    reservation_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Releases an active stock reservation early (e.g. cart abandonment).
    """
    actor = current_user.clerk_user_id if current_user else "guest"
    released = await InventoryService.release_reservation(
        db=db, reservation_id=reservation_id, reason="manual_user_release", actor=actor
    )
    if not released:
        return MessageResponse(message="Reservation was already released, expired, or not found", success=False)
    return MessageResponse(message="Stock reservation successfully released")


@router.get("/variants/{variant_id}", response_model=List[InventoryItemRead])
async def get_variant_inventory(
    variant_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns stock breakdown across all active ateliers/locations for a variant.
    """
    stmt = (
        select(InventoryItem)
        .options(selectinload(InventoryItem.location), selectinload(InventoryItem.variant))
        .where(InventoryItem.variant_id == variant_id)
    )
    result = await db.execute(stmt)
    items = result.scalars().all()

    output = []
    for it in items:
        loc_name = it.location.name if it.location else None
        sku = it.variant.sku if it.variant else None
        output.append(
            InventoryItemRead(
                id=it.id,
                variant_id=it.variant_id,
                location_id=it.location_id,
                stock_count=it.stock_count,
                reserved_count=it.reserved_count,
                available_count=it.available_count,
                low_stock_threshold=it.low_stock_threshold,
                is_low_stock=it.is_low_stock,
                location_name=loc_name,
                variant_sku=sku,
            )
        )
    return output


@router.post("/adjust", response_model=InventoryItemRead)
async def adjust_stock(
    data: StockAdjustmentRequest,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Staff/Admin manual inventory adjustment (restock, physical audit, damage).
    Every mutation writes an immutable ledger entry.
    """
    actor = f"{current_user.role.value}:{current_user.email}"
    item = await InventoryService.adjust_stock(
        db=db,
        variant_id=data.variant_id,
        location_id=data.location_id,
        delta=data.delta,
        reason=data.reason,
        actor=actor,
        note=data.note,
        reference_id=data.reference_id,
    )
    # Reload with relations
    stmt = (
        select(InventoryItem)
        .options(selectinload(InventoryItem.location), selectinload(InventoryItem.variant))
        .where(InventoryItem.id == item.id)
    )
    res = await db.execute(stmt)
    reloaded = res.scalar_one()

    return InventoryItemRead(
        id=reloaded.id,
        variant_id=reloaded.variant_id,
        location_id=reloaded.location_id,
        stock_count=reloaded.stock_count,
        reserved_count=reloaded.reserved_count,
        available_count=reloaded.available_count,
        low_stock_threshold=reloaded.low_stock_threshold,
        is_low_stock=reloaded.is_low_stock,
        location_name=reloaded.location.name if reloaded.location else None,
        variant_sku=reloaded.variant.sku if reloaded.variant else None,
    )


@router.get("/ledger", response_model=PaginatedResponse[StockLedgerEntryRead])
async def get_stock_ledger(
    variant_id: Optional[str] = Query(None),
    location_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Immutable audit ledger of all physical and reserved stock transactions.
    Restricted to Staff and Admins.
    """
    query = select(StockLedgerEntry)
    if variant_id:
        query = query.where(StockLedgerEntry.variant_id == variant_id)
    if location_id:
        query = query.where(StockLedgerEntry.location_id == location_id)

    query = query.order_by(StockLedgerEntry.created_at.desc())

    result = await db.execute(query)
    all_entries = result.scalars().all()
    total = len(all_entries)

    start = (page - 1) * limit
    paged = all_entries[start : start + limit]

    items = [StockLedgerEntryRead.model_validate(e) for e in paged]
    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)
