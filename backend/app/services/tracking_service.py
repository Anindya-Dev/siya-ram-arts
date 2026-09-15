"""
Tracking Service — Siya Ram Arts
Supports:
  • Shiprocket (aggregates 25+ couriers: DTDC, Delhivery, BlueDart, FedEx, DHL…)
  • Delhivery (direct API)
  • DTDC (direct API)
  • Fallback: returns a public tracking URL the customer can open themselves
"""
from __future__ import annotations

import httpx
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.logging import logger
from app.models.order import Order, Shipment, ShipmentStatus


# ── Courier public tracking URLs (fallback when no API key configured) ─────────
COURIER_TRACKING_URLS: Dict[str, str] = {
    "shiprocket":   "https://shiprocket.co/tracking/{awb}",
    "delhivery":    "https://www.delhivery.com/track/package/{awb}",
    "dtdc":         "https://www.dtdc.in/tracking.asp?awbno={awb}",
    "bluedart":     "https://www.bluedart.com/tracking?AWB={awb}",
    "indiapost":    "https://www.indiapost.gov.in/Track/TrackConsignment.aspx",
    "fedex":        "https://www.fedex.com/fedextrack/?trknbr={awb}",
    "dhl":          "https://www.dhl.com/in-en/home/tracking.html?tracking-id={awb}",
    "ekart":        "https://ekartlogistics.com/shipmenttrack/{awb}",
    "ecomexpress": "https://ecomexpress.in/tracking/?awb_field={awb}",
    "xpressbees":  "https://www.xpressbees.com/track?awbNo={awb}",
}

# ── Standard status labels ─────────────────────────────────────────────────────
STATUS_LABEL: Dict[str, str] = {
    ShipmentStatus.PENDING:           "Order Placed",
    ShipmentStatus.IN_TRANSIT:        "In Transit",
    ShipmentStatus.OUT_FOR_DELIVERY:  "Out for Delivery",
    ShipmentStatus.DELIVERED:         "Delivered",
    ShipmentStatus.FAILED:            "Delivery Failed",
}


class TrackingService:
    """Fetches live tracking info for a shipment."""

    # ── Shiprocket auth token (cached in-memory per process) ──────────────────
    _shiprocket_token: Optional[str] = None
    _shiprocket_token_fetched_at: Optional[datetime] = None

    # ── Public entry point ────────────────────────────────────────────────────

    @classmethod
    async def get_tracking_info(
        cls,
        order_id: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Returns a standardised tracking dict for an order.

        Response shape:
        {
            "order_id": "...",
            "order_number": "SRA/...",
            "courier": "Delhivery",
            "awb": "1234567890",
            "status": "in_transit",
            "status_label": "In Transit",
            "estimated_delivery": "2026-09-10",
            "tracking_url": "https://...",   # fallback deep link
            "timeline": [
                {"timestamp": "...", "location": "Jaipur", "description": "Shipment picked up"},
                ...
            ],
            "live_tracking": true   # false = data from our DB only
        }
        """
        # Fetch order + shipment
        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            return {"error": "Order not found", "order_id": order_id}

        result2 = await db.execute(
            select(Shipment).where(Shipment.order_id == order_id)
        )
        shipment = result2.scalar_one_or_none()

        if not shipment:
            return {
                "order_id": order_id,
                "order_number": order.order_number,
                "courier": None,
                "awb": None,
                "status": "pending",
                "status_label": "Order Placed — Not yet dispatched",
                "estimated_delivery": None,
                "tracking_url": None,
                "timeline": [],
                "live_tracking": False,
            }

        awb        = shipment.tracking_id
        courier    = (shipment.courier or "").lower().replace(" ", "")
        status     = shipment.status
        db_timeline = shipment.timeline or []

        tracking_url = cls._build_tracking_url(courier, awb)

        # Try live API if AWB exists
        live_data: Optional[Dict[str, Any]] = None
        if awb:
            try:
                if settings.SHIPROCKET_EMAIL and settings.SHIPROCKET_PASSWORD:
                    live_data = await cls._track_shiprocket(awb)
                elif "delhivery" in courier and settings.DELHIVERY_API_KEY:
                    live_data = await cls._track_delhivery(awb)
                elif "dtdc" in courier and settings.DTDC_API_KEY:
                    live_data = await cls._track_dtdc(awb)
            except Exception as e:
                logger.warning(f"Live tracking failed for AWB {awb}: {e}")

        if live_data:
            # Merge live data into our Shipment record asynchronously
            new_status = cls._map_live_status(live_data.get("status", ""), courier)
            if new_status and new_status != shipment.status:
                shipment.status = new_status
                if new_status == ShipmentStatus.DELIVERED and not shipment.delivered_at:
                    shipment.delivered_at = datetime.now(timezone.utc)
                await db.commit()

            return {
                "order_id": order_id,
                "order_number": order.order_number,
                "courier": shipment.courier,
                "awb": awb,
                "status": new_status or status,
                "status_label": STATUS_LABEL.get(new_status or status, str(status)),
                "estimated_delivery": live_data.get("estimated_delivery"),
                "tracking_url": tracking_url,
                "timeline": live_data.get("timeline", db_timeline),
                "live_tracking": True,
            }

        # Fallback — return DB-stored timeline
        return {
            "order_id": order_id,
            "order_number": order.order_number,
            "courier": shipment.courier,
            "awb": awb,
            "status": status,
            "status_label": STATUS_LABEL.get(status, str(status)),
            "estimated_delivery": None,
            "tracking_url": tracking_url,
            "timeline": db_timeline,
            "live_tracking": False,
        }

    # ── Shiprocket ────────────────────────────────────────────────────────────

    @classmethod
    async def _get_shiprocket_token(cls) -> Optional[str]:
        """Fetches and caches a Shiprocket JWT token (valid 10 days)."""
        if cls._shiprocket_token and cls._shiprocket_token_fetched_at:
            age_hours = (datetime.now(timezone.utc) - cls._shiprocket_token_fetched_at).total_seconds() / 3600
            if age_hours < 230:  # refresh before 10-day expiry
                return cls._shiprocket_token

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://apiv2.shiprocket.in/v1/external/auth/login",
                json={"email": settings.SHIPROCKET_EMAIL, "password": settings.SHIPROCKET_PASSWORD},
            )
            resp.raise_for_status()
            token = resp.json().get("token")
            cls._shiprocket_token = token
            cls._shiprocket_token_fetched_at = datetime.now(timezone.utc)
            return token

    @classmethod
    async def _track_shiprocket(cls, awb: str) -> Dict[str, Any]:
        token = await cls._get_shiprocket_token()
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://apiv2.shiprocket.in/v1/external/courier/track/awb/{awb}",
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()
            data = resp.json()

        tracking = data.get("tracking_data", {})
        shipment_track = tracking.get("shipment_track", [{}])[0] if tracking.get("shipment_track") else {}
        activities     = tracking.get("shipment_track_activities", [])

        timeline: List[Dict[str, Any]] = [
            {
                "timestamp": act.get("date"),
                "location":  act.get("location", ""),
                "description": act.get("activity", ""),
            }
            for act in activities
        ]

        return {
            "status": shipment_track.get("current_status", ""),
            "estimated_delivery": shipment_track.get("edd"),
            "timeline": timeline,
        }

    # ── Delhivery ─────────────────────────────────────────────────────────────

    @classmethod
    async def _track_delhivery(cls, awb: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://track.delhivery.com/api/v1/packages/json/?waybill={awb}&token={settings.DELHIVERY_API_KEY}",
                headers={"Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()

        packages = data.get("ShipmentData", [])
        if not packages:
            return {"status": "", "timeline": []}

        pkg = packages[0].get("Shipment", {})
        scans = pkg.get("Scans", [])

        timeline: List[Dict[str, Any]] = [
            {
                "timestamp": s.get("ScanDetail", {}).get("ScanDateTime", ""),
                "location":  s.get("ScanDetail", {}).get("ScannedLocation", ""),
                "description": s.get("ScanDetail", {}).get("Instructions", ""),
            }
            for s in scans
        ]

        return {
            "status": pkg.get("Status", {}).get("Status", ""),
            "estimated_delivery": pkg.get("ExpectedDeliveryDate"),
            "timeline": timeline,
        }

    # ── DTDC ──────────────────────────────────────────────────────────────────

    @classmethod
    async def _track_dtdc(cls, awb: str) -> Dict[str, Any]:
        """
        DTDC requires enterprise registration for full API access.
        This uses their basic tracking endpoint.
        """
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://api.dtdc.com/v1/tracking/awb/{awb}",
                headers={"api-key": settings.DTDC_API_KEY},
            )
            resp.raise_for_status()
            data = resp.json()

        scans = data.get("trackingDetails", [])
        timeline: List[Dict[str, Any]] = [
            {
                "timestamp": s.get("dateTime", ""),
                "location":  s.get("location", ""),
                "description": s.get("statusDescription", ""),
            }
            for s in scans
        ]

        return {
            "status": data.get("currentStatus", ""),
            "estimated_delivery": data.get("expectedDelivery"),
            "timeline": timeline,
        }

    # ── Helpers ───────────────────────────────────────────────────────────────

    @classmethod
    def _build_tracking_url(cls, courier: str, awb: Optional[str]) -> Optional[str]:
        if not awb:
            return None
        courier_key = courier.lower().replace(" ", "").replace("_", "")
        # Match courier name to known keys
        for key in COURIER_TRACKING_URLS:
            if key in courier_key or courier_key in key:
                return COURIER_TRACKING_URLS[key].format(awb=awb)
        return None

    @classmethod
    def _map_live_status(cls, raw_status: str, courier: str) -> Optional[ShipmentStatus]:
        """Normalises courier-specific status strings to our ShipmentStatus enum."""
        s = raw_status.lower()
        if any(k in s for k in ["delivered", "delivery done"]):
            return ShipmentStatus.DELIVERED
        if any(k in s for k in ["out for delivery", "out_for_delivery", "ofd"]):
            return ShipmentStatus.OUT_FOR_DELIVERY
        if any(k in s for k in ["in transit", "in_transit", "picked", "dispatched", "forwarded", "arrived"]):
            return ShipmentStatus.IN_TRANSIT
        if any(k in s for k in ["failed", "rto", "return", "undelivered", "lost"]):
            return ShipmentStatus.FAILED
        return None
