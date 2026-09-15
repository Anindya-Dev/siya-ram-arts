from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.location import Location

router = APIRouter(prefix="/locations", tags=["Atelier Locations"])


class LocationRead(BaseModel):
    id: str
    code: str
    name: str
    address: str
    city: str
    state: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[LocationRead])
async def list_locations(db: AsyncSession = Depends(get_db)):
    """
    Lists all active artisan ateliers (e.g. Jaipur Atelier, Kashi Sanctum Studio).
    """
    stmt = select(Location).where(Location.is_active.is_(True)).order_by(Location.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()
