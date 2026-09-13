import datetime
from typing import Optional
from pydantic import Field
from app.models.inventory import LedgerReason, ReservationStatus
from app.schemas.common import BaseResponseSchema


class InventoryItemRead(BaseResponseSchema):
    id: str
    variant_id: str
    location_id: str
    stock_count: int
    reserved_count: int
    available_count: int
    low_stock_threshold: int
    is_low_stock: bool
    location_name: Optional[str] = None
    variant_sku: Optional[str] = None


class StockLedgerEntryRead(BaseResponseSchema):
    id: str
    variant_id: str
    location_id: str
    delta: int
    reason: LedgerReason
    actor: str
    reference_id: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime.datetime


class StockReservationCreate(BaseResponseSchema):
    variant_id: str
    location_id: Optional[str] = None
    quantity: int = Field(1, ge=1, le=10)


class StockReservationRead(BaseResponseSchema):
    id: str
    variant_id: str
    location_id: str
    quantity: int
    user_id: Optional[str] = None
    expires_at: datetime.datetime
    status: ReservationStatus
    order_id: Optional[str] = None
    created_at: datetime.datetime


class StockAdjustmentRequest(BaseResponseSchema):
    variant_id: str
    location_id: str
    delta: int = Field(..., description="Positive for restock, negative for deduction")
    reason: LedgerReason
    note: Optional[str] = None
    reference_id: Optional[str] = None

