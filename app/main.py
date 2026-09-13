import asyncio
from contextlib import asynccontextmanager
import os
import time
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import async_session_factory, engine
from app.core.errors import AppException, app_exception_handler
from app.core.logging import logger
from app.events import event_bus, register_default_handlers
from app.services.inventory_service import InventoryService


async def reservation_cleaner_worker(stop_event: asyncio.Event):
    """
    Background worker loop that scans for expired stock reservations every 60 seconds
    and returns held stock to available inventory automatically.
    """
    logger.info("Stock reservation cleaner worker started.")
    while not stop_event.is_set():
        try:
            async with async_session_factory() as db:
                released = await InventoryService.release_expired_reservations(db)
                await db.commit()
                if released > 0:
                    logger.info(f"Auto-released {released} expired stock reservations.")
        except Exception as e:
            logger.error(f"Error in reservation cleaner worker: {e}", exc_info=True)

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=60.0)
        except asyncio.TimeoutError:
            pass
    logger.info("Stock reservation cleaner worker stopped.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting Siya Ram Arts Backend API (Environment: {settings.ENVIRONMENT})")
    from app.core.security import assert_production_security
    assert_production_security()
    register_default_handlers(event_bus)

    # Ensure static directories exist
    os.makedirs(os.path.join(os.getcwd(), "static", "invoices"), exist_ok=True)

    # Start background reservation cleaner task
    stop_event = asyncio.Event()
    cleaner_task = asyncio.create_task(reservation_cleaner_worker(stop_event))

    yield

    # Shutdown
    logger.info("Shutting down Siya Ram Arts Backend API...")
    stop_event.set()
    await cleaner_task
    await engine.dispose()
    logger.info("Database engine connections closed.")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-grade backend service for Siya Ram Arts — handcrafted murtis, multi-location inventory, made-to-order commissions, GST invoicing, and Razorpay payments.",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Configuration
if isinstance(settings.CORS_ORIGINS, list):
    origins = settings.CORS_ORIGINS
else:
    origins = [origin.strip() for origin in str(settings.CORS_ORIGINS).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} ({process_time_ms}ms)",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": process_time_ms,
            },
        )
        return response
    except Exception as e:
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(
            f"{request.method} {request.url.path} - Unhandled Exception ({process_time_ms}ms): {e}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"code": "INTERNAL_SERVER_ERROR", "detail": "An unexpected error occurred"},
        )


# Register Exception Handlers
@app.exception_handler(AppException)
async def handle_custom_app_exception(request: Request, exc: AppException):
    return app_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": "VALIDATION_ERROR",
            "detail": "Invalid request parameters or payload",
            "errors": exc.errors(),
        },
    )


# Static Files (PDF Invoices)
os.makedirs(os.path.join(os.getcwd(), "static", "invoices"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Health Check Endpoints
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "gst_state_code": settings.GST_STATE_CODE,
    }


# Mount API Routers
app.include_router(api_v1_router)
