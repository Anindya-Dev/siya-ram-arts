import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import BaseResponseSchema


class ReviewCreate(BaseResponseSchema):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    title: Optional[str] = Field(None, max_length=200)
    comment: str = Field(..., min_length=3, max_length=2000)
    altar_name: Optional[str] = Field(None, max_length=150)
    altar_photo_url: Optional[str] = Field(None, max_length=500)
    order_id: Optional[str] = None


class ReviewRead(BaseResponseSchema):
    id: str
    product_id: str
    user_id: str
    order_id: Optional[str] = None
    rating: int
    title: Optional[str] = None
    comment: str
    verified_patron: bool = False
    altar_name: Optional[str] = None
    altar_photo_url: Optional[str] = None
    author_name: str = "Devotee Patron"
    created_at: datetime.datetime
