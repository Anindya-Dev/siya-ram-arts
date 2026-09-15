import uuid
import pytest
from sqlalchemy import select
from app.models.custom_order import CustomOrderRequest, ProductionStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.custom_order import CustomOrderCreate, CustomOrderQuoteUpdate
from app.services.custom_order_service import CustomOrderService


@pytest.mark.asyncio
async def test_custom_order_staged_lifecycle(db_session):
    """
    Tests made-to-order flow:
    1. Devotee submits commission request
    2. Staff quotes price and deposit
    3. Deposit paid advances to IN_PRODUCTION
    4. Balance paid advances to COMPLETED
    Does not touch standard inventory.
    """
    user = User(
        id=str(uuid.uuid4()),
        clerk_user_id=f"user_{uuid.uuid4().hex[:6]}",
        email=f"devotee_{uuid.uuid4().hex[:4]}@example.com",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.flush()

    create_data = CustomOrderCreate(
        deity="Hanuman Ji",
        requested_dimensions="36-inch height, 24-inch base",
        medium_preference="Chemical Resin (Cast Composite)",
        specifications={"Pose": "Veer Hanuman with Gada and Sanjeevani Hill"},
        reference_images=[],
        devotee_notes="Intended for family temple consecration.",
    )

    # 1. Request
    custom_order = await CustomOrderService.create_custom_order_request(
        db=db_session, user_id=user.id, data=create_data
    )
    assert custom_order.production_status == ProductionStatus.REQUESTED
    assert custom_order.request_number.startswith("SRA-COMM-")

    # 2. Quote
    quote = CustomOrderQuoteUpdate(
        quoted_total_price=95000,
        deposit_required_amount=30000,
        artisan_notes="Estimated 35 days carving & curing in Jaipur atelier.",
    )
    quoted_order = await CustomOrderService.provide_quote(
        db=db_session, custom_order_id=custom_order.id, quote=quote
    )
    assert quoted_order.production_status == ProductionStatus.QUOTED
    assert quoted_order.balance_amount == 65000

    # 3. Deposit payment simulation
    import hashlib
    import hmac
    from app.core.config import settings
    
    dep_order_id = "rzp_ord_dep_123"
    dep_payment_id = "rzp_pay_dep_456"
    dep_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{dep_order_id}|{dep_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    dep_verified = await CustomOrderService.verify_deposit_payment(
        db=db_session,
        custom_order_id=custom_order.id,
        razorpay_order_id=dep_order_id,
        razorpay_payment_id=dep_payment_id,
        razorpay_signature=dep_sig,
    )
    assert dep_verified.production_status == ProductionStatus.IN_PRODUCTION

    # 4. Balance payment simulation
    bal_order_id = "rzp_ord_bal_789"
    bal_payment_id = "rzp_pay_bal_012"
    bal_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{bal_order_id}|{bal_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    bal_verified = await CustomOrderService.verify_balance_payment(
        db=db_session,
        custom_order_id=custom_order.id,
        razorpay_order_id=bal_order_id,
        razorpay_payment_id=bal_payment_id,
        razorpay_signature=bal_sig,
    )
    assert bal_verified.production_status == ProductionStatus.COMPLETED


@pytest.mark.asyncio
async def test_product_soft_delete(db_session):
    """
    Verifies soft delete leaves product record intact in database with deleted_at timestamp.
    """
    prod = Product(
        id=str(uuid.uuid4()),
        slug=f"soft-delete-murti-{uuid.uuid4().hex[:4]}",
        name="Soft Delete Krishna (Chemical Resin)",
        deity="Krishna",
        material="Chemical Resin",
        base_price=35000,
        sku=f"SKU-SD-{uuid.uuid4().hex[:4]}",
    )
    db_session.add(prod)
    await db_session.commit()

    assert prod.is_deleted is False

    # Perform soft-delete
    prod.deleted_at = pytest.importorskip("datetime").datetime.now(pytest.importorskip("datetime").timezone.utc)
    await db_session.commit()

    # Re-query
    res = await db_session.execute(select(Product).where(Product.id == prod.id))
    fetched = res.scalar_one()
    assert fetched.is_deleted is True
    assert fetched.deleted_at is not None
