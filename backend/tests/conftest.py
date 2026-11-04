"""
Configuración de fixtures y cliente de pruebas para FoodOps API.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, get_db_connection


@pytest.fixture(scope="session")
def client():
    """Cliente HTTP de prueba para ejecutar peticiones contra la app FastAPI."""
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
