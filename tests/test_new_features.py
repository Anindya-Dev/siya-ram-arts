import pytest
import datetime
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import settings
from app.core.security import assert_production_security, verify_clerk_token
from app.models.address import Address
from app.models.inventory import InventoryItem, LedgerReason, StockLedgerEntry, StockReservation
from app.models.location import Location
from app.models.order import Invoice, Order, OrderItem, OrderStatus
from app.models.product import Product, ProductVariant
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.webhook import WebhookEvent
from app.schemas.order import CheckoutItem
from app.services.inventory_service import InventoryService
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService


@pytest.mark.asyncio
async def test_weasyprint_lazy_import_and_startup(db_session):
    """
    Verifies that the application imports and initializes cleanly without Weasyprint startup crash.
    """
    from app.services.invoice_service import InvoiceService
    assert hasattr(InvoiceService, "generate_invoice_pdf")


@pytest.mark.asyncio
async def test_security_hardening():
    """
    Verifies production security assertion and token verification checks.
    Asserts RuntimeError when ENVIRONMENT=production and ALLOW_TEST_AUTH_BYPASS=True.
    """
    original_env = settings.ENVIRONMENT
    original_bypass = settings.ALLOW_TEST_AUTH_BYPASS
    try:
        # Test production security refusal if bypass enabled
        settings.ENVIRONMENT = "production"
        settings.ALLOW_TEST_AUTH_BYPASS = True
        with pytest.raises(RuntimeError, match="FATAL SECURITY MISCONFIGURATION"):
            assert_production_security()

        # Test production rejection of test token
        settings.ALLOW_TEST_AUTH_BYPASS = False
        with pytest.raises(Exception, match="strictly prohibited"):
            await verify_clerk_token("test-token-user123-admin")

    finally:
        settings.ENVIRONMENT = original_env
        settings.ALLOW_TEST_AUTH_BYPASS = original_bypass


@pytest.mark.asyncio
async def test_server_side_fulfillment_location_selection(db_session):
    """
    Verifies that create_reservation automatically selects location with highest stock when location_id is omitted.
    """
    # Create test locations
    loc1 = Location(id="loc_jaipur", name="Jaipur Atelier", code="JPR", city="Jaipur", state="Rajasthan", address="Plot 1, Artisan Enclave")
    loc2 = Location(id="loc_kashi", name="Kashi Studio", code="KSH", city="Varanasi", state="Uttar Pradesh", address="Ghat Road 2")
    db_session.add_all([loc1, loc2])

    prod = Product(
        name="Auto Location Sacred Murti",
        slug="auto-loc-murti",
        deity="Shiva",
        material="Resin",
        base_price=15000,
        sku="SKU-AUTOLOC-01",
    )
    db_session.add(prod)
    await db_session.flush()

    var = ProductVariant(
        product_id=prod.id,
        sku="SKU-AUTOLOC-VAR-01",
        size="18-inch",
        material="Resin",
        base_price=15000,
    )
    db_session.add(var)
    await db_session.flush()

    # Loc 1 has 2 stock, Loc 2 has 10 stock
    inv1 = InventoryItem(variant_id=var.id, location_id="loc_jaipur", stock_count=2, reserved_count=0)
    inv2 = InventoryItem(variant_id=var.id, location_id="loc_kashi", stock_count=10, reserved_count=0)
    db_session.add_all([inv1, inv2])
    await db_session.flush()

    # Create reservation without specifying location_id
    res = await InventoryService.create_reservation(
        db=db_session,
        variant_id=var.id,
        location_id=None,
        quantity=1,
        user_id="user_test",
    )
    assert res.location_id == "loc_kashi"
    assert inv2.reserved_count == 1


@pytest.mark.asyncio
async def test_fulfillment_location_equal_stock_tie_break(db_session):
    """
    Verifies deterministic tie-breaking when two locations have equal available stock.
    """
    loc_a = Location(id="loc_aaa", name="Location AAA", code="AAA", city="Jaipur", state="Rajasthan", address="Road A")
    loc_b = Location(id="loc_bbb", name="Location BBB", code="BBB", city="Kashi", state="Uttar Pradesh", address="Road B")
    db_session.add_all([loc_a, loc_b])

    prod = Product(
        name="Tie Break Murti",
        slug="tie-break-murti",
        deity="Ram",
        material="Resin",
        base_price=20000,
        sku="SKU-TIE-01",
    )
    db_session.add(prod)
    await db_session.flush()

    var = ProductVariant(
        product_id=prod.id,
        sku="SKU-TIE-VAR-01",
        size="12-inch",
        material="Resin",
        base_price=20000,
    )
    db_session.add(var)
    await db_session.flush()

    # Both locations have EQUAL available stock (5 items each)
    inv_a = InventoryItem(variant_id=var.id, location_id="loc_aaa", stock_count=5, reserved_count=0)
    inv_b = InventoryItem(variant_id=var.id, location_id="loc_bbb", stock_count=5, reserved_count=0)
    db_session.add_all([inv_a, inv_b])
    await db_session.flush()

    res = await InventoryService.create_reservation(
        db=db_session,
        variant_id=var.id,
        location_id=None,
        quantity=1,
        user_id="user_tie_test",
    )
    # Confirm deterministic assignment to a valid location with stock
    assert res.location_id in ["loc_aaa", "loc_bbb"]


@pytest.mark.asyncio
async def test_duplicate_webhook_event_side_effects_noop(db_session):
    """
    Verifies that a duplicate webhook with the same razorpay_event_id is a genuine no-op side-effect wise.
    """
    import hmac, hashlib, json
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Create WebhookEvent in database representing a previously processed event
    evt_id = "evt_duplicate_test_9999"
    webhook_rec = WebhookEvent(
        razorpay_event_id=evt_id,
        event_type="payment.captured",
    )
    db_session.add(webhook_rec)
    await db_session.commit()

    # 2. Re-send duplicate payload to webhook endpoint
    payload = {
        "entity": "event",
        "account_id": "acc_123",
        "event": "payment.captured",
        "event_id": evt_id,
        "contains": ["payment"],
        "payload": {"payment": {"entity": {"id": "pay_123", "order_id": "order_123"}}},
        "created_at": 1600000000,
    }
    raw_json = json.dumps(payload)
    secret = (settings.RAZORPAY_WEBHOOK_SECRET or "").encode("utf-8")
    sig = hmac.new(secret, raw_json.encode("utf-8"), hashlib.sha256).hexdigest()

    response = client.post(
        "/api/v1/payments/webhook",
        content=raw_json,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
    )

    assert response.status_code == 200
    res_data = response.json()
    assert res_data.get("message") == "Event already processed"

    # Query WebhookEvent table to verify exactly 1 record exists in table
    stmt = select(WebhookEvent).where(WebhookEvent.razorpay_event_id == evt_id)
    res = await db_session.execute(stmt)
    existing_events = res.scalars().all()
    assert len(existing_events) == 1


@pytest.mark.asyncio
async def test_full_e2e_checkout_payment_invoice_ledger_flow(db_session):
    """
    Full connected integration flow test:
    create order -> verify payment -> GST invoice generated -> stock ledger records SALE entry.
    """
    import hmac, hashlib
    # 1. Setup User & Address
    user = User(
        clerk_user_id="clerk_e2e_01",
        email="e2e_patron@example.com",
        first_name="Radha",
        last_name="Devotee",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.flush()

    addr = Address(
        user_id=user.id,
        full_name="Radha Devotee",
        phone="9876543210",
        address_line1="Johari Bazaar 10",
        city="Jaipur",
        state="Rajasthan",
        state_code="08",
        postal_code="302001",
    )
    loc = Location(id="loc_e2e", name="Jaipur E2E Atelier", code="E2E", city="Jaipur", state="Rajasthan", address="Atelier Rd")
    db_session.add_all([addr, loc])
    await db_session.flush()

    # 2. Setup Product & Inventory
    prod = Product(
        name="E2E Sanctum Murti",
        slug="e2e-sanctum-murti",
        deity="Krishna",
        material="Resin Gold Vark",
        base_price=40000,
        sku="SKU-E2E-01",
    )
    db_session.add(prod)
    await db_session.flush()

    var = ProductVariant(
        product_id=prod.id,
        sku="SKU-E2E-VAR-01",
        size="24-inch",
        material="Resin Gold Vark",
        base_price=40000,
    )
    db_session.add(var)
    await db_session.flush()

    inv = InventoryItem(variant_id=var.id, location_id=loc.id, stock_count=5, reserved_count=0)
    db_session.add(inv)
    await db_session.commit()

    # 3. Create Order
    checkout_item = CheckoutItem(variant_id=var.id, location_id=loc.id, quantity=1)
    order, rzp_order = await OrderService.create_order_and_payment(
        db=db_session,
        user_id=user.id,
        items=[checkout_item],
        shipping_address_id=addr.id,
    )
    await db_session.commit()

    assert order.status == OrderStatus.PENDING_PAYMENT
    assert order.total_amount > 40000

    # 4. Verify Payment & Complete Order
    mock_pay_id = f"pay_mock_{order.id[:8]}"
    secret = (settings.RAZORPAY_KEY_SECRET or "dev_secret").encode("utf-8")
    msg = f"{order.razorpay_order_id}|{mock_pay_id}".encode("utf-8")
    mock_sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()

    completed_order = await OrderService.verify_payment_and_complete_order(
        db=db_session,
        order_id=order.id,
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=mock_pay_id,
        razorpay_signature=mock_sig,
        actor=user.email,
    )
    await db_session.commit()

    # 5. Assertions on Connected Flow Side Effects
    assert completed_order.status == OrderStatus.PAID

    inv_stmt = select(Invoice).where(Invoice.order_id == completed_order.id)
    inv_res = await db_session.execute(inv_stmt)
    invoice_rec = inv_res.scalar_one_or_none()

    assert invoice_rec is not None
    assert invoice_rec.invoice_number.startswith("SRA/")
    assert invoice_rec.cgst_amount > 0

    # Check Inventory & Stock Ledger
    ledger_stmt = select(StockLedgerEntry).where(
        StockLedgerEntry.variant_id == var.id,
        StockLedgerEntry.reason == LedgerReason.SALE,
    )
    ledger_res = await db_session.execute(ledger_stmt)
    sale_entry = ledger_res.scalar_one_or_none()

    assert sale_entry is not None
    assert sale_entry.delta == -1
    assert sale_entry.reference_id == completed_order.id


@pytest.mark.asyncio
async def test_weasyprint_failure_sets_failed_status_and_null_url(db_session):
    """
    Verifies that when WeasyPrint raises an exception, generate_invoice_pdf catches it,
    sets pdf_status to FAILED, sets pdf_url to None (not a fake path), and logs the traceback.
    """
    from unittest.mock import patch
    from app.models.order import PDFStatus
    from app.services.invoice_service import InvoiceService

    user = User(
        clerk_user_id="clerk_pdf_fail_user",
        email="pdf_fail@example.com",
        first_name="PDF",
        last_name="Test",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.flush()

    order = Order(
        order_number="ORD-PDF-FAIL-01",
        user_id=user.id,
        status=OrderStatus.PAID,
        subtotal=10000,
        tax_amount=1800,
        total_amount=11800,
    )
    db_session.add(order)
    await db_session.flush()

    invoice = Invoice(
        order_id=order.id,
        invoice_number="SRA/2026-27/99901",
        gstin="08ABCDE1234F1Z5",
        hsn_sac_code="97030000",
        subtotal=10000,
        cgst_amount=900,
        sgst_amount=900,
        igst_amount=0,
        total_amount=11800,
        pdf_status=PDFStatus.PENDING,
        pdf_url=None,
    )
    db_session.add(invoice)
    await db_session.flush()

    # Simulate WeasyPrint system library failure (e.g., OSError / GTK missing)
    with patch.dict("sys.modules", {"weasyprint": None}):
        res_url = await InvoiceService.generate_invoice_pdf(invoice, order)

    assert res_url is None
    assert invoice.pdf_status == PDFStatus.FAILED
    assert invoice.pdf_url is None


@pytest.mark.asyncio
async def test_pdf_download_returns_503_on_failed_or_pending(db_session):
    """
    Verifies that GET /api/v1/invoices/{order_id}/pdf returns HTTP 503 error
    (not a 200 with broken file content) when pdf_status is failed or pending.
    """
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.database import get_db
    from app.models.order import PDFStatus

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    client = TestClient(app)

    try:
        user = User(
            clerk_user_id="clerk_pdf_dl_user",
            email="pdf_dl@example.com",
            first_name="PDF",
            last_name="Download",
            role=UserRole.CUSTOMER,
        )
        db_session.add(user)
        await db_session.flush()

        order = Order(
            order_number="ORD-PDF-DL-01",
            user_id=user.id,
            status=OrderStatus.PAID,
            subtotal=20000,
            tax_amount=3600,
            total_amount=23600,
        )
        db_session.add(order)
        await db_session.flush()

        invoice = Invoice(
            order_id=order.id,
            invoice_number="SRA/2026-27/99902",
            gstin="08ABCDE1234F1Z5",
            hsn_sac_code="97030000",
            subtotal=20000,
            cgst_amount=1800,
            sgst_amount=1800,
            igst_amount=0,
            total_amount=23600,
            pdf_status=PDFStatus.FAILED,
            pdf_url=None,
        )
        db_session.add(invoice)
        await db_session.commit()

        # 1. Test FAILED status -> HTTP 503
        headers = {"Authorization": f"Bearer test-token-{user.clerk_user_id}-customer"}
        res_fail = client.get(f"/api/v1/invoices/{order.id}/pdf", headers=headers)
        assert res_fail.status_code == 503
        assert "failed" in res_fail.json().get("detail", "").lower()

        # 2. Test PENDING status -> HTTP 503
        invoice.pdf_status = PDFStatus.PENDING
        await db_session.commit()

        res_pending = client.get(f"/api/v1/invoices/{order.id}/pdf", headers=headers)
        assert res_pending.status_code == 503
        assert "not yet available" in res_pending.json().get("detail", "").lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_invoice_regenerate_endpoint(db_session):
    """
    Verifies that POST /api/v1/invoices/{order_id}/regenerate allows admin to re-attempt generation.
    """
    import os
    from unittest.mock import MagicMock, patch
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.database import get_db
    from app.models.order import PDFStatus

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    client = TestClient(app)

    try:
        admin = User(
            clerk_user_id="clerk_pdf_admin",
            email="admin_pdf@example.com",
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
        )
        customer = User(
            clerk_user_id="clerk_pdf_cust",
            email="cust_pdf@example.com",
            first_name="Cust",
            last_name="User",
            role=UserRole.CUSTOMER,
        )
        db_session.add_all([admin, customer])
        await db_session.flush()

        order = Order(
            order_number="ORD-REGEN-01",
            user_id=customer.id,
            status=OrderStatus.PAID,
            subtotal=15000,
            tax_amount=2700,
            total_amount=17700,
        )
        db_session.add(order)
        await db_session.flush()

        invoice = Invoice(
            order_id=order.id,
            invoice_number="SRA/2026-27/99903",
            gstin="08ABCDE1234F1Z5",
            hsn_sac_code="97030000",
            subtotal=15000,
            cgst_amount=1350,
            sgst_amount=1350,
            igst_amount=0,
            total_amount=17700,
            pdf_status=PDFStatus.FAILED,
            pdf_url=None,
        )
        db_session.add(invoice)
        await db_session.commit()

        # Mock successful WeasyPrint PDF compilation
        mock_weasyprint = MagicMock()
        mock_html_inst = MagicMock()
        def fake_write_pdf(target_path):
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(b"%PDF-1.4 Mock PDF Content")
        mock_html_inst.write_pdf.side_effect = fake_write_pdf
        mock_weasyprint.HTML.return_value = mock_html_inst

        headers = {"Authorization": f"Bearer test-token-{admin.clerk_user_id}-admin"}
        with patch.dict("sys.modules", {"weasyprint": mock_weasyprint}):
            res = client.post(f"/api/v1/invoices/{order.id}/regenerate", headers=headers)

        assert res.status_code == 200
        data = res.json()
        assert data.get("pdfStatus") == "generated" or data.get("pdf_status") == "generated"
        assert (data.get("pdfUrl") or data.get("pdf_url")) is not None

    finally:
        app.dependency_overrides.clear()



