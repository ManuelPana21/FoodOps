"""
FoodOps Database Initializer & Seeder (SQLite)
Aplica schema.sql, seeds.sql y genera hashes PBKDF2-SHA256 desde las variables de entorno (.env).
"""
import os
import sqlite3
import sys
from pathlib import Path

# Forzar salida UTF-8 en consolas Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
from backend.security import hash_password

load_dotenv(PROJECT_ROOT / ".env")

DB_PATH = BASE_DIR / "foodops.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"
SEED_PATH = BASE_DIR / "seeds.sql" if (BASE_DIR / "seeds.sql").exists() else BASE_DIR / "seed.sql"


def seed_connection(conn: sqlite3.Connection) -> None:
    """Aplica esquema, semillas y contraseñas hasheadas sobre una conexión SQLite dada."""
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())

    with open(SEED_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())

    # Sincronizar usuarios de prueba con contraseñas hasheadas desde .env
    waiter_user = os.getenv("SEED_WAITER_USERNAME", "mesero")
    waiter_pass = os.getenv("SEED_WAITER_PASSWORD", "mesero123")
    kitchen_user = os.getenv("SEED_KITCHEN_USERNAME", "cocinero")
    kitchen_pass = os.getenv("SEED_KITCHEN_PASSWORD", "cocina123")
    admin_user = os.getenv("SEED_ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("SEED_ADMIN_PASSWORD", "admin123")

    seeded_passwords = [
        (waiter_user, hash_password(waiter_pass), 1),
        ("sofia", hash_password(waiter_pass), 2),
        ("carlos", hash_password(waiter_pass), 3),
        (kitchen_user, hash_password(kitchen_pass), 4),
        (admin_user, hash_password(admin_pass), 5),
    ]
    for username, pwd_hash, user_id in seeded_passwords:
        cursor.execute(
            "UPDATE users SET username = ?, password_hash = ? WHERE id = ?;",
            (username, pwd_hash, user_id),
        )

    conn.commit()


def initialize_database():
    print("[FoodOps Database] Iniciando aprovisionamiento en SQLite...")
    print(f"Ruta destino: {DB_PATH}")

    try:
        conn = sqlite3.connect(DB_PATH)
        seed_connection(conn)

        cursor = conn.cursor()
        print("\nTablas creadas exitosamente:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        for (table,) in cursor.fetchall():
            print(f"   * {table}")

        print("\nSemillas cargadas correctamente (con contraseñas hasheadas):")
        for table in ["categories", "products", "users", "orders", "order_items"]:
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            count = cursor.fetchone()[0]
            print(f"   * {table}: {count} registros")

        conn.close()
        print("\n[OK] Base de datos SQLite lista para operar con FoodOps.")

    except Exception as e:
        print(f"[ERROR] Error al inicializar base de datos: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    initialize_database()
