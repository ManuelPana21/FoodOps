"""
FoodOps - Backend FastAPI
Punto de entrada principal de la API.
Integra schemas Pydantic de validación de pedidos y middleware de excepciones HTTP con respuestas estándar en JSON.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.middleware.error_handler import register_error_handlers
from backend.routers.orders import router as orders_router
from backend.routers.products import router as products_router
from backend.routers.test_errors import router as test_errors_router

# Inicializar aplicación FastAPI
app = FastAPI(
    title="FoodOps API 🍽️⚡",
    description=(
        "API para toma de pedidos y Kitchen Display System (KDS) de FoodOps. "
        "Incluye validación estricta de comandas con Pydantic y respuestas unificadas de error HTTP."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Configurar CORS para permitir comunicación con el frontend Vite (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Registrar middleware y manejadores de excepciones estándar (400, 404, 422, 500)
register_error_handlers(app)

# 3. Registrar routers modulares
app.include_router(orders_router)
app.include_router(products_router)
app.include_router(test_errors_router)


@app.get("/api/health", tags=["Salud del Sistema"], summary="Verificar estado de la API")
def health_check():
    return {
        "status": "healthy",
        "service": "FoodOps Backend API",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=4000, reload=True)
