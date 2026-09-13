import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.errors import BusinessRuleViolationError, ResourceNotFoundError
from app.core.security import get_current_user, require_staff_or_admin
from app.models.inventory import InventoryItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.product import (
    ProductCreate,
    ProductRead,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantRead,
)

router = APIRouter(prefix="/products", tags=["Products & Catalog"])


def _compute_variant_stock(variant: ProductVariant) -> int:
    total = 0
    if hasattr(variant, "inventory_items") and variant.inventory_items:
        for item in variant.inventory_items:
            total += max(0, item.stock_count - item.reserved_count)
    return total


async def _compute_product_reviews_stats(db: AsyncSession, product_id: str) -> tuple[float, int]:
    from sqlalchemy import func
    from app.models.review import Review
    stmt = select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == product_id)
    res = await db.execute(stmt)
    avg_rating, count = res.one_or_none() or (None, 0)
    avg_val = round(float(avg_rating), 1) if avg_rating is not None else 0.0
    return avg_val, count or 0


@router.get("", response_model=PaginatedResponse[ProductRead])
async def list_products(
    deity: Optional[str] = Query(None, description="Filter by deity (e.g. Ram Darbar, Krishna, Shiva)"),
    material: Optional[str] = Query(None, description="Filter by material (e.g. Chemical Resin)"),
    search: Optional[str] = Query(None, description="Search query across name and description"),
    min_price: Optional[int] = Query(None, ge=0),
    max_price: Optional[int] = Query(None, ge=0),
    featured_only: Optional[bool] = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Public catalog endpoint with structured filtering, search, and pagination.
    Excludes soft-deleted products.
    """
    query = (
        select(Product)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.inventory_items)
        )
        .where(Product.deleted_at.is_(None))
    )

    if deity:
        query = query.where(Product.deity.ilike(f"%{deity}%"))
    if material:
        query = query.where(Product.material.ilike(f"%{material}%"))
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(term),
                Product.short_description.ilike(term),
                Product.long_description.ilike(term),
                Product.sku.ilike(term),
            )
        )
    if min_price is not None:
        query = query.where(Product.base_price >= min_price)
    if max_price is not None:
        query = query.where(Product.base_price <= max_price)
    if featured_only:
        query = query.where(Product.is_featured_masterpiece.is_(True))

    query = query.order_by(Product.featured_order.asc().nulls_last(), Product.created_at.desc())

    # Execute
    result = await db.execute(query)
    all_products = result.scalars().all()
    total = len(all_products)

    # In-memory slice for pagination
    start = (page - 1) * limit
    paged = all_products[start : start + limit]

    items = []
    for prod in paged:
        prod_read = ProductRead.model_validate(prod)
        for idx, variant in enumerate(prod.variants):
            prod_read.variants[idx].total_available_stock = _compute_variant_stock(variant)
        rating_val, review_cnt = await _compute_product_reviews_stats(db, prod.id)
        prod_read.rating = rating_val
        prod_read.review_count = review_cnt
        items.append(prod_read)

    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)


@router.get("/{slug}", response_model=ProductRead)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves full details for a product by its unique slug.
    """
    stmt = (
        select(Product)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.inventory_items)
        )
        .where(Product.slug == slug, Product.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise ResourceNotFoundError("Product", slug)

    prod_read = ProductRead.model_validate(product)
    for idx, variant in enumerate(product.variants):
        prod_read.variants[idx].total_available_stock = _compute_variant_stock(variant)
    rating_val, review_cnt = await _compute_product_reviews_stats(db, product.id)
    prod_read.rating = rating_val
    prod_read.review_count = review_cnt
    return prod_read


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new product with variants. Restricted to Staff and Admins.
    """
    # Check slug uniqueness
    existing_stmt = select(Product).where(Product.slug == data.slug)
    res = await db.execute(existing_stmt)
    if res.scalar_one_or_none():
        raise BusinessRuleViolationError(f"Product with slug '{data.slug}' already exists")

    carver_quote_dict = data.carver_quote.model_dump() if data.carver_quote else None

    product = Product(
        name=data.name,
        slug=data.slug,
        deity=data.deity,
        deity_form=data.deity_form,
        material=data.material,
        material_purity=data.material_purity,
        base_price=data.base_price,
        original_price=data.original_price,
        discount_badge=data.discount_badge,
        sku=data.sku,
        atelier=data.atelier,
        short_description=data.short_description,
        long_description=data.long_description,
        certificate_number=data.certificate_number,
        is_featured_masterpiece=data.is_featured_masterpiece,
        featured_order=data.featured_order,
        specifications=data.specifications,
        seva_guidelines=data.seva_guidelines,
        images=data.images,
        tags=data.tags,
        carver_quote=carver_quote_dict,
    )
    db.add(product)
    await db.flush()

    for v in data.variants:
        variant = ProductVariant(
            product_id=product.id,
            sku=v.sku,
            size=v.size,
            material=v.material,
            finish=v.finish,
            base_price=v.base_price,
            price_delta=v.price_delta,
            is_active=v.is_active,
        )
        db.add(variant)

    await db.flush()
    # Reload with variants
    stmt = (
        select(Product)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.inventory_items)
        )
        .where(Product.id == product.id)
    )
    reloaded = (await db.execute(stmt)).scalar_one()
    prod_read = ProductRead.model_validate(reloaded)
    for idx, variant in enumerate(reloaded.variants):
        prod_read.variants[idx].total_available_stock = 0
    return prod_read


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates an existing product. Restricted to Staff and Admins.
    """
    stmt = (
        select(Product)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.inventory_items)
        )
        .where(Product.id == product_id, Product.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise ResourceNotFoundError("Product", product_id)

    update_dict = data.model_dump(exclude_unset=True)
    if "carver_quote" in update_dict and update_dict["carver_quote"]:
        update_dict["carver_quote"] = data.carver_quote.model_dump() if data.carver_quote else None

    for key, value in update_dict.items():
        setattr(product, key, value)

    await db.flush()
    prod_read = ProductRead.model_validate(product)
    for idx, variant in enumerate(product.variants):
        prod_read.variants[idx].total_available_stock = _compute_variant_stock(variant)
    rating_val, review_cnt = await _compute_product_reviews_stats(db, product.id)
    prod_read.rating = rating_val
    prod_read.review_count = review_cnt
    return prod_read


@router.delete("/{product_id}", response_model=MessageResponse)
async def soft_delete_product(
    product_id: str,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft-deletes a product by timestamping deleted_at.
    Historical orders reference variants directly and will never fail.
    """
    stmt = select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise ResourceNotFoundError("Product", product_id)

    product.deleted_at = datetime.datetime.now(datetime.timezone.utc)
    await db.flush()
    return MessageResponse(message=f"Product '{product.name}' successfully soft-deleted")
