from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.custom_orders import router as custom_orders_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.locations import router as locations_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.products import router as products_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.tracking import router as tracking_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(reviews_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(invoices_router)
api_v1_router.include_router(custom_orders_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(tracking_router)
