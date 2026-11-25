"""
Configuración de fixtures y cliente de pruebas aislado para FoodOps API.
Utiliza una base de datos SQLite temporal dedicada por sesión/prueba para no alterar database/foodops.db.
"""
import os
import sqlite3
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import get_db
from database.init_db import seed_connection


@pytest.fixture(scope="function")
def test_db_path(tmp_path: Path) -> Path:
    """Crea y siembra una base de datos SQLite aislada y dedicada para cada test."""
    db_file = tmp_path / "test_foodops.db"
    conn = sqlite3.connect(str(db_file), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    seed_connection(conn)
    conn.close()
    return db_file


@pytest.fixture(scope="function")
def client(test_db_path: Path):
    """Cliente HTTP de prueba conectado exclusivamente a la BD SQLite temporal."""
    def override_get_db():
        conn = sqlite3.connect(str(test_db_path), timeout=10.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        try:
            yield conn
        finally:
            conn.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _login_headers(client: TestClient, username: str, password: str) -> dict[str, str]:
    res = client.post("/api/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200, f"Login falló para {username}: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def waiter_headers(client: TestClient) -> dict[str, str]:
    username = os.getenv("SEED_WAITER_USERNAME", "mesero")
    password = os.getenv("SEED_WAITER_PASSWORD", "mesero123")
    return _login_headers(client, username, password)


@pytest.fixture(scope="function")
def kitchen_headers(client: TestClient) -> dict[str, str]:
    username = os.getenv("SEED_KITCHEN_USERNAME", "cocinero")
    password = os.getenv("SEED_KITCHEN_PASSWORD", "cocina123")
    return _login_headers(client, username, password)


@pytest.fixture(scope="function")
def admin_headers(client: TestClient) -> dict[str, str]:
    username = os.getenv("SEED_ADMIN_USERNAME", "admin")
    password = os.getenv("SEED_ADMIN_PASSWORD", "admin123")
    return _login_headers(client, username, password)
