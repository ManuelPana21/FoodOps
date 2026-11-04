"""
Pydantic schemas para respuestas estandarizadas de errores HTTP en formato JSON.
Formato uniforme para codigos 400, 404, 422, 500 y otros.
"""
from typing import Optional, Any, List, Union
from pydantic import BaseModel, Field, ConfigDict


class ErrorDetail(BaseModel):
    field: Optional[str] = Field(None, description="Campo causante del error")
    message: str = Field(..., description="Mensaje explicativo del error")
    type: Optional[str] = Field(None, description="Tipo o categoría del error")

    model_config = ConfigDict(populate_by_name=True)


class StandardErrorResponse(BaseModel):
    status: str = Field(default="error", description="Estado de la respuesta ('error')")
    code: int = Field(..., description="Código de estado HTTP (400, 404, 422, 500)")
    message: str = Field(..., description="Descripción legible del error")
    detail: str = Field(..., description="Compatibilidad con especificación de detalle de FastAPI")
    details: Optional[Union[List[ErrorDetail], List[dict], dict, str, Any]] = Field(
        default=None, description="Detalles técnicos o lista estructurada de errores"
    )

    model_config = ConfigDict(populate_by_name=True)
