"""
Router de autenticación para FoodOps API (/api/auth/login).
"""
import sqlite3
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.schemas.auth import LoginRequest, LoginResponse, UserPublic
from backend.security import create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Iniciar sesión y obtener token JWT",
)
def login(payload: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, name, username, password_hash, role FROM users WHERE username = ?;",
        (payload.username.strip().lower(),),
    )
    user_row = cursor.fetchone()

    if not user_row or not verify_password(payload.password, user_row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas. Verifica tu usuario y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user_row["id"],
        username=user_row["username"],
        role=user_row["role"],
        name=user_row["name"],
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserPublic(
            id=user_row["id"],
            name=user_row["name"],
            username=user_row["username"],
            role=user_row["role"],
        ),
    )
