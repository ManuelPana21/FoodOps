"""
Pruebas unitarias y de integración para validar que los pedidos
contengan al menos un item con cantidad mayor a 0 utilizando Pydantic y FastAPI.
"""
import pytest
from pydantic import ValidationError
from backend.schemas.order import OrderCreate, OrderItemCreate


# ==============================================================================
# Pruebas Unitarias de Schemas Pydantic
# ==============================================================================

def test_order_with_valid_items_passes():
    """Un pedido con al menos un item con cantidad > 0 debe ser válido."""
    payload = {
        "tableNumber": "Mesa 4",
        "serverId": 1,
        "items": [
            {"productId": 1, "quantity": 2},
            {"productId": 2, "quantity": 1},
        ],
        "note": "Sin cebolla",
    }
    order = OrderCreate(**payload)
    assert order.table_number == "Mesa 4"
    assert order.server_id == 1
    assert len(order.items) == 2
    assert order.items[0].quantity == 2
    assert order.items[1].quantity == 1


def test_order_with_empty_items_fails():
    """Un pedido sin items (lista vacía) debe fallar la validación con error explícito."""
    payload = {
        "tableNumber": "Mesa 4",
        "serverId": 1,
        "items": [],
    }
    with pytest.raises(ValidationError) as exc_info:
        OrderCreate(**payload)

    errors = exc_info.value.errors()
    assert any("item" in str(err["msg"]).lower() for err in errors)


def test_order_with_item_quantity_zero_fails():
    """Un item con cantidad 0 debe ser rechazado por el schema."""
    with pytest.raises(ValidationError) as exc_info:
        OrderItemCreate(productId=1, quantity=0)

    errors = exc_info.value.errors()
    assert any("mayor a 0" in str(err["msg"]).lower() or "greater than 0" in str(err["msg"]).lower() for err in errors)


def test_order_with_item_quantity_negative_fails():
    """Un item con cantidad negativa debe ser rechazado por el schema."""
    with pytest.raises(ValidationError) as exc_info:
        OrderItemCreate(productId=1, quantity=-3)

    errors = exc_info.value.errors()
    assert any("mayor a 0" in str(err["msg"]).lower() or "greater than 0" in str(err["msg"]).lower() for err in errors)


def test_order_create_fails_if_no_item_has_positive_quantity():
    """El pedido completo falla si ningún item tiene cantidad mayor a 0."""
    raw_payload = {
        "tableNumber": "Mesa 1",
        "serverId": 1,
        "items": [
            {"productId": 1, "quantity": 0},
        ],
    }
    with pytest.raises(ValidationError) as exc_info:
        OrderCreate(**raw_payload)

    assert "mayor a 0" in str(exc_info.value).lower() or "greater than 0" in str(exc_info.value).lower()


# ==============================================================================
# Pruebas de Integración con FastAPI TestClient (HTTP 422 y HTTP 201)
# ==============================================================================

def test_api_create_order_empty_items_returns_422(client):
    """La API debe retornar código 422 en formato JSON estándar cuando la lista de items está vacía."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 3",
            "serverId": 1,
            "items": [],
        },
    )
    assert response.status_code == 422
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 422
    assert "error de validación" in data["message"].lower()
    assert isinstance(data["details"], list)
    assert len(data["details"]) > 0


def test_api_create_order_zero_quantity_returns_422(client):
    """La API debe retornar código 422 en formato JSON estándar cuando la cantidad es 0."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 3",
            "serverId": 1,
            "items": [
                {"productId": 1, "quantity": 0},
            ],
        },
    )
    assert response.status_code == 422
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 422
    assert isinstance(data["details"], list)
    field_names = [err["field"] for err in data["details"]]
    assert any("quantity" in f or "items" in f for f in field_names)


def test_api_create_order_negative_quantity_returns_422(client):
    """La API debe retornar código 422 en formato JSON estándar cuando la cantidad es negativa."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 3",
            "serverId": 1,
            "items": [
                {"productId": 1, "quantity": -5},
            ],
        },
    )
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == 422


def test_api_create_order_mixed_valid_and_invalid_quantity_fails(client):
    """Si un pedido tiene un item válido y otro con cantidad <= 0, debe fallar con 422."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 5",
            "serverId": 1,
            "items": [
                {"productId": 1, "quantity": 2},
                {"productId": 2, "quantity": 0},
            ],
        },
    )
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == 422


def test_api_create_order_blank_table_returns_422(client):
    """Un pedido con número de mesa en blanco debe fallar con 422."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "   ",
            "serverId": 1,
            "items": [{"productId": 1, "quantity": 1}],
        },
    )
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == 422


def test_api_create_order_nonexistent_product_returns_404(client):
    """Un pedido con un ID de producto inexistente debe retornar 404 estándar."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 8",
            "serverId": 1,
            "items": [{"productId": 999999, "quantity": 1}],
        },
    )
    assert response.status_code == 404
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == 404
    assert "999999" in data["message"]


def test_api_create_order_nonexistent_server_returns_400(client):
    """Un pedido con un ID de mesero no registrado debe retornar 400 estándar."""
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 8",
            "serverId": 999999,
            "items": [{"productId": 1, "quantity": 1}],
        },
    )
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == 400


def test_api_update_order_status_lifecycle(client):
    """Prueba el ciclo de vida de actualización de estado y validaciones asociadas."""
    # 1. Crear orden
    create_res = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa KDS",
            "serverId": 1,
            "items": [{"productId": 1, "quantity": 1}],
        },
    )
    assert create_res.status_code == 201
    order_id = create_res.json()["id"]

    # 2. Actualizar estado a 'progress'
    patch_res = client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "progress"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "progress"

    # 3. Actualizar con estado inválido debe retornar 422
    invalid_patch = client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "invalid_status_value"},
    )
    assert invalid_patch.status_code == 422
    assert invalid_patch.json()["status"] == "error"
    assert invalid_patch.json()["code"] == 422

    # 4. Actualizar orden inexistente debe retornar 404
    not_found_patch = client.patch(
        "/api/orders/888888/status",
        json={"status": "done"},
    )
    assert not_found_patch.status_code == 404
    assert not_found_patch.json()["status"] == "error"
    assert not_found_patch.json()["code"] == 404


def test_api_get_kds_queue_and_products(client):
    """Verifica que los endpoints de cola KDS y catálogo de productos respondan correctamente."""
    # Cola KDS
    queue_res = client.get("/api/orders/queue")
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert isinstance(queue, list)

    # Catálogo de productos
    prod_res = client.get("/api/products")
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert isinstance(products, list)
    assert len(products) > 0
    assert "price" in products[0]

