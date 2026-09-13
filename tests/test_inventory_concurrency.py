import asyncio
import uuid
import pytest
from sqlalchemy import select
from app.core.errors import StockUnavailableError
from app.models import InventoryItem, LedgerReason, Location, Product, ProductVariant, StockLedgerEntry
from app.services.inventory_service import InventoryService


@pytest.mark.asyncio
async def test_concurrent_reservations_prevent_overselling(db_session):
    """
    Simulates multiple concurrent checkout requests competing for a scarce item (2 available units).
    Verifies row-level locking prevents overselling: only 2 can succeed, rest fail.
    """
    # 1. Setup location, product, variant with EXACTLY 2 items
    loc = Location(
        id=str(uuid.uuid4()),
        code=f"TST_{uuid.uuid4().hex[:4]}",
        name="Test Atelier",
        address="Atelier St",
        city="Jaipur",
        state="Rajasthan",
    )
    db_session.add(loc)

    prod = Product(
        id=str(uuid.uuid4()),
        slug=f"test-murti-{uuid.uuid4().hex[:6]}",
        name="Test Ram Murti (Chemical Resin)",
        deity="Ram",
        material="Chemical Resin",
        base_price=30000,
        sku=f"TST-SKU-{uuid.uuid4().hex[:4]}",
    )
    db_session.add(prod)
    await db_session.flush()

    variant = ProductVariant(
        id=str(uuid.uuid4()),
        product_id=prod.id,
        sku=f"TST-VAR-{uuid.uuid4().hex[:4]}",
        size="18-inch",
        material="Chemical Resin",
        base_price=30000,
    )
    db_session.add(variant)
    await db_session.flush()

    inv_item = InventoryItem(
        id=str(uuid.uuid4()),
        variant_id=variant.id,
        location_id=loc.id,
        stock_count=2,  # Exactly 2 available
        reserved_count=0,
        low_stock_threshold=1,
    )
    db_session.add(inv_item)
    await db_session.commit()

    # 2. Fire 5 concurrent reservation attempts for 1 unit each
    async def try_reserve(user_num: int):
        # Each coroutine uses a separate transaction/session
        from tests.conftest import TestingSessionLocal
        async with TestingSessionLocal() as session:
            try:
                res = await InventoryService.create_reservation(
                    db=session,
                    variant_id=variant.id,
                    location_id=loc.id,
                    quantity=1,
                    user_id=f"user_{user_num}",
                )
                await session.commit()
                return True
            except StockUnavailableError:
                await session.rollback()
                return False

    results = await asyncio.gather(*[try_reserve(i) for i in range(5)])

    # Exactly 2 should succeed, 3 should fail
    successes = [r for r in results if r is True]
    failures = [r for r in results if r is False]

    assert len(successes) == 2, f"Expected exactly 2 successes, got {len(successes)}"
    assert len(failures) == 3, f"Expected exactly 3 failures, got {len(failures)}"

    # Check database state
    from tests.conftest import TestingSessionLocal
    async with TestingSessionLocal() as check_session:
        recheck_stmt = select(InventoryItem).where(InventoryItem.id == inv_item.id)
        res = await check_session.execute(recheck_stmt)
        updated_item = res.scalar_one()
        assert updated_item.reserved_count == 2
        assert updated_item.available_count == 0


@pytest.mark.asyncio
async def test_ledger_entry_on_stock_adjustment(db_session):
    """
    Verifies every stock change writes an immutable StockLedgerEntry.
    """
    loc = Location(
        id=str(uuid.uuid4()),
        code=f"LGD_{uuid.uuid4().hex[:4]}",
        name="Ledger Atelier",
        address="Main Rd",
        city="Jaipur",
        state="Rajasthan",
    )
    db_session.add(loc)

    prod = Product(
        id=str(uuid.uuid4()),
        slug=f"ledger-prod-{uuid.uuid4().hex[:6]}",
        name="Ganesha Resin Murti",
        deity="Ganesha",
        material="Chemical Resin",
        base_price=25000,
        sku=f"LGD-SKU-{uuid.uuid4().hex[:4]}",
    )
    db_session.add(prod)
    await db_session.flush()

    variant = ProductVariant(
        id=str(uuid.uuid4()),
        product_id=prod.id,
        sku=f"LGD-VAR-{uuid.uuid4().hex[:4]}",
        size="12-inch",
        material="Chemical Resin",
        base_price=25000,
    )
    db_session.add(variant)
    await db_session.commit()

    # Perform adjustment
    await InventoryService.adjust_stock(
        db=db_session,
        variant_id=variant.id,
        location_id=loc.id,
        delta=10,
        reason=LedgerReason.RESTOCK,
        actor="staff@siyaramarts.com",
        note="Fresh festival batch",
    )
    await db_session.commit()

    # Query ledger
    ledger_stmt = select(StockLedgerEntry).where(
        StockLedgerEntry.variant_id == variant.id,
        StockLedgerEntry.location_id == loc.id,
    )
    result = await db_session.execute(ledger_stmt)
    entries = result.scalars().all()
    assert len(entries) == 1
    assert entries[0].delta == 10
    assert entries[0].reason == LedgerReason.RESTOCK
    assert entries[0].actor == "staff@siyaramarts.com"
