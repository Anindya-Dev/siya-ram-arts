import datetime
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.models.custom_order import ProductionStatus
from app.schemas.common import BaseResponseSchema


class CustomOrderCreate(BaseResponseSchema):
    deity: str = Field(..., min_length=2, max_length=100)
    requested_dimensions: str = Field(..., min_length=2, max_length=100)
    medium_preference: str = Field(
        "Chemical Resin (White Stone Finish)",
        description="Sculptural medium preference",
    )
    specifications: Dict[str, Any] = Field(default_factory=dict)
    reference_images: List[str] = Field(default_factory=list)
    devotee_notes: Optional[str] = None


class CustomOrderQuoteUpdate(BaseResponseSchema):
    quoted_total_price: int = Field(..., gt=0)
    deposit_required_amount: int = Field(..., gt=0)
    artisan_notes: Optional[str] = None


class CustomOrderStatusUpdate(BaseResponseSchema):
    production_status: ProductionStatus
    artisan_notes: Optional[str] = None


class CustomOrderRead(BaseResponseSchema):
    id: str
    request_number: str
    user_id: str
    deity: str
    requested_dimensions: str
    medium_preference: str
    specifications: Dict[str, Any]
    reference_images: List[str]
    devotee_notes: Optional[str]
    quoted_total_price: Optional[int]
    deposit_required_amount: Optional[int]
    balance_amount: Optional[int]
    production_status: ProductionStatus
    artisan_notes: Optional[str]
    deposit_razorpay_order_id: Optional[str]
    balance_razorpay_order_id: Optional[str]
    created_at: datetime.datetime
    updated_at: datetime.datetime

