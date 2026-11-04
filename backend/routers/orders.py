"""
Router para gestión de pedidos y cola KDS en FoodOps.
Integra los schemas de Pydantic para validación estricta de comandas.
"""
import sqlite3
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
    KitchenTicketResponse,
)

router = APIRouter(prefix="/api/orders", tags=["Pedidos"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo pedido",
    description="Valida que el pedido contenga al menos un item con cantidad mayor a 0 antes de procesarlo.",
)
def create_order(
    order_in: OrderCreate,
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()

    # 1. Validar existencia del mesero (Código 400 Bad Request si no es válido)
    cursor.execute("SELECT id, name FROM users WHERE id = ?;", (order_in.server_id,))
    server_row = cursor.fetchone()
    if not server_row:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El personal/mesero con ID {order_in.server_id} no está registrado en el sistema.",
        )
    server_name = server_row["name"]

    # 2. Validar que cada producto exista y obtener su precio actual (Código 404 si no existe)
    prepared_items = []
    total_amount = 0.0

    for item in order_in.items:
        cursor.execute(
            "SELECT id, name, price, is_active FROM products WHERE id = ?;",
            (item.product_id,),
        )
        prod = cursor.fetchone()
        if not prod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El producto con ID {item.product_id} no existe en el catálogo.",
            )
        if not prod["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{prod['name']}' (ID {item.product_id}) se encuentra actualmente inactivo.",
            )

        unit_price = item.unit_price if item.unit_price is not None else float(prod["price"])
        subtotal = round(unit_price * item.quantity, 2)
        total_amount += subtotal

        prepared_items.append({
            "product_id": item.product_id,
            "product_name": prod["name"],
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
        })

    total_amount = round(total_amount, 2)

    # 3. Insertar la orden principal
    cursor.execute(
        """
        INSERT INTO orders (table_number, server_id, status, note, total_amount)
        VALUES (?, ?, 'pending', ?, ?);
        """,
        (order_in.table_number, order_in.server_id, order_in.note, total_amount),
    )
    order_id = cursor.lastrowid

    # 4. Insertar cada uno de los items detallados
    created_items_response: List[OrderItemResponse] = []
    for p_item in prepared_items:
        cursor.execute(
            """
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?);
            """,
            (order_id, p_item["product_id"], p_item["quantity"], p_item["unit_price"], p_item["subtotal"]),
        )
        item_id = cursor.lastrowid
        created_items_response.append(
            OrderItemResponse(
                id=item_id,
                order_id=order_id,
                product_id=p_item["product_id"],
                product_name=p_item["product_name"],
                quantity=p_item["quantity"],
                unit_price=p_item["unit_price"],
                subtotal=p_item["subtotal"],
            )
        )

    db.commit()

    # 5. Obtener los timestamps creados
    cursor.execute("SELECT created_at, updated_at FROM orders WHERE id = ?;", (order_id,))
    order_row = cursor.fetchone()

    return OrderResponse(
        id=order_id,
        table_number=order_in.table_number,
        server_id=order_in.server_id,
        server_name=server_name,
        status="pending",
        note=order_in.note,
        total_amount=total_amount,
        created_at=order_row["created_at"] if order_row else None,
        updated_at=order_row["updated_at"] if order_row else None,
        items=created_items_response,
    )


@router.get(
    "",
    response_model=List[OrderResponse],
    summary="Listar todos los pedidos",
)
def list_orders(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT o.id, o.table_number, o.server_id, o.status, o.note, o.total_amount,
               o.created_at, o.updated_at, u.name as server_name
        FROM orders o
        LEFT JOIN users u ON o.server_id = u.id
        ORDER BY o.created_at DESC;
        """
    )
    orders = cursor.fetchall()

    results: List[OrderResponse] = []
    for ord_row in orders:
        cursor.execute(
            """
            SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal,
                   p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?;
            """,
            (ord_row["id"],),
        )
        items_rows = cursor.fetchall()
        items = [
            OrderItemResponse(
                id=i["id"],
                order_id=i["order_id"],
                product_id=i["product_id"],
                product_name=i["product_name"],
                quantity=i["quantity"],
                unit_price=float(i["unit_price"]),
                subtotal=float(i["subtotal"]),
            )
            for i in items_rows
        ]

        results.append(
            OrderResponse(
                id=ord_row["id"],
                table_number=ord_row["table_number"],
                server_id=ord_row["server_id"],
                server_name=ord_row["server_name"],
                status=ord_row["status"],
                note=ord_row["note"],
                total_amount=float(ord_row["total_amount"]),
                created_at=ord_row["created_at"],
                updated_at=ord_row["updated_at"],
                items=items,
            )
        )

    return results


@router.get(
    "/queue",
    response_model=List[KitchenTicketResponse],
    summary="Cola activa para Kitchen Display System (KDS)",
)
def get_kds_queue(db: sqlite3.Connection = Depends(get_db)):
    """Obtiene los tickets en estado pendiente o en progreso para cocina."""
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT o.id, o.table_number, o.status, o.note, o.created_at, u.name as server_name
        FROM orders o
        LEFT JOIN users u ON o.server_id = u.id
        WHERE o.status IN ('pending', 'progress')
        ORDER BY o.created_at ASC;
        """
    )
    orders = cursor.fetchall()

    queue: List[KitchenTicketResponse] = []
    for ord_row in orders:
        cursor.execute(
            """
            SELECT oi.quantity, p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?;
            """,
            (ord_row["id"],),
        )
        items_rows = cursor.fetchall()
        items_str_list = [f"{i['quantity']}x {i['product_name']}" for i in items_rows]

        queue.append(
            KitchenTicketResponse(
                id=ord_row["id"],
                table=ord_row["table_number"],
                server=ord_row["server_name"] or "Mesero",
                age="5 min",
                status=ord_row["status"],
                items=items_str_list,
                note=ord_row["note"] or "",
            )
        )

    return queue


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Obtener detalle de un pedido por ID",
)
def get_order_by_id(order_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT o.id, o.table_number, o.server_id, o.status, o.note, o.total_amount,
               o.created_at, o.updated_at, u.name as server_name
        FROM orders o
        LEFT JOIN users u ON o.server_id = u.id
        WHERE o.id = ?;
        """,
        (order_id,),
    )
    ord_row = cursor.fetchone()
    if not ord_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El pedido con ID {order_id} no fue encontrado.",
        )

    cursor.execute(
        """
        SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal,
               p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?;
        """,
        (order_id,),
    )
    items_rows = cursor.fetchall()
    items = [
        OrderItemResponse(
            id=i["id"],
            order_id=i["order_id"],
            product_id=i["product_id"],
            product_name=i["product_name"],
            quantity=i["quantity"],
            unit_price=float(i["unit_price"]),
            subtotal=float(i["subtotal"]),
        )
        for i in items_rows
    ]

    return OrderResponse(
        id=ord_row["id"],
        table_number=ord_row["table_number"],
        server_id=ord_row["server_id"],
        server_name=ord_row["server_name"],
        status=ord_row["status"],
        note=ord_row["note"],
        total_amount=float(ord_row["total_amount"]),
        created_at=ord_row["created_at"],
        updated_at=ord_row["updated_at"],
        items=items,
    )


@router.patch(
    "/{order_id}/status",
    summary="Actualizar estado del pedido",
)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute("SELECT id, status FROM orders WHERE id = ?;", (order_id,))
    order_row = cursor.fetchone()
    if not order_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede actualizar: el pedido #{order_id} no existe.",
        )

    cursor.execute(
        """
        UPDATE orders
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
        """,
        (status_update.status, order_id),
    )
    db.commit()

    return {
        "id": order_id,
        "status": status_update.status,
        "message": f"Estado del pedido actualizado a '{status_update.status}'.",
    }
