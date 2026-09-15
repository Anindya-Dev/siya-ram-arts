import datetime
import uuid
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class DomainEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    event_type: str


class StockReservedEvent(DomainEvent):
    event_type: str = "StockReserved"
    reservation_id: str
    variant_id: str
    location_id: str
    quantity: int
    user_id: Optional[str] = None
    expires_at: datetime.datetime


class StockReleasedEvent(DomainEvent):
    event_type: str = "StockReleased"
    reservation_id: Optional[str] = None
    variant_id: str
    location_id: str
    quantity: int
    reason: str
    actor: str = "system"


class PaymentCapturedEvent(DomainEvent):
    event_type: str = "PaymentCaptured"
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    amount: int
    user_id: str


class OrderCancelledEvent(DomainEvent):
    event_type: str = "OrderCancelled"
    order_id: str
    user_id: str
    reason: str
    refund_issued: bool = False


class StockThresholdCrossedEvent(DomainEvent):
    event_type: str = "StockThresholdCrossed"
    variant_id: str
    location_id: str
    sku: str
    current_stock: int
    threshold: int
    location_name: str


class InvoiceGeneratedEvent(DomainEvent):
    event_type: str = "InvoiceGenerated"
    invoice_id: str
    order_id: str
    invoice_number: str
    total_amount: int
    pdf_url: Optional[str] = None
