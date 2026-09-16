import datetime
import io
import uuid
from unittest.mock import AsyncMock, patch
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_staff_or_admin
from app.main import app
from app.models.address import Address
from app.models.inventory import InventoryItem, LedgerReason, StockLedgerEntry
from app.models.location import Location
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant
from app.models.user import User, UserRole
from app.services.imagekit_service import ImageKitService
from app.services.order_service import OrderService
from app.schemas.order import CheckoutItem


@pytest.fixture
def mock_admin():
    return User(
        id=str(uuid.uuid4()),
        clerk_user_id="clerk_admin_123",
        email="admin@siyaramarts.com",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
    )


@pytest_asyncio.fixture
async def admin_client(db_session, mock_admin):
    async def override_get_db():
        yield db_session

    async def override_require_admin():
        return mock_admin

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_staff_or_admin] = override_require_admin

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_image_upload_503_when_unset(admin_client):
    """
    Verifies that POST /api/v1/images/upload returns 503 when ImageKit keys are not configured.
    """
    with patch.object(ImageKitService, "is_configured", return_value=False):
        files = {"file": ("test.jpg", b"fake_jpg_content", "image/jpeg")}
        res = await admin_client.post("/api/v1/images/upload", files=files)
        assert res.status_code == 503
        data = res.json()
        assert "ImageKit" in data.get("detail", "")


@pytest.mark.asyncio
async def test_image_upload_success(admin_client):
    """
    Verifies that POST /api/v1/images/upload succeeds and returns url, fileId, name, size.
    """
    mock_upload_resp = {
        "url": "https://ik.imagekit.io/test/idols/mock-img.webp",
        "file_id": "ik_file_12345",
        "name": "mock-img.webp",
        "size": 1024,
    }
    with patch.object(ImageKitService, "is_configured", return_value=True), \
         patch.object(ImageKitService, "upload_file") as mock_upload:
        mock_upload.return_value = mock_upload_resp

        files = {"file": ("test.png", b"test_content_bytes", "image/png")}
        res = await admin_client.post("/api/v1/images/upload", files=files)
        assert res.status_code in (200, 201)
        data = res.json()
        assert data["url"] == mock_upload_resp["url"]
        assert data["fileId"] == mock_upload_resp["file_id"]
        assert data["name"] == mock_upload_resp["name"]
        assert data["size"] == mock_upload_resp["size"]


@pytest.mark.asyncio
async def test_rich_product_create_with_stock(admin_client, db_session):
    """
    Verifies rich product creation creates variants, InventoryItem rows, and StockLedgerEntry rows.
    """
    # Ensure JPR and KSH locations exist
    for code, name in [("JPR", "Jaipur"), ("KSH", "Kashi")]:
        loc = (await db_session.execute(select(Location).where(Location.code == code))).scalar_one_or_none()
        if not loc:
            db_session.add(Location(code=code, name=name, address="Test Addr", city=name, state="RJ"))
    await db_session.flush()

    slug = f"test-ram-idol-{uuid.uuid4().hex[:6]}"
    sku = f"RAM-{uuid.uuid4().hex[:4]}"

    payload = {
        "name": "Ram Lalla Sacred Murti",
        "slug": slug,
        "deity": "Ram Lalla",
        "deityForm": "Ayodhya Balak Ram",
        "material": "Chemical Resin",
        "materialPurity": "Cast Composite",
        "basePrice": 45000,
        "originalPrice": 52000,
        "discountBadge": "Inaugural Blessing",
        "sku": sku,
        "atelier": "Jaipur Atelier",
        "shortDescription": "Sacred idol for home sanctum",
        "longDescription": "Detailed idol crafted with spiritual precision.",
        "certificateNumber": "SRA-TEST-001",
        "isFeaturedMasterpiece": True,
        "specifications": {"Height": "24 inches", "Weight": "8.5 kg"},
        "sevaGuidelines": {"Panchamrit": "Allowed with soft microfiber wipe"},
        "images": [
            {"url": "https://ik.imagekit.io/test/ram1.webp", "alt": "Front view", "isPrimary": True, "fileId": "ik_ram_1"},
            {"url": "/static/images/local.jpg", "alt": "Local preview", "isPrimary": False}
        ],
        "tags": ["Ram", "Ayodhya"],
        "carverQuote": {
            "quote": "Every chisel stroke brings divinity forward.",
            "artisanName": "Master Ramdas",
            "artisanTitle": "Chief Sculptor"
        },
        "variants": [
            {
                "size": "24-inch",
                "material": "Chemical Resin",
                "finish": "24K Gold Foil",
                "basePrice": 45000,
                "priceDelta": 0,
                "sku": f"{sku}-24",
                "isActive": True,
                "stock": {"JPR": 3, "KSH": 2}
            }
        ]
    }

    res = await admin_client.post("/api/v1/products", json=payload)
    assert res.status_code == 201
    prod_data = res.json()
    assert prod_data["slug"] == slug
    assert len(prod_data["variants"]) == 1
    assert prod_data["variants"][0]["totalAvailableStock"] == 5

    # Verify InventoryItems
    variant_id = prod_data["variants"][0]["id"]
    inv_items = (await db_session.execute(select(InventoryItem).where(InventoryItem.variant_id == variant_id))).scalars().all()
    assert len(inv_items) == 2
    total_inv = sum(item.stock_count for item in inv_items)
    assert total_inv == 5

    # Verify StockLedgerEntries
    ledger_entries = (await db_session.execute(select(StockLedgerEntry).where(StockLedgerEntry.variant_id == variant_id))).scalars().all()
    assert len(ledger_entries) == 2
    for entry in ledger_entries:
        assert entry.reason == LedgerReason.RESTOCK
        assert entry.reference_id == f"INIT-{sku}-24"


@pytest.mark.asyncio
async def test_soft_delete_cleans_imagekit_files(admin_client, db_session):
    """
    Verifies soft deleting a product deletes ImageKit files (with fileId) but skips local /static images.
    """
    slug = f"delete-test-{uuid.uuid4().hex[:6]}"
    prod = Product(
        name="Temporary Idol",
        slug=slug,
        deity="Shiva",
        material="Chemical Resin",
        base_price=30000,
        sku=f"SHIVA-{uuid.uuid4().hex[:4]}",
        images=[
            {"url": "https://ik.imagekit.io/test/shiva.webp", "alt": "Shiva", "isPrimary": True, "fileId": "file_del_123"},
            {"url": "/static/images/shiva_local.jpg", "alt": "Local", "isPrimary": False, "fileId": "file_del_local"},
            {"url": "https://example.com/no-file-id.jpg", "alt": "External", "isPrimary": False}
        ]
    )
    db_session.add(prod)
    await db_session.flush()

    with patch.object(ImageKitService, "delete_file") as mock_delete:
        mock_delete.return_value = True
        res = await admin_client.delete(f"/api/v1/products/{prod.id}")
        assert res.status_code == 200

        # Should only delete "file_del_123"; local /static is skipped even if fileId is present
        mock_delete.assert_called_once_with("file_del_123")

    # DB record is soft deleted, not hard deleted
    res = await db_session.execute(select(Product).where(Product.id == prod.id))
    fetched = res.scalar_one()
    assert fetched.deleted_at is not None


@pytest.mark.asyncio
async def test_update_product_image_diffing_and_variant_guard(admin_client, db_session):
    """
    Verifies:
    1. Removing an image with fileId calls ImageKitService.delete_file.
    2. Attempting to delete a variant that has inventory raises 422.
    """
    slug = f"update-test-{uuid.uuid4().hex[:6]}"
    prod = Product(
        name="Ganesh Murti",
        slug=slug,
        deity="Ganesh",
        material="Chemical Resin",
        base_price=25000,
        sku=f"GAN-{uuid.uuid4().hex[:4]}",
        images=[
            {"url": "https://ik.imagekit.io/test/keep.webp", "alt": "Keep", "isPrimary": True, "fileId": "file_keep_1"},
            {"url": "https://ik.imagekit.io/test/remove.webp", "alt": "Remove", "isPrimary": False, "fileId": "file_remove_2"},
        ]
    )
    db_session.add(prod)
    await db_session.flush()

    var = ProductVariant(
        product_id=prod.id,
        sku=f"{prod.sku}-12",
        size="12-inch",
        material="Chemical Resin",
        finish="Matte",
        base_price=25000,
        price_delta=0,
        is_active=True,
    )
    db_session.add(var)
    await db_session.flush()

    # Add dummy location and inventory item to block deletion
    loc = (await db_session.execute(select(Location).limit(1))).scalar_one_or_none()
    if not loc:
        loc = Location(code="JPR", name="Jaipur", address="Test", city="Jaipur", state="RJ")
        db_session.add(loc)
        await db_session.flush()

    inv = InventoryItem(variant_id=var.id, location_id=loc.id, stock_count=4, reserved_count=0)
    db_session.add(inv)
    await db_session.flush()

    # 1. Update payload that removes file_remove_2
    with patch.object(ImageKitService, "delete_file") as mock_delete:
        mock_delete.return_value = True
        update_payload = {
            "name": "Ganesh Murti Blessed",
            "images": [
                {"url": "https://ik.imagekit.io/test/keep.webp", "alt": "Keep", "isPrimary": True, "fileId": "file_keep_1"},
                {"url": "https://ik.imagekit.io/test/new.webp", "alt": "New", "isPrimary": False, "fileId": "file_new_3"},
            ]
        }
        res = await admin_client.put(f"/api/v1/products/{prod.id}", json=update_payload)
        assert res.status_code == 200
        mock_delete.assert_called_once_with("file_remove_2")

    # 2. Attempt to update variants removing the variant with inventory -> must fail with 422
    fail_payload = {
        "variants": []  # Omits the existing variant that has 4 items in stock
    }
    res = await admin_client.put(f"/api/v1/products/{prod.id}", json=fail_payload)
    assert res.status_code == 422
    assert "Cannot delete variant" in res.json().get("detail", "")


@pytest.mark.asyncio
async def test_order_snapshot_includes_image_url(db_session):
    """
    Verifies that OrderService.create_order includes the product primary image URL in variant_snapshot.
    """
    # Create product with primary image
    prod = Product(
        name="Hanuman Ji Murti",
        slug=f"hanuman-{uuid.uuid4().hex[:6]}",
        deity="Hanuman Ji",
        material="Chemical Resin",
        base_price=38000,
        sku=f"HAN-{uuid.uuid4().hex[:4]}",
        images=[
            {"url": "https://ik.imagekit.io/test/hanuman_primary.webp", "alt": "Hanuman", "isPrimary": True, "fileId": "ik_han_1"}
        ]
    )
    db_session.add(prod)
    await db_session.flush()

    variant = ProductVariant(
        product_id=prod.id,
        sku=f"{prod.sku}-18",
        size="18-inch",
        material="Chemical Resin",
        finish="Polished",
        base_price=38000,
        price_delta=0,
        is_active=True,
    )
    db_session.add(variant)
    await db_session.flush()

    loc = (await db_session.execute(select(Location).limit(1))).scalar_one_or_none()
    if not loc:
        loc = Location(code="JPR", name="Jaipur", address="Test", city="Jaipur", state="RJ")
        db_session.add(loc)
        await db_session.flush()

    inv = InventoryItem(variant_id=variant.id, location_id=loc.id, stock_count=5, reserved_count=0)
    db_session.add(inv)

    user = User(
        clerk_user_id=f"user_{uuid.uuid4().hex[:6]}",
        email="bhakt@example.com",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.flush()

    addr = Address(
        user_id=user.id,
        full_name="Devotee Sharma",
        phone="9876543210",
        address_line1="108 Temple Street",
        city="Jaipur",
        state="Rajasthan",
        state_code="08",
        postal_code="302001",
        country="India",
    )
    db_session.add(addr)
    await db_session.flush()

    checkout_item = CheckoutItem(variant_id=variant.id, location_id=loc.id, quantity=1)

    with patch("app.services.payment_service.PaymentService.create_razorpay_order", return_value={"id": "order_rzp_mock_123"}):
        order, _ = await OrderService.create_order_and_payment(
            db=db_session,
            user_id=user.id,
            items=[checkout_item],
            shipping_address_id=addr.id,
        )
        assert order is not None
        items_res = await db_session.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        order_items = items_res.scalars().all()
        assert len(order_items) == 1
        snapshot = order_items[0].variant_snapshot
        assert "image_url" in snapshot
        assert snapshot["image_url"] == "https://ik.imagekit.io/test/hanuman_primary.webp"
