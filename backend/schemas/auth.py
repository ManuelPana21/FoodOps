"""
Pydantic schemas para autenticación (/api/auth/login) en FoodOps.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Nombre de usuario")
    password: str = Field(..., min_length=1, description="Contraseña en texto plano")


class UserPublic(BaseModel):
    id: int
    name: str
    username: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
