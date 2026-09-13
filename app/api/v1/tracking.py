"""
Tracking API — /api/v1/tracking
Endpoints:
  GET  /api/v1/tracking/{order_id}           — customer-facing: get tracking info by order ID
  GET  /api/v1/tracking/awb/{awb}            — public: lookup by AWB number alone
  PUT  /api/v1/tracking/{order_id}/shipment  — admin: assign courier + AWB to an order
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_staff_or_admin
from app.models.order import Order, Shipment, ShipmentStatus
from app.services.tracking_service import TrackingService

router = APIRouter(prefix="/tracking", tags=["Tracking"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class AssignShipmentRequest(BaseModel):
    courier: str          # e.g. "Delhivery", "DTDC", "BlueDart", "Shiprocket"
    awb: str              # Airway Bill / tracking number
    estimated_delivery: Optional[str] = None   # ISO date string YYYY-MM-DD


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/{order_id}")
async def get_tracking_by_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns live tracking information for an order.
    Customers can call this without login (tracking is public by AWB).
    """
    info = await TrackingService.get_tracking_info(order_id, db)
    if "error" in info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=info["error"])
    return info


@router.get("/awb/{awb}")
async def get_tracking_by_awb(
    awb: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Public tracking: find an order by its AWB / tracking number.
    Lets customers track without needing their order ID.
    """
    result = await db.execute(
        select(Shipment).where(Shipment.tracking_id == awb)
    )
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No shipment found with tracking number {awb}",
        )
    return await TrackingService.get_tracking_info(shipment.order_id, db)


@router.put("/{order_id}/shipment")
async def assign_shipment(
    order_id: str,
    payload: AssignShipmentRequest,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_staff_or_admin),
):
    """
    Admin endpoint — assign a courier and AWB tracking number to an order.
    Creates a Shipment record if one doesn't exist yet.
    """
    # Verify order exists
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Get or create Shipment
    result2 = await db.execute(select(Shipment).where(Shipment.order_id == order_id))
    shipment = result2.scalar_one_or_none()

    if shipment:
        shipment.courier     = payload.courier
        shipment.tracking_id = payload.awb
        shipment.status      = ShipmentStatus.IN_TRANSIT
        shipment.dispatched_at = datetime.now(timezone.utc)
    else:
        shipment = Shipment(
            order_id     = order_id,
            courier      = payload.courier,
            tracking_id  = payload.awb,
            status       = ShipmentStatus.IN_TRANSIT,
            dispatched_at = datetime.now(timezone.utc),
            timeline     = [
                {
                    "timestamp":   datetime.now(timezone.utc).isoformat(),
                    "location":    "Jaipur, Rajasthan",
                    "description": f"Shipment handed over to {payload.courier}",
                }
            ],
        )
        db.add(shipment)

    # Update order status to SHIPPED
    from app.models.order import OrderStatus
    order.status = OrderStatus.SHIPPED

    await db.commit()
    await db.refresh(shipment)

    return {
        "message": f"Shipment assigned — {payload.courier} / AWB: {payload.awb}",
        "order_id": order_id,
        "order_number": order.order_number,
        "courier": shipment.courier,
        "awb": shipment.tracking_id,
        "status": shipment.status,
        "tracking_url": TrackingService._build_tracking_url(
            payload.courier.lower(), payload.awb
        ),
    }
