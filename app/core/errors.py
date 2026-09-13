from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "ERROR",
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.extra = extra or {}


class ResourceNotFoundError(AppException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' was not found.",
            code="RESOURCE_NOT_FOUND",
        )


class StockUnavailableError(AppException):
    def __init__(self, message: str, sku: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
            code="STOCK_UNAVAILABLE",
            extra={"sku": sku} if sku else {},
        )


class StockReservationExpiredError(AppException):
    def __init__(self, reservation_id: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stock reservation '{reservation_id}' has expired and items were released.",
            code="RESERVATION_EXPIRED",
        )


class PaymentVerificationError(AppException):
    def __init__(self, detail: str = "Razorpay payment signature verification failed."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code="PAYMENT_VERIFICATION_FAILED",
        )


class InvalidOrderStateError(AppException):
    def __init__(self, current_status: str, attempted_action: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot execute '{attempted_action}' while order is in '{current_status}' status.",
            code="INVALID_ORDER_STATE",
        )


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Authentication credentials were not provided or are invalid."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )


class ForbiddenError(AppException):
    def __init__(self, detail: str = "You do not have permission to access this resource."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN",
        )


AuthorizationError = ForbiddenError


class BusinessRuleViolationError(AppException):
    def __init__(self, detail: str, code: str = "BUSINESS_RULE_VIOLATION"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code=code,
        )


def app_exception_handler(request: Any, exc: AppException) -> Any:
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "detail": exc.detail,
            "extra": exc.extra,
        },
    )


