from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import AuthorizationError, ResourceNotFoundError
from app.core.security import get_current_user, require_staff_or_admin
from app.models.custom_order import CustomOrderRequest, ProductionStatus
from app.models.user import User, UserRole
from app.schemas.common import PaginatedResponse
from app.schemas.custom_order import (
    CustomOrderCreate,
    CustomOrderQuoteUpdate,
    CustomOrderRead,
    CustomOrderStatusUpdate,
)
from app.schemas.payment import PaymentVerificationRequest
from app.services.custom_order_service import CustomOrderService

router = APIRouter(prefix="/custom-orders", tags=["Custom Temple Commissions & Made-to-Order"])


@router.post("", response_model=CustomOrderRead, status_code=status.HTTP_201_CREATED)
async def create_custom_order(
    data: CustomOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a made-to-order murti commission request.
    Does not touch standard inventory stock.
    """
    custom_order = await CustomOrderService.create_custom_order_request(
        db=db, user_id=current_user.id, data=data
    )
    return CustomOrderRead.model_validate(custom_order)


@router.get("", response_model=PaginatedResponse[CustomOrderRead])
async def list_custom_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[ProductionStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists commission requests. Customers only see their own requests. Staff/Admin sees all.
    """
    query = select(CustomOrderRequest)
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(CustomOrderRequest.user_id == current_user.id)

    if status_filter:
        query = query.where(CustomOrderRequest.production_status == status_filter)

    query = query.order_by(CustomOrderRequest.created_at.desc())

    result = await db.execute(query)
    all_orders = result.scalars().all()
    total = len(all_orders)

    start = (page - 1) * limit
    paged = all_orders[start : start + limit]

    items = [CustomOrderRead.model_validate(o) for o in paged]
    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)


@router.get("/{custom_order_id}", response_model=CustomOrderRead)
async def get_custom_order(
    custom_order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves details for a single custom commission.
    """
    stmt = select(CustomOrderRequest).where(CustomOrderRequest.id == custom_order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise ResourceNotFoundError("CustomOrderRequest", custom_order_id)

    if current_user.role == UserRole.CUSTOMER and order.user_id != current_user.id:
        raise AuthorizationError("Access denied to this custom commission")

    return CustomOrderRead.model_validate(order)


@router.post("/{custom_order_id}/quote", response_model=CustomOrderRead)
async def provide_commission_quote(
    custom_order_id: str,
    quote: CustomOrderQuoteUpdate,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Staff/Admin sets total quoted amount and required deposit.
    """
    updated = await CustomOrderService.provide_quote(db=db, custom_order_id=custom_order_id, quote=quote)
    return CustomOrderRead.model_validate(updated)


@router.post("/{custom_order_id}/deposit/initiate")
async def initiate_deposit_payment(
    custom_order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates Razorpay gateway order for the deposit amount.
    """
    rp_order = await CustomOrderService.initiate_deposit_payment(
        db=db, custom_order_id=custom_order_id, user_id=current_user.id
    )
    return {
        "custom_order_id": custom_order_id,
        "razorpay_order_id": rp_order.get("id"),
        "amount": rp_order.get("amount"),
        "currency": "INR",
    }


@router.post("/{custom_order_id}/deposit/verify", response_model=CustomOrderRead)
async def verify_deposit_payment(
    custom_order_id: str,
    data: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies deposit cryptographic payment signature. Transitions commission to IN_PRODUCTION.
    """
    updated = await CustomOrderService.verify_deposit_payment(
        db=db,
        custom_order_id=custom_order_id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature,
    )
    return CustomOrderRead.model_validate(updated)


@router.post("/{custom_order_id}/balance/initiate")
async def initiate_balance_payment(
    custom_order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates Razorpay gateway order for the final balance payment upon completion of sculpting.
    """
    rp_order = await CustomOrderService.initiate_balance_payment(
        db=db, custom_order_id=custom_order_id, user_id=current_user.id
    )
    return {
        "custom_order_id": custom_order_id,
        "razorpay_order_id": rp_order.get("id"),
        "amount": rp_order.get("amount"),
        "currency": "INR",
    }


@router.post("/{custom_order_id}/balance/verify", response_model=CustomOrderRead)
async def verify_balance_payment(
    custom_order_id: str,
    data: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies balance cryptographic payment signature. Transitions commission to COMPLETED.
    """
    updated = await CustomOrderService.verify_balance_payment(
        db=db,
        custom_order_id=custom_order_id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature,
    )
    return CustomOrderRead.model_validate(updated)
