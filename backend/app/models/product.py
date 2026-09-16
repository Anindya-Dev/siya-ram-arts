import datetime
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    deity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    deity_form: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    material: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    material_purity: Mapped[str] = mapped_column(String(150), default="", nullable=False)
    base_price: Mapped[int] = mapped_column(Integer, nullable=False)  # in INR
    original_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    discount_badge: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    atelier: Mapped[str] = mapped_column(String(150), default="Jaipur Atelier", nullable=False)
    short_description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    long_description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    certificate_number: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    is_featured_masterpiece: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    featured_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Rich iconographic details stored as structured JSON
    specifications: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    seva_guidelines: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    images: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    carver_quote: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    # Soft delete: historical orders always retain product reference
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None, index=True
    )

    # Relationships
    variants: Mapped[List["ProductVariant"]] = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan"
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class ProductVariant(Base, TimestampMixin):
    __tablename__ = "product_variants"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    size: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "18-inch"
    material: Mapped[str] = mapped_column(String(100), nullable=False)
    finish: Mapped[str] = mapped_column(String(150), default="Polished", nullable=False)
    base_price: Mapped[int] = mapped_column(Integer, nullable=False)  # in INR
    price_delta: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    inventory_items: Mapped[List["InventoryItem"]] = relationship(
        "InventoryItem", back_populates="variant", cascade="all, delete-orphan"
    )
