from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import AuthorizationError, ResourceNotFoundError
from app.core.security import get_current_user
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate
from app.schemas.common import MessageResponse
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication & Devotee Profiles"])


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user profile verified from Clerk JWT.
    """
    return UserRead.model_validate(current_user)


@router.get("/verify-admin")
async def verify_admin(current_user: User = Depends(get_current_user)):
    """
    Double-gate admin check:
      Gate 1 — User role must be admin (synced from Clerk JWT)
      Gate 2 — Email must be in server-side ADMIN_EMAILS whitelist (.env)

    Both must pass. Neither alone is sufficient.
    Only the server owner (you) can add emails to ADMIN_EMAILS.
    """
    user_email = (current_user.email or "").lower().strip()

    # Gate 1: Check role that was synced from Clerk during get_current_user
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    has_clerk_role = user_role == "admin"

    # Gate 2: Server whitelist check (only editable by developer via .env)
    in_whitelist = settings.is_admin_email(user_email)

    is_admin = has_clerk_role and in_whitelist

    return {
        "is_admin": is_admin,
        "email": user_email,
        # Do not expose which gate failed — security through obscurity
        "message": "Access granted" if is_admin else "Access denied",
    }


@router.patch("/me", response_model=UserRead)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates basic contact information for current user.
    """
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(current_user, k, v)
    await db.flush()
    return UserRead.model_validate(current_user)


@router.get("/addresses", response_model=List[AddressRead])
async def list_user_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists saved delivery addresses for the authenticated devotee.
    """
    stmt = (
        select(Address)
        .where(Address.user_id == current_user.id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/addresses", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new delivery address.
    """
    if data.is_default:
        # Unset previous default
        unset_stmt = select(Address).where(Address.user_id == current_user.id, Address.is_default.is_(True))
        res = await db.execute(unset_stmt)
        for old in res.scalars().all():
            old.is_default = False

    addr = Address(
        user_id=current_user.id,
        full_name=data.full_name,
        phone=data.phone,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city,
        state=data.state,
        state_code=data.state_code,
        postal_code=data.postal_code,
        country=data.country,
        is_default=data.is_default,
    )
    db.add(addr)
    await db.flush()
    return AddressRead.model_validate(addr)


@router.delete("/addresses/{address_id}", response_model=MessageResponse)
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes a delivery address.
    """
    stmt = select(Address).where(Address.id == address_id)
    res = await db.execute(stmt)
    addr = res.scalar_one_or_none()

    if not addr:
        raise ResourceNotFoundError("Address", address_id)

    if addr.user_id != current_user.id:
        raise AuthorizationError("Access denied to this address")

    await db.delete(addr)
    await db.flush()
    return MessageResponse(message="Address removed successfully")