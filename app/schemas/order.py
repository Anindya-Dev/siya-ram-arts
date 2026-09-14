import datetime
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.models.order import OrderStatus, ShipmentStatus
from app.schemas.common import BaseResponseSchema


class CheckoutItem(BaseResponseSchema):
    variant_id: str
    location_id: Optional[str] = None
    quantity: int = Field(1, ge=1, le=10)
    reservation_id: Optional[str] = None


class CheckoutRequest(BaseResponseSchema):
    items: List[CheckoutItem] = Field(..., min_length=1)
    shipping_address_id: str
    customer_notes: Optional[str] = None


class OrderItemRead(BaseResponseSchema):
    id: str
    variant_id: str
    fulfilling_location_id: str
    quantity: int
    unit_price: int
    subtotal: int
    variant_snapshot: Dict[str, Any]


class ShipmentRead(BaseResponseSchema):
    id: str
    courier: str
    tracking_id: Optional[str] = None
    status: ShipmentStatus
    timeline: List[Dict[str, Any]]
    dispatched_at: Optional[datetime.datetime] = None
    delivered_at: Optional[datetime.datetime] = None


class OrderRead(BaseResponseSchema):
    id: str
    order_number: str
    user_id: str
    status: OrderStatus
    subtotal: int
    tax_amount: int
    shipping_fee: int
    total_amount: int
    razorpay_order_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class OrderDetailRead(OrderRead):
    items: List[OrderItemRead] = Field(default_factory=list)
    shipping_address_snapshot: Dict[str, Any] = Field(default_factory=dict)
    shipment: Optional[ShipmentRead] = None


class OrderStatusUpdate(BaseResponseSchema):
    status: OrderStatus
    reason: Optional[str] = None


class RazorpayOrderInfo(BaseResponseSchema):
    razorpay_order_id: str
    amount: int
    currency: str = "INR"
    receipt: Optional[str] = None


class CheckoutResponse(BaseResponseSchema):
    order: OrderRead
    razorpay: RazorpayOrderInfo


