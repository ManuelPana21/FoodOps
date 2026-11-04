"""
Middleware y manejadores de excepciones HTTP para FastAPI en FoodOps.
Garantiza respuestas estándar en formato JSON para códigos 400, 404, 422, 500.
"""
import json
import logging
from typing import Any, List, Optional, Union
from fastapi import Request, status
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("foodops.middleware.errors")

DEFAULT_MESSAGES = {
    400: "Solicitud incorrecta o parámetros inválidos",
    404: "El recurso solicitado no fue encontrado",
    422: "Error de validación en los datos del pedido o solicitud",
    500: "Error interno del servidor",
}


def build_error_payload(
    code: int,
    message: Optional[str] = None,
    details: Optional[Union[List[dict], dict, str, Any]] = None,
) -> dict:
    """
    Construye la estructura JSON estándar de error para toda la API.
    Retorna un diccionario con: status, code, message, detail, details.
    """
    msg = message or DEFAULT_MESSAGES.get(code, f"Error HTTP {code}")
    return {
        "status": "error",
        "code": code,
        "message": msg,
        "detail": msg,
        "details": details,
    }


def format_validation_errors(errors: list) -> List[dict]:
    """
    Formatea la lista cruda de errores de Pydantic en una estructura limpia y amigable.
    """
    formatted: List[dict] = []
    for err in errors:
        loc = err.get("loc", ())
        # Remover 'body' del inicio si está presente
        field_tokens = [str(token) for token in loc if token != "body"]
        field_path = " -> ".join(field_tokens) if field_tokens else "body"

        raw_msg = err.get("msg", "Dato inválido")
        # Limpiar prefijo 'Value error, ' que genera Pydantic v2
        if raw_msg.startswith("Value error, "):
            raw_msg = raw_msg[len("Value error, "):]

        formatted.append({
            "field": field_path,
            "message": raw_msg,
            "type": err.get("type", "validation_error"),
        })
    return formatted


# ==============================================================================
# Handlers de excepciones específicos de FastAPI
# ==============================================================================

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Manejador para errores de validación de Pydantic (HTTP 422 Unprocessable Entity).
    Se activa cuando los datos de un pedido o petición no cumplen las restricciones del schema.
    """
    formatted_errors = format_validation_errors(exc.errors())
    payload = build_error_payload(
        code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Error de validación en los datos del pedido o solicitud",
        details=formatted_errors,
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=payload,
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Manejador para excepciones HTTP de Starlette/FastAPI (HTTP 400, 404, etc.).
    """
    code = exc.status_code
    # Si Starlette asigna el texto en inglés por defecto ('Not Found'), usamos el mensaje en español
    if exc.detail and exc.detail not in ("Not Found", "Bad Request", "Internal Server Error"):
        custom_msg = str(exc.detail)
    else:
        custom_msg = DEFAULT_MESSAGES.get(code, f"Error HTTP {code}")
    details = getattr(exc, "details", None)

    payload = build_error_payload(
        code=code,
        message=custom_msg,
        details=details,
    )
    return JSONResponse(
        status_code=code,
        content=payload,
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Manejador para cualquier excepción no controlada en la aplicación (HTTP 500 Internal Server Error).
    """
    logger.error(
        f"Excepción 500 no controlada en {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    payload = build_error_payload(
        code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Error interno del servidor",
        details=str(exc) if getattr(request.app.state, "debug", False) else None,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=payload,
    )


# ==============================================================================
# Middleware HTTP ASGI
# ==============================================================================

class HTTPErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware HTTP que intercepta el ciclo de vida de la petición para:
    1. Atrapar excepciones no controladas a nivel de middleware y transformarlas en JSON 500 estándar.
    2. Interceptar respuestas con código 400, 404, 422, 500 emitidas en formatos no estándar
       (como texto plano) y reempaquetarlas en la estructura JSON estándar de FoodOps.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)

            # Si el status code es uno de los objetivos (400, 404, 422, 500)
            if response.status_code in (400, 404, 422, 500):
                content_type = response.headers.get("content-type", "")

                # Si no es JSON estándar, lo adaptamos
                if "application/json" not in content_type:
                    body = [section async for section in response.body_iterator]
                    raw_text = b"".join(body).decode("utf-8", errors="ignore")
                    msg = raw_text.strip() or DEFAULT_MESSAGES.get(
                        response.status_code, f"Error HTTP {response.status_code}"
                    )
                    payload = build_error_payload(
                        code=response.status_code,
                        message=msg,
                        details=None,
                    )
                    return JSONResponse(
                        status_code=response.status_code,
                        content=payload,
                    )

            return response

        except StarletteHTTPException as exc:
            return await http_exception_handler(request, exc)
        except RequestValidationError as exc:
            return await validation_exception_handler(request, exc)
        except Exception as exc:
            return await generic_exception_handler(request, exc)


def register_error_handlers(app):
    """
    Registra el middleware HTTP y los handlers de excepción en la aplicación FastAPI.
    Garantiza cobertura tanto a nivel de routing de FastAPI como a nivel ASGI del middleware.
    """
    # 1. Registrar middleware ASGI
    app.add_middleware(HTTPErrorHandlingMiddleware)

    # 2. Registrar exception handlers de FastAPI/Starlette
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
