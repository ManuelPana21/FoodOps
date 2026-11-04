"""
Router de catálogo de productos para FoodOps API.
"""
import sqlite3
from typing import List
from fastapi import APIRouter, Depends
from backend.database import get_db
from backend.schemas.product import ProductResponse

router = APIRouter(prefix="/api/products", tags=["Productos"])


@router.get(
    "",
    response_model=List[ProductResponse],
    summary="Listar catálogo de productos",
)
def list_products(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT p.id, p.name, p.description, p.price, p.category_id, p.image_url,
               p.is_active, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        ORDER BY p.category_id ASC, p.name ASC;
        """
    )
    rows = cursor.fetchall()

    return [
        ProductResponse(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            price=float(row["price"]),
            category_id=row["category_id"],
            category_name=row["category_name"],
            image_url=row["image_url"],
            is_active=bool(row["is_active"]),
        )
        for row in rows
    ]
