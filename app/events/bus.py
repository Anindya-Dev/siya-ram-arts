import asyncio
from typing import Any, Callable, Coroutine, Dict, List, Type
from app.core.logging import logger
from app.events.events import DomainEvent

EventHandler = Callable[[Any], Coroutine[Any, Any, None]]


class EventBus:
    """
    In-process asynchronous domain event bus.
    Allows decoupling domain operations (e.g. payment captured -> invoice generation,
    low stock threshold -> notifications) without synchronous inline coupling.
    """
    def __init__(self):
        self._handlers: Dict[str, List[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
        logger.debug(f"Subscribed handler '{handler.__name__}' to event '{event_type}'")

    async def publish(self, event: DomainEvent) -> None:
        handlers = self._handlers.get(event.event_type, [])
        logger.info(
            f"Event published: {event.event_type} (id={event.event_id})",
            extra={"event_type": event.event_type, "event_id": event.event_id},
        )
        for handler in handlers:
            try:
                # Dispatch handler asynchronously with isolation
                asyncio.create_task(self._safe_execute(handler, event))
            except Exception as e:
                logger.error(
                    f"Error dispatching event {event.event_type} to handler {handler.__name__}: {e}",
                    exc_info=True,
                )

    async def _safe_execute(self, handler: EventHandler, event: DomainEvent) -> None:
        try:
            await handler(event)
        except Exception as e:
            logger.error(
                f"Error in event handler '{handler.__name__}' processing '{event.event_type}': {e}",
                exc_info=True,
            )


# Global event bus singleton
event_bus = EventBus()
