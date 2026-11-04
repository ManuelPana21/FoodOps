"""
FoodOps Database Initializer & Seeder (SQLite)
Adaptado de MySQL a SQLite para entornos de desarrollo y operacion ligera.
"""
import sqlite3
import os
import sys

# Forzar salida UTF-8 en consolas Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "foodops.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
SEED_PATH = (
    os.path.join(BASE_DIR, "seeds.sql")
    if os.path.exists(os.path.join(BASE_DIR, "seeds.sql"))
    else os.path.join(BASE_DIR, "seed.sql")
)

def initialize_database():
    print("[FoodOps Database] Iniciando aprovisionamiento en SQLite...")
    print(f"Ruta destino: {DB_PATH}")

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Habilitar soporte de llaves foraneas en SQLite
        cursor.execute("PRAGMA foreign_keys = ON;")

        print("\nAplicando esquema DDL (schema.sql)...")
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())
        print("Tablas creadas exitosamente:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cursor.fetchall()]
        for table in tables:
            print(f"   * {table}")

        print("\nEjecutando semillas de datos iniciales (seed.sql)...")
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())

        conn.commit()

        # Resumen de verificacion
        print("Semillas cargadas correctamente:")
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
