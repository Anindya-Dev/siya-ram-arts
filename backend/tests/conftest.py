import asyncio
import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_siyaram.db"
os.environ["CLERK_SECRET_KEY"] = "sk_test_mock_clerk_secret_key"
os.environ["RAZORPAY_KEY_ID"] = "rzp_test_mock_id"
os.environ["RAZORPAY_KEY_SECRET"] = "rzp_mock_secret_key_12345"

from app.core.database import Base, get_db
from app.main import app
from app.models import Location, Product, ProductVariant, InventoryItem, StockLedgerEntry, LedgerReason, User, UserRole


test_engine = create_async_engine("sqlite+aiosqlite:///./test_siyaram.db", echo=False)
TestingSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    if os.path.exists("./test_siyaram.db"):
        try:
            os.remove("./test_siyaram.db")
        except OSError:
            pass


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
