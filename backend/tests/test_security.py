"""
Pruebas de Seguridad, RBAC y Manejo de Errores (tests/test_security.py):
- Rol 'mesero' recibe 403 Forbidden al intentar cambiar el estado en cocina.
- Peticiones sin token reciben 401 Unauthorized.
- Errores 400, 404, 422 devuelven JSON estructurado sin exponer stack traces internos.
"""


def test_unauthenticated_requests_return_401(client):
    res_create = client.post(
        "/api/orders",
        json={"tableNumber": "Mesa 1", "serverId": 1, "items": [{"productId": 1, "quantity": 1}]},
    )
    assert res_create.status_code == 401
    assert res_create.json()["status"] == "error"
    assert res_create.json()["code"] == 401

    res_patch = client.patch("/api/orders/101/status", json={"status": "in_progress"})
    assert res_patch.status_code == 401
    assert res_patch.json()["status"] == "error"
    assert res_patch.json()["code"] == 401

    res_list = client.get("/api/orders")
    assert res_list.status_code == 401


def test_waiter_forbidden_from_updating_kitchen_status_403(client, waiter_headers):
    """Un token con rol 'waiter' (mesero) debe recibir 403 Forbidden en PATCH /api/orders/{id}/status."""
    res = client.patch(
        "/api/orders/101/status",
        headers=waiter_headers,
        json={"status": "in_progress"},
    )
    assert res.status_code == 403
    data = res.json()
    assert data["status"] == "error"
    assert data["code"] == 403
    assert "permisos" in data["message"].lower() or "denegado" in data["message"].lower()


def test_invalid_login_credentials_return_401(client):
    res = client.post(
        "/api/auth/login",
        json={"username": "mesero", "password": "wrong-password"},
    )
    assert res.status_code == 401
    data = res.json()
    assert data["status"] == "error"
    assert data["code"] == 401


def test_structured_errors_without_stack_traces(client, waiter_headers):
    """Verifica que 400, 404 y 422 devuelvan JSON estándar sin stack traces internos."""
    responses = [
        # 400: mesero inexistente
        client.post(
            "/api/orders",
            headers=waiter_headers,
            json={"tableNumber": "Mesa 9", "serverId": 99999, "items": [{"productId": 1, "quantity": 1}]},
        ),
        # 404: orden inexistente
        client.get("/api/orders/999999", headers=waiter_headers),
        # 422: payload inválido
        client.post(
            "/api/orders",
            headers=waiter_headers,
            json={"tableNumber": "", "serverId": 1, "items": []},
        ),
    ]
    expected_codes = [400, 404, 422]

    for res, expected_code in zip(responses, expected_codes):
        assert res.status_code == expected_code
        body_text = res.text.lower()
        assert "traceback" not in body_text
        assert 'file "' not in body_text
        assert "sqlite3." not in body_text

        data = res.json()
        assert data["status"] == "error"
        assert data["code"] == expected_code
        assert isinstance(data["message"], str) and len(data["message"]) > 0
        assert "detail" in data
