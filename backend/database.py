"""
Conexión y gestión de base de datos SQLite para FoodOps API.
"""
import os
import sqlite3
from pathlib import Path
from typing import Generator

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
DEFAULT_DB_PATH = PROJECT_ROOT / "database" / "foodops.db"


def get_db_path() -> str:
    env_path = os.getenv("DB_STORAGE")
    if env_path:
        p = Path(env_path)
        if p.is_absolute():
            return str(p)
        return str(PROJECT_ROOT / p)
    return str(DEFAULT_DB_PATH)


def get_db_connection() -> sqlite3.Connection:
    """Crea una conexión con row_factory como sqlite3.Row y foreign keys activas."""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Dependency generator para inyección en endpoints FastAPI."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
