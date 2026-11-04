from backend.routers.orders import router as orders_router
from backend.routers.products import router as products_router
from backend.routers.test_errors import router as test_errors_router

__all__ = ["orders_router", "products_router", "test_errors_router"]
