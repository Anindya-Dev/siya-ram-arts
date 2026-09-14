import datetime
from typing import Optional
from pydantic import EmailStr
from app.models.user import UserRole
from app.schemas.common import BaseResponseSchema


class UserBase(BaseResponseSchema):
    email: EmailStr
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone: Optional[str] = None


class UserUpdate(BaseResponseSchema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserRoleUpdate(BaseResponseSchema):
    role: UserRole


class UserRead(UserBase):
    id: str
    clerk_user_id: str
    role: UserRole
    created_at: datetime.datetime


class AdminVerifyResponse(BaseResponseSchema):
    is_admin: bool
    email: str
    message: str


