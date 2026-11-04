"""
Endpoints de prueba para verificación de middleware y manejo de excepciones HTTP.
Permite validar que los códigos 400, 404, 422 y 500 retornen la estructura JSON estándar.
"""
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/api/test", tags=["Pruebas de Errores HTTP"])


@router.get(
    "/error-400",
    summary="Simulación de error 400 Bad Request",
)
def trigger_error_400():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Parámetro o payload de solicitud inválido para prueba.",
    )


@router.get(
    "/error-404",
    summary="Simulación de error 404 Not Found",
)
def trigger_error_404():
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Recurso solicitado no encontrado para prueba.",
    )


@router.get(
    "/error-500",
    summary="Simulación de error 500 Internal Server Error no controlado",
)
def trigger_error_500():
    # Lanzar una excepción genérica que debe ser atrapada por el middleware y handlers 500
    raise RuntimeError("Fallo no controlado simulado en servidor para verificación de middleware 500.")
