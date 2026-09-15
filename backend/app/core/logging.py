import logging
import sys
from typing import Any, Dict
import json


class JSONLogFormatter(logging.Formatter):
    """
    Standard library logging formatter outputting structured JSON.
    Guarantees structured logging even if structlog is not present.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_obj["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_obj["user_id"] = record.user_id
        if hasattr(record, "event_type"):
            log_obj["event_type"] = record.event_type
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("siyaramarts")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Avoid duplicate handlers
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONLogFormatter())
        logger.addHandler(handler)
        logger.propagate = False
    
    # Also capture uvicorn access logs cleanly
    uvicorn_logger = logging.getLogger("uvicorn.access")
    uvicorn_logger.handlers = logger.handlers
    
    return logger


logger = setup_logging()
