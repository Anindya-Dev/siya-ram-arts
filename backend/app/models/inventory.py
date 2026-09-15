import datetime
import enum
import uuid
from typing import Optional
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class LedgerReason(str, enum.Enum):
    RESTOCK = "restock"
    SALE = "sale"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    DAMAGE = "damage"
    RESERVATION = "reservation"
    RESERVATION_RELEASED = "reservation_released"


class ReservationStatus(str, enum.Enum):
    ACTIVE = "active"
    CONVERTED = "converted"
    EXPIRED = "expired"
    RELEASED = "released"


class InventoryItem(Base, TimestampMixin):
    __tablename__ = "inventory_items"
    __table_args__ = (
        UniqueConstraint("variant_id", "location_id", name="uq_variant_location"),
        CheckConstraint("stock_count >= 0", name="chk_stock_count_non_negative"),
        CheckConstraint("reserved_count >= 0", name="chk_reserved_count_non_negative"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    variant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    location_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    stock_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=2, nullable=False)

    # Relationships
    variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="inventory_items")
    location: Mapped["Location"] = relationship("Location", back_populates="inventory_items")

    @property
    def available_count(self) -> int:
        return max(0, self.stock_count - self.reserved_count)

    @property
    def is_low_stock(self) -> bool:
        return self.available_count <= self.low_stock_threshold


class StockLedgerEntry(Base):
    """
    Immutable audit log.
    Every single inventory modification (delta) must insert a ledger entry.
    """
    __tablename__ = "stock_ledger_entries"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    variant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("product_variants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    location_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    delta: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. +5, -1, 0
    reason: Mapped[LedgerReason] = mapped_column(
        Enum(LedgerReason, name="ledger_reason_enum", native_enum=False),
        nullable=False,
        index=True,
    )
    actor: Mapped[str] = mapped_column(String(128), default="system", nullable=False)
    reference_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )


class StockReservation(Base, TimestampMixin):
    """
    Temporary hold on inventory during checkout.
    Expires automatically if payment is not completed within reservation window.
    """
    __tablename__ = "stock_reservations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    variant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    location_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    order_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus, name="reservation_status_enum", native_enum=False),
        default=ReservationStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
