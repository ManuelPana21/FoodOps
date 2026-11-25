"""
Módulo de seguridad, hashing de contraseñas (PBKDF2-SHA256) y autenticación JWT + RBAC.
"""
import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

PBKDF2_ITERATIONS = 100_000
bearer_scheme = HTTPBearer(auto_error=False)


def get_jwt_secret() -> str:
    return os.getenv("JWT_SECRET_KEY", "foodops-dev-fallback-secret-key-2026")


def get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def get_jwt_expire_minutes() -> int:
    return int(os.getenv("JWT_EXPIRE_MINUTES", "480"))


def hash_password(plain_password: str, salt: bytes | None = None) -> str:
    """Genera un hash PBKDF2-SHA256 con salt aleatorio en formato `pbkdf2_sha256$<iter>$<salt_b64>$<hash_b64>`."""
    if not plain_password:
        raise ValueError("La contraseña no puede estar vacía.")
    actual_salt = salt if salt is not None else os.urandom(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        actual_salt,
        PBKDF2_ITERATIONS,
    )
    salt_b64 = base64.b64encode(actual_salt).decode("ascii")
    hash_b64 = base64.b64encode(derived).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_b64}${hash_b64}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifica una contraseña en texto plano contra su hash PBKDF2-SHA256 almacenado."""
    try:
        algorithm, iter_str, salt_b64, hash_b64 = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iter_str)
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_hash = base64.b64decode(hash_b64.encode("ascii"))
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(candidate, expected_hash)
    except Exception:
        return False


def create_access_token(user_id: int, username: str, role: str, name: str) -> str:
    """Firma un token JWT con el identificador y rol del usuario."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "name": name,
        "iat": now,
        "exp": now + timedelta(minutes=get_jwt_expire_minutes()),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=get_jwt_algorithm())


def decode_access_token(token: str) -> dict:
    """Valida y decodifica un token JWT."""
    return jwt.decode(token, get_jwt_secret(), algorithms=[get_jwt_algorithm()])


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Dependencia FastAPI que exige un Bearer token válido (401 Unauthorized si falta o es inválido)."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere token de autenticación (Bearer token).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(credentials.credentials)
        return {
            "id": int(payload["sub"]),
            "username": payload["username"],
            "role": payload["role"],
            "name": payload.get("name", ""),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token de autenticación ha expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_roles(*allowed_roles: str) -> Callable:
    """Dependencia RBAC que restringe el acceso por rol (403 Forbidden si no tiene permisos)."""
    def _role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Acceso denegado: el rol '{current_user.get('role')}' "
                    "no tiene permisos para realizar esta operación."
                ),
            )
        return current_user

    return _role_checker
