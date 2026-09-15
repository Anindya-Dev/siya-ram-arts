from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.errors import ResourceNotFoundError
from app.core.logging import logger
from app.core.security import get_current_user
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product, ProductVariant
from app.models.review import Review
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(prefix="/products", tags=["Product Reviews"])


@router.post("/{product_id}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: str,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new customer review for a sacred murti product.
    Automatically checks if the user has a verified purchase (delivered/paid order containing this product).
    """
    # 1. Verify product exists
    prod_stmt = select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    prod_res = await db.execute(prod_stmt)
    product = prod_res.scalar_one_or_none()
    if not product:
        raise ResourceNotFoundError("Product", product_id)

    # 2. Check for verified purchase status across user's orders
    verified_stmt = (
        select(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(ProductVariant, OrderItem.variant_id == ProductVariant.id)
        .where(
            Order.user_id == current_user.id,
            ProductVariant.product_id == product_id,
            Order.status.in_([OrderStatus.PAID, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]),
        )
    )
    verified_res = await db.execute(verified_stmt)
    delivered_order = verified_res.scalars().first()
    verified_patron = delivered_order is not None

    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        order_id=data.order_id or (delivered_order.id if delivered_order else None),
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        verified_patron=verified_patron,
        altar_name=data.altar_name,
        altar_photo_url=data.altar_photo_url,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    author_name = f"{current_user.first_name} {current_user.last_name}".strip() or "Devotee Patron"
    return ReviewRead(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        order_id=review.order_id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        verified_patron=review.verified_patron,
        altar_name=review.altar_name,
        altar_photo_url=review.altar_photo_url,
        author_name=author_name,
        created_at=review.created_at,
    )


@router.get("/{product_id}/reviews", response_model=PaginatedResponse[ReviewRead])
async def list_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves paginated reviews for a specific product.
    """
    offset = (page - 1) * limit

    # Count query
    count_stmt = select(func.count(Review.id)).where(Review.product_id == product_id)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    # Data query
    stmt = (
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    reviews = res.scalars().all()

    items = []
    for r in reviews:
        author_name = f"{r.user.first_name} {r.user.last_name}".strip() if r.user else "Devotee Patron"
        if not author_name:
            author_name = "Devotee Patron"
        items.append(
            ReviewRead(
                id=r.id,
                product_id=r.product_id,
                user_id=r.user_id,
                order_id=r.order_id,
                rating=r.rating,
                title=r.title,
                comment=r.comment,
                verified_patron=r.verified_patron,
                altar_name=r.altar_name,
                altar_photo_url=r.altar_photo_url,
                author_name=author_name,
                created_at=r.created_at,
            )
        )

    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)
