import enum
import uuid
from typing import Any, Dict, Optional
from sqlalchemy import Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class ProductionStatus(str, enum.Enum):
    REQUESTED = "requested"
    QUOTED = "quoted"
    DEPOSIT_PAID = "deposit_paid"
    IN_PRODUCTION = "in_production"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CustomOrderRequest(Base, TimestampMixin):
    """
    Dedicated entity for made-to-order sculpted murtis and custom temple commissions.
    Operates independently from standard inventory stock.
    """
    __tablename__ = "custom_order_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    request_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    deity: Mapped[str] = mapped_column(String(100), nullable=False)
    requested_dimensions: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "36-inch height, 20-inch base"
    medium_preference: Mapped[str] = mapped_column(String(150), nullable=False)
    specifications: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    reference_images: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    devotee_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Quotation and financials (in INR)
    quoted_total_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    deposit_required_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    balance_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Payment references
    deposit_razorpay_order_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    deposit_razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    balance_razorpay_order_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    balance_razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    production_status: Mapped[ProductionStatus] = mapped_column(
        Enum(ProductionStatus, name="production_status_enum", native_enum=False),
        default=ProductionStatus.REQUESTED,
        nullable=False,
        index=True,
    )
    artisan_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="custom_orders")
