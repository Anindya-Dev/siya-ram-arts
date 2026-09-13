from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import logger
from app.core.security import get_current_user
from app.models.order import Order
from app.models.user import User
from app.models.webhook import WebhookEvent
from app.schemas.payment import (
    PaymentVerificationRequest,
    PaymentVerificationResponse,
)
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments & Gateway Webhooks"])


@router.post("/verify", response_model=PaymentVerificationResponse)
async def verify_payment(
    data: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verifies Razorpay cryptographic signature upon frontend checkout completion.
    Atomically converts stock reservations to permanent sales and generates a GST invoice.
    """
    order = await OrderService.verify_payment_and_complete_order(
        db=db,
        order_id=data.order_id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature,
        actor=current_user.email,
    )

    inv_num = order.invoice.invoice_number if order.invoice else None
    return PaymentVerificationResponse(
        success=True,
        order_id=order.id,
        status=order.status.value,
        invoice_number=inv_num,
        message="Payment verified successfully. Sacred murti is being prepared for shipment.",
    )


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
    db: AsyncSession = Depends(get_db),
):
    """
    Handles Razorpay asynchronous webhooks (payment.captured, payment.failed, refund.processed)
    with persistent WebhookEvent idempotency tracking and HMAC cryptographic validation.
    """
    raw_body = await request.body()
    body_text = raw_body.decode("utf-8")

    if not x_razorpay_signature:
        logger.warning("Razorpay webhook received without signature header")
        raise HTTPException(status_code=400, detail="Missing X-Razorpay-Signature header")

    is_valid = PaymentService.verify_webhook_signature(body_text, x_razorpay_signature)
    if not is_valid:
        logger.error("Razorpay webhook signature mismatch")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event_type = payload.get("event", "")
    event_id = payload.get("event_id") or payload.get("id")

    logger.info(f"Received verified Razorpay webhook: {event_type} (event_id={event_id})")

    # Strict Webhook Idempotency Check
    if event_id:
        stmt = select(WebhookEvent).where(WebhookEvent.razorpay_event_id == event_id)
        res = await db.execute(stmt)
        existing_event = res.scalar_one_or_none()
        if existing_event:
            logger.info(f"Duplicate webhook event {event_id} ignored.")
            return {"status": "ok", "message": "Event already processed", "event": event_type}

    if event_type == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")
        razorpay_payment_id = payment_entity.get("id")

        if razorpay_order_id:
            stmt = select(Order).where(Order.razorpay_order_id == razorpay_order_id)
            res = await db.execute(stmt)
            order = res.scalar_one_or_none()
            if order:
                await OrderService.verify_payment_and_complete_order(
                    db=db,
                    order_id=order.id,
                    razorpay_order_id=razorpay_order_id,
                    razorpay_payment_id=razorpay_payment_id,
                    razorpay_signature="verified_by_webhook",
                    actor="razorpay_webhook",
                )

    elif event_type == "refund.processed":
        refund_entity = payload.get("payload", {}).get("refund", {}).get("entity", {})
        razorpay_payment_id = refund_entity.get("payment_id")
        
        if razorpay_payment_id:
            stmt = select(Order).where(Order.razorpay_payment_id == razorpay_payment_id)
            res = await db.execute(stmt)
            order = res.scalar_one_or_none()
            if order:
                await OrderService.cancel_order(
                    db=db,
                    order_id=order.id,
                    actor="razorpay_webhook_refund",
                    reason="Refund processed via Razorpay gateway",
                )

    elif event_type == "payment.failed":
        logger.warning(f"Payment failure webhook payload: {payload}")

    # Record event in idempotency table
    if event_id:
        webhook_event = WebhookEvent(
            razorpay_event_id=event_id,
            event_type=event_type,
        )
        db.add(webhook_event)
        await db.commit()

    return {"status": "ok", "event": event_type}

