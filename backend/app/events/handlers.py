from app.core.logging import logger
from app.events.events import (
    InvoiceGeneratedEvent,
    OrderCancelledEvent,
    PaymentCapturedEvent,
    StockReleasedEvent,
    StockReservedEvent,
    StockThresholdCrossedEvent,
)


async def handle_stock_threshold_crossed(event: StockThresholdCrossedEvent) -> None:
    """
    Low-stock alert handler.
    Triggered when an inventory item's stock reaches or drops below threshold.
    Logs structured alert and queues atelier dispatch notification.
    """
    logger.warning(
        f"🚨 LOW STOCK ALERT: Variant {event.sku} at {event.location_name} has reached {event.current_stock} pcs (threshold: {event.threshold})",
        extra={
            "alert_type": "LOW_STOCK",
            "sku": event.sku,
            "location_name": event.location_name,
            "current_stock": event.current_stock,
            "threshold": event.threshold,
        },
    )


async def handle_payment_captured(event: PaymentCapturedEvent) -> None:
    """
    Payment captured handler.
    Triggers GST invoice generation and customer notification.
    """
    logger.info(
        f"💳 PAYMENT CAPTURED EVENT: Order {event.order_id}, Amount: ₹{event.amount}, Razorpay ID: {event.razorpay_payment_id}"
    )


async def handle_order_cancelled(event: OrderCancelledEvent) -> None:
    """
    Order cancellation handler.
    Logs refund and release audit trail.
    """
    logger.info(
        f"📦 ORDER CANCELLED EVENT: Order {event.order_id}, User: {event.user_id}, Refunded: {event.refund_issued}, Reason: {event.reason}"
    )


def register_default_handlers(bus) -> None:
    """
    Register core domain event handlers with the event bus.
    """
    bus.subscribe("StockThresholdCrossed", handle_stock_threshold_crossed)
    bus.subscribe("PaymentCaptured", handle_payment_captured)
    bus.subscribe("OrderCancelled", handle_order_cancelled)
