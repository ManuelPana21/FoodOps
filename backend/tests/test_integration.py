"""
Pruebas de Integración y Concurrencia (tests/test_integration.py):
- Ciclo completo: POST /api/auth/login -> GET /api/products -> POST /api/orders -> PATCH /api/orders/{id}/status.
- Prueba de concurrencia: dos peticiones simultáneas actualizando el estado de la misma orden (pending -> in_progress).
"""
import asyncio
import httpx
import pytest


def test_full_order_lifecycle_integration(client):
    # 1. Login como mesero
    waiter_login = client.post(
        "/api/auth/login",
        json={"username": "mesero", "password": "mesero123"},
    )
    assert waiter_login.status_code == 200
    waiter_token = waiter_login.json()["access_token"]
    waiter_headers = {"Authorization": f"Bearer {waiter_token}"}

    # 2. Consultar catálogo de productos
    products_res = client.get("/api/products")
    assert products_res.status_code == 200
    products = products_res.json()
    assert len(products) >= 2
    first_prod = products[0]
    second_prod = products[1]

    # 3. Crear nueva orden como mesero
    create_res = client.post(
        "/api/orders",
        headers=waiter_headers,
        json={
            "tableNumber": "Mesa Integración 10",
            "serverId": waiter_login.json()["user"]["id"],
            "note": "Sin picante",
            "items": [
                {"productId": first_prod["id"], "quantity": 2},
                {"productId": second_prod["id"], "quantity": 1},
            ],
        },
    )
    assert create_res.status_code == 201
    created_order = create_res.json()
    order_id = created_order["id"]
    expected_total = round(first_prod["price"] * 2 + second_prod["price"], 2)
    assert created_order["status"] == "pending"
    assert created_order["totalAmount"] == expected_total

    # 4. Login como cocinero y procesar la orden (pending -> in_progress -> done)
    kitchen_login = client.post(
        "/api/auth/login",
        json={"username": "cocinero", "password": "cocina123"},
    )
    assert kitchen_login.status_code == 200
    kitchen_headers = {"Authorization": f"Bearer {kitchen_login.json()['access_token']}"}

    patch_progress = client.patch(
        f"/api/orders/{order_id}/status",
        headers=kitchen_headers,
        json={"status": "in_progress"},
    )
    assert patch_progress.status_code == 200
    assert patch_progress.json()["status"] == "in_progress"

    patch_done = client.patch(
        f"/api/orders/{order_id}/status",
        headers=kitchen_headers,
        json={"status": "done"},
    )
    assert patch_done.status_code == 200
    assert patch_done.json()["status"] == "done"

    # 5. Verificar persistencia final en BD de pruebas
    get_res = client.get(f"/api/orders/{order_id}", headers=waiter_headers)
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "done"


@pytest.mark.asyncio
async def test_concurrent_order_status_updates(client, waiter_headers, kitchen_headers):
    """
    Simula dos peticiones simultáneas intentando actualizar el estado de la misma orden
    (pending -> in_progress), verificando integridad transaccional sin errores 500 ni bloqueos.
    """
    from backend.main import app

    create_res = client.post(
        "/api/orders",
        headers=waiter_headers,
        json={
            "tableNumber": "Mesa Concurrencia",
            "serverId": 1,
            "items": [{"productId": 1, "quantity": 1}],
        },
    )
    assert create_res.status_code == 201
    order_id = create_res.json()["id"]

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        req_a = async_client.patch(
            f"/api/orders/{order_id}/status",
            headers=kitchen_headers,
            json={"status": "in_progress"},
        )
        req_b = async_client.patch(
            f"/api/orders/{order_id}/status",
            headers=kitchen_headers,
            json={"status": "in_progress"},
        )
        res_a, res_b = await asyncio.gather(req_a, req_b)

    assert res_a.status_code == 200
    assert res_b.status_code == 200
    assert res_a.json()["status"] == "in_progress"
    assert res_b.json()["status"] == "in_progress"

    # Confirmar estado consistente en BD tras la concurrencia
    final_res = client.get(f"/api/orders/{order_id}", headers=kitchen_headers)
    assert final_res.status_code == 200
    assert final_res.json()["status"] == "in_progress"
