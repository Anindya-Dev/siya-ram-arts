from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.errors import AuthorizationError, ResourceNotFoundError
from app.core.security import get_current_user, require_staff_or_admin
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.order import (
    CheckoutRequest,
    OrderDetailRead,
    OrderRead,
    OrderStatusUpdate,
    ShipmentRead,
)
from app.schemas.payment import RazorpayOrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders & Checkout"])


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates an order, reserves inventory, and initializes Razorpay checkout session.
    All pricing and tax calculations are strictly performed server-side.
    """
    order, razorpay_order = await OrderService.create_order_and_payment(
        db=db,
        user_id=current_user.id,
        items=data.items,
        shipping_address_id=data.shipping_address_id,
        customer_notes=data.customer_notes,
    )

    return {
        "order": OrderRead.model_validate(order),
        "razorpay": {
            "razorpay_order_id": razorpay_order.get("id"),
            "amount": razorpay_order.get("amount"),
            "currency": "INR",
            "receipt": razorpay_order.get("receipt"),
        },
    }


@router.get("", response_model=PaginatedResponse[OrderRead])
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists orders. Customers only see their own orders. Staff and Admins see all orders.
    """
    query = select(Order)
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(Order.user_id == current_user.id)

    if status_filter:
        query = query.where(Order.status == status_filter)

    query = query.order_by(Order.created_at.desc())

    result = await db.execute(query)
    all_orders = result.scalars().all()
    total = len(all_orders)

    start = (page - 1) * limit
    paged = all_orders[start : start + limit]

    items = [OrderRead.model_validate(o) for o in paged]
    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)


@router.get("/{order_id}", response_model=OrderDetailRead)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves full details for a single order including items and shipment status.
    """
    stmt = (
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.invoice),
            selectinload(Order.shipment),
        )
        .where(Order.id == order_id)
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise ResourceNotFoundError("Order", order_id)

    if current_user.role == UserRole.CUSTOMER and order.user_id != current_user.id:
        raise AuthorizationError("Access denied to this order")

    detail = OrderDetailRead.model_validate(order)
    if order.shipment:
        detail.shipment = ShipmentRead.model_validate(order.shipment)
    return detail


@router.post("/{order_id}/cancel", response_model=OrderDetailRead)
async def cancel_order(
    order_id: str,
    reason: Optional[str] = Query("Customer requested cancellation"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cancels an order atomically.
    If already paid, executes gateway refund and writes restock ledger entries in one single transaction.
    """
    # Verify ownership or admin
    stmt = select(Order).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise ResourceNotFoundError("Order", order_id)

    if current_user.role == UserRole.CUSTOMER and order.user_id != current_user.id:
        raise AuthorizationError("Access denied to cancel this order")

    actor = f"{current_user.role.value}:{current_user.email}"
    cancelled_order = await OrderService.cancel_order(
        db=db,
        order_id=order_id,
        actor=actor,
        reason=reason or "Customer cancellation",
    )
    # Reload with relations
    stmt = (
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.invoice),
            selectinload(Order.shipment),
        )
        .where(Order.id == order_id)
    )
    reloaded = (await db.execute(stmt)).scalar_one()
    detail = OrderDetailRead.model_validate(reloaded)
    if reloaded.shipment:
        detail.shipment = ShipmentRead.model_validate(reloaded.shipment)
    return detail


@router.patch("/{order_id}/status", response_model=OrderDetailRead)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Staff/Admin status transition (e.g. PACKED, SHIPPED, DELIVERED).
    """
    stmt = (
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.invoice),
            selectinload(Order.shipment),
        )
        .where(Order.id == order_id)
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise ResourceNotFoundError("Order", order_id)

    order.status = data.status
    await db.flush()
    detail = OrderDetailRead.model_validate(order)
    if order.shipment:
        detail.shipment = ShipmentRead.model_validate(order.shipment)
    return detail
