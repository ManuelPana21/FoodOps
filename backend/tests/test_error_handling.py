"""
Pruebas exhaustivas para el middleware y manejadores de excepciones HTTP.
Verifica que las respuestas para códigos 400, 404, 422 y 500 cumplan con el formato estándar JSON:
{
    "status": "error",
    "code": <400 | 404 | 422 | 500>,
    "message": "<string>",
    "detail": "<string>",
    "details": <lista | objeto | null>
}
"""
import pytest


def test_standard_error_response_400(client):
    """Verifica respuesta estándar JSON en error 400 (Bad Request)."""
    # 1. Mediante endpoint de prueba
    response = client.get("/api/test/error-400")
    assert response.status_code == 400
    assert response.headers["content-type"].startswith("application/json")
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 400
    assert "inválido" in data["message"].lower() or "bad request" in data["message"].lower()
    assert data["detail"] is not None

    # 2. Mediante orden con mesero inexistente en la base de datos
    bad_order = client.post(
        "/api/orders",
        json={
            "tableNumber": "Mesa 99",
            "serverId": 99999,  # Mesero inexistente
            "items": [{"productId": 1, "quantity": 1}],
        },
    )
    assert bad_order.status_code == 400
    bad_data = bad_order.json()
    assert bad_data["status"] == "error"
    assert bad_data["code"] == 400
    assert "mesero" in bad_data["message"].lower()


def test_standard_error_response_404(client):
    """Verifica respuesta estándar JSON en error 404 (Not Found)."""
    # 1. Mediante ruta inexistente
    response = client.get("/api/ruta-que-no-existe-en-el-sistema")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 404
    assert "encontrad" in data["message"].lower() or "not found" in data["message"].lower()
    assert data["detail"] is not None

    # 2. Mediante ID de pedido inexistente
    order_404 = client.get("/api/orders/999999")
    assert order_404.status_code == 404
    data_404 = order_404.json()
    assert data_404["status"] == "error"
    assert data_404["code"] == 404
    assert "999999" in data_404["message"]


def test_standard_error_response_422(client):
    """Verifica respuesta estándar JSON en error 422 (Unprocessable Entity)."""
    # Envío de un payload con datos que no cumplen los tipos ni restricciones
    response = client.post(
        "/api/orders",
        json={
            "tableNumber": "",  # Mesa vacía
            "serverId": "invalido",  # Debe ser entero
            "items": [],  # Debe contener al menos un item
        },
    )
    assert response.status_code == 422
    assert response.headers["content-type"].startswith("application/json")
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 422
    assert "error de validación" in data["message"].lower()
    assert data["detail"] is not None
    assert isinstance(data["details"], list)
    assert len(data["details"]) >= 1

    # Verificar que cada detalle contiene field, message y type
    for item in data["details"]:
        assert "field" in item
        assert "message" in item
        assert "type" in item


def test_standard_error_response_500(client):
    """Verifica respuesta estándar JSON en error 500 (Internal Server Error)."""
    response = client.get("/api/test/error-500")
    assert response.status_code == 500
    assert response.headers["content-type"].startswith("application/json")
    data = response.json()

    assert data["status"] == "error"
    assert data["code"] == 500
    assert "error interno del servidor" in data["message"].lower()
    assert data["detail"] is not None


def test_standard_error_structure_consistency(client):
    """Garantiza la consistencia estructural idéntica en las 4 respuestas de error."""
    endpoints_to_test = [
        ("/api/test/error-400", 400),
        ("/api/test/error-404", 404),
        ("/api/orders/999999", 404),
        ("/api/test/error-500", 500),
    ]

    for path, expected_code in endpoints_to_test:
        res = client.get(path)
        assert res.status_code == expected_code
        body = res.json()
        assert set(body.keys()) == {"status", "code", "message", "detail", "details"}
        assert body["status"] == "error"
        assert body["code"] == expected_code
        assert isinstance(body["message"], str)
        assert isinstance(body["detail"], str)
