"""
Integration test: POST /api/v1/products flow against Supabase Postgres.

Skipped automatically when:
- DATABASE_URL is not set, or
- DATABASE_URL points to SQLite (not a real Postgres test).

Run:
    # Requires live Supabase Postgres credentials in .env
    python -m pytest tests/test_supabase_products_integration.py -v
"""
import os
import uuid
import pytest
import pytest_asyncio

# ── Skip when not configured for Postgres ────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL or "sqlite" in DATABASE_URL.lower() or "postgresql" not in DATABASE_URL.lower():
    pytest.skip(
        "Supabase Postgres integration test skipped: set DATABASE_URL to a Postgres URL to run.",
        allow_module_level=True,
    )

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.database import get_db          # ← correct path (not app.db.database)
from app.models.product import Product, ProductVariant
from app.models.inventory import InventoryItem, Location


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="module")
async def pg_engine():
    """Create an async engine connected to Supabase Postgres."""
    engine = create_async_engine(DATABASE_URL, echo=False)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="module")
async def pg_session(pg_engine):
    """Provide an async session scoped to the test module."""
    async_factory = async_sessionmaker(pg_engine, expire_on_commit=False)
    async with async_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="module")
async def seeded_product(pg_session: AsyncSession):
    """
    Seed a minimal product + variant + location + inventory into Supabase Postgres
    for use by HTTP tests.  Cleaned up after the module finishes.
    """
    # --- Location ---
    loc_id = str(uuid.uuid4())
    location = Location(
        id=loc_id,
        code=f"TST-{loc_id[:6]}",
        name="Test Integration Atelier",
        address="1 Test Street",
        city="Jaipur",
        state="Rajasthan",
        is_active=True,
    )
    pg_session.add(location)
    await pg_session.flush()

    # --- Product ---
    product_id = str(uuid.uuid4())
    product_slug = f"integration-test-murti-{product_id[:8]}"
    product = Product(
        id=product_id,
        name="Integration Test Krishna Idol",
        slug=product_slug,
        deity="Shri Krishna",
        deity_form="Tribhanga Muralidhar",
        material="White Marble Resin",
        material_purity="High-Grade Resin",
        base_price=38500,
        sku=f"SRA-INT-{product_id[:8]}",
        atelier="Jaipur Atelier",
        short_description="Integration test product.",
        certificate_number="SRA-CERT-INT-01",
        is_featured_masterpiece=True,
        specifications={
            "canonicalForm": "Tribhanga Muralidhar",
            "primaryMedium": "White Marble Resin",
            "ornamentationGrade": "24K Gold Ornaments",
            "mudrasAttributes": "Venu Mudra",
            "pedestalFoundation": "Pink Lotus Base",
            "archComposition": "Single standing figure",
            "authenticationSeal": "SRA-CERT-INT-01",
            "netWeight": "11.2 kg",
            "heightWidth": "15-inch height, 7-inch width",
            "provenance": "Jaipur Artisan Atelier, Rajasthan",
            "pratishthaStatus": "Pratishtha-ready",
            "craftsmanshipTime": "21 Days",
        },
        images=[
            {"url": "/static/idols/integration-test-krishna.png", "alt": "Integration Test", "isPrimary": True}
        ],
        tags=["Integration", "Test"],
        seva_guidelines={"Abhishekam": "Test wipe.", "Placement": "Test altar"},
    )
    pg_session.add(product)
    await pg_session.flush()

    # --- Variant ---
    variant_id = str(uuid.uuid4())
    variant = ProductVariant(
        id=variant_id,
        product_id=product_id,
        size="15-inch",
        material="White Marble Resin",
        finish="Gold Painted",
        base_price=38500,
        price_delta=0,
        sku=f"SRA-INT-{product_id[:8]}-15",
        is_active=True,
    )
    pg_session.add(variant)
    await pg_session.flush()

    # --- Inventory ---
    inv = InventoryItem(
        id=str(uuid.uuid4()),
        variant_id=variant_id,
        location_id=loc_id,
        stock_count=5,
        reserved_count=0,
        low_stock_threshold=2,
    )
    pg_session.add(inv)
    await pg_session.commit()

    yield {
        "product_id": product_id,
        "product_slug": product_slug,
        "variant_id": variant_id,
        "location_id": loc_id,
    }

    # Cleanup
    await pg_session.delete(inv)
    await pg_session.delete(variant)
    await pg_session.delete(product)
    await pg_session.delete(location)
    await pg_session.commit()


@pytest_asyncio.fixture(scope="module")
async def override_db(pg_session):
    """Override the FastAPI get_db dependency to use our Postgres session."""
    async def _get_pg_db():
        yield pg_session

    app.dependency_overrides[get_db] = _get_pg_db
    yield
    app.dependency_overrides.pop(get_db, None)


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_products_camelcase_response(seeded_product, override_db):
    """
    GET /api/v1/products should return camelCase fields (to_camel serialisation).
    Asserts: totalPages, isFeaturedMasterpiece present; totalAvailableStock is an integer.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get("/api/v1/products?page=1&limit=100")

    assert response.status_code == 200, response.text
    body = response.json()

    # Paginated wrapper check
    assert "items" in body
    assert "totalPages" in body, "Expected camelCase 'totalPages' in paginated response"
    assert "total" in body

    # Find the seeded product
    items = body["items"]
    seeded = next(
        (p for p in items if p["id"] == seeded_product["product_id"]),
        None,
    )
    assert seeded is not None, f"Seeded product {seeded_product['product_id']} not found in GET /products response"

    # camelCase field checks
    assert "isFeaturedMasterpiece" in seeded, "Expected camelCase 'isFeaturedMasterpiece'"
    assert seeded["isFeaturedMasterpiece"] is True
    assert "basePrice" in seeded, "Expected camelCase 'basePrice'"
    assert seeded["basePrice"] == 38500

    # Variant fields
    variants = seeded.get("variants", [])
    assert len(variants) > 0, "Expected at least one variant"
    v = variants[0]
    assert "totalAvailableStock" in v, "Expected camelCase 'totalAvailableStock' on variant"
    assert isinstance(v["totalAvailableStock"], int)
    assert v["totalAvailableStock"] == 5


@pytest.mark.asyncio
async def test_get_product_by_slug_images_isprimary(seeded_product, override_db):
    """
    GET /api/v1/products/{slug} should:
    - Return 200
    - Return images with 'isPrimary' (camelCase, stored as-is in JSON column)
    - Return canonical spec keys in specifications dict
    """
    slug = seeded_product["product_slug"]
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get(f"/api/v1/products/{slug}")

    assert response.status_code == 200, f"Expected 200 for /products/{slug}, got {response.status_code}: {response.text}"
    product = response.json()

    # Image key check
    images = product.get("images", [])
    assert len(images) > 0
    primary_image = images[0]
    assert "url" in primary_image, "Expected 'url' key in image dict"
    assert "isPrimary" in primary_image, "Expected 'isPrimary' key in image dict (not 'is_primary')"
    assert primary_image["isPrimary"] is True

    # Canonical specification keys
    specs = product.get("specifications", {})
    canonical_keys = [
        "canonicalForm", "primaryMedium", "ornamentationGrade",
        "mudrasAttributes", "pedestalFoundation", "archComposition",
        "authenticationSeal", "netWeight", "heightWidth",
        "provenance", "pratishthaStatus", "craftsmanshipTime",
    ]
    for key in canonical_keys:
        assert key in specs, f"Missing canonical spec key: '{key}'"
