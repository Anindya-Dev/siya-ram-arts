from typing import Any, Dict, Optional
from pydantic import Field
from app.schemas.common import BaseResponseSchema


class RazorpayOrderResponse(BaseResponseSchema):
    razorpay_order_id: str
    amount: int  # in paise (e.g. 5200000 for ₹52,000)
    currency: str = "INR"
    order_id: str
    key_id: str


class PaymentVerificationRequest(BaseResponseSchema):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerificationResponse(BaseResponseSchema):
    success: bool
    order_id: str
    status: str
    invoice_number: Optional[str] = None
    message: str


class RazorpayWebhookPayload(BaseResponseSchema):
    entity: str
    account_id: Optional[str] = None
    event: str
    contains: list[str] = Field(default_factory=list)
    payload: Dict[str, Any]
    created_at: int

