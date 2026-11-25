"""
Pruebas Unitarias (tests/test_unit.py):
- Cálculo de subtotales y total_amount de una orden.
- Validación de esquemas Pydantic ante casos límite (cantidades negativas, cero, listas vacías, campos nulos).
- Verificación de hashing y comprobación de contraseñas.
"""
import pytest
from pydantic import ValidationError

from backend.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderStatusUpdate,
    calculate_order_totals,
)
from backend.security import hash_password, verify_password


# ==============================================================================
# 1. Cálculo de subtotales y total_amount
# ==============================================================================

def test_calculate_order_totals_multiple_items():
    items = [
        (2, 6.50),   # 13.00
        (3, 1.50),   # 4.50
        (1, 5.75),   # 5.75
    ]
    subtotals, total_amount = calculate_order_totals(items)
    assert subtotals == [13.0, 4.5, 5.75]
    assert total_amount == 23.25


def test_calculate_order_totals_rounding_precision():
    items = [
        (3, 1.999),  # 6.00 (5.997 -> 6.0)
        (1, 2.334),  # 2.33
    ]
    subtotals, total_amount = calculate_order_totals(items)
    assert subtotals == [6.0, 2.33]
    assert total_amount == 8.33


# ==============================================================================
# 2. Validación de esquemas Pydantic ante casos límite
# ==============================================================================

def test_order_schema_rejects_negative_quantity():
    with pytest.raises(ValidationError):
        OrderItemCreate(productId=1, quantity=-2)


def test_order_schema_rejects_zero_quantity():
    with pytest.raises(ValidationError):
        OrderItemCreate(productId=1, quantity=0)


def test_order_schema_rejects_empty_items_list():
    with pytest.raises(ValidationError):
        OrderCreate(tableNumber="Mesa 1", serverId=1, items=[])


def test_order_schema_rejects_null_required_fields():
    with pytest.raises(ValidationError):
        OrderCreate(tableNumber=None, serverId=None, items=None)  # type: ignore[arg-type]


def test_order_schema_rejects_blank_table_number():
    with pytest.raises(ValidationError):
        OrderCreate(
            tableNumber="   ",
            serverId=1,
            items=[OrderItemCreate(productId=1, quantity=1)],
        )


def test_order_status_update_rejects_invalid_status():
    with pytest.raises(ValidationError):
        OrderStatusUpdate(status="unknown_state")  # type: ignore[arg-type]


# ==============================================================================
# 3. Verificación de hashing de contraseñas
# ==============================================================================

def test_password_hashing_and_verification():
    raw = "SecretoFoodOps2026!"
    hashed_a = hash_password(raw)
    hashed_b = hash_password(raw)

    # Sal aleatoria produce hashes distintos para la misma contraseña
    assert hashed_a != raw
    assert hashed_a != hashed_b
    assert hashed_a.startswith("pbkdf2_sha256$")

    assert verify_password(raw, hashed_a) is True
    assert verify_password(raw, hashed_b) is True
    assert verify_password("ClaveIncorrecta", hashed_a) is False
    assert verify_password(raw, "formato_corrupto") is False
