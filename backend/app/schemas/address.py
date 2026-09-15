import datetime
from typing import Optional
from pydantic import Field
from app.schemas.common import BaseResponseSchema


class AddressBase(BaseResponseSchema):
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    address_line1: str = Field(..., min_length=3, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    state_code: str = Field("08", min_length=2, max_length=10)
    postal_code: str = Field(..., min_length=4, max_length=20)
    country: str = Field("India", min_length=2, max_length=100)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseResponseSchema):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None


class AddressRead(AddressBase):
    id: str
    user_id: str
    created_at: datetime.datetime

