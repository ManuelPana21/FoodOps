"""
Pydantic schemas para validación de pedidos y comandas en FoodOps.
Garantiza que los pedidos contengan al menos un item con cantidad mayor a 0.
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict

TicketStatus = Literal["pending", "progress", "done", "cancelled"]


class OrderItemBase(BaseModel):
    product_id: int = Field(
        ...,
        gt=0,
        alias="productId",
        description="ID del producto que se ordena (entero mayor a 0)"
    )
    quantity: int = Field(
        ...,
        gt=0,
        description="Cantidad requerida del producto (debe ser mayor a 0)"
    )
    unit_price: Optional[float] = Field(
        None,
        ge=0.0,
        alias="unitPrice",
        description="Precio unitario referencial"
    )

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v is None or v <= 0:
            raise ValueError("La cantidad del item debe ser mayor a 0.")
        return v


class OrderItemCreate(OrderItemBase):
    """Schema para creación de un item dentro del pedido."""
    pass


class OrderItemResponse(OrderItemBase):
    """Schema para visualización de item con subtotal calculado."""
    id: int
    order_id: int = Field(..., alias="orderId")
    subtotal: float
    product_name: Optional[str] = Field(None, alias="productName")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class OrderBase(BaseModel):
    table_number: str = Field(
        ...,
        min_length=1,
        alias="tableNumber",
        description="Número o identificador de la mesa"
    )
    server_id: int = Field(
        ...,
        gt=0,
        alias="serverId",
        description="ID del mesero que toma la comanda"
    )
    note: Optional[str] = Field(
        None,
        description="Instrucciones o notas adicionales para cocina"
    )

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("table_number")
    @classmethod
    def validate_table_number(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("El número de mesa no puede estar vacío.")
        return cleaned


class OrderCreate(OrderBase):
    """
    Schema para creación de un pedido en FoodOps.
    Valida estrictamente que el pedido contenga al menos un item con cantidad mayor a 0.
    """
    items: List[OrderItemCreate] = Field(
        ...,
        min_length=1,
        description="Lista de items del pedido. Debe incluir al menos un item con cantidad > 0."
    )

    @field_validator("items")
    @classmethod
    def validate_order_contains_valid_items(cls, items: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not items or len(items) == 0:
            raise ValueError("El pedido debe contener al menos un item.")

        items_with_positive_quantity = [item for item in items if item.quantity > 0]
        if not items_with_positive_quantity:
            raise ValueError("El pedido debe contener al menos un item con cantidad mayor a 0.")

        for idx, item in enumerate(items):
            if item.quantity <= 0:
                raise ValueError(
                    f"El item en posición {idx} tiene una cantidad inválida ({item.quantity}). "
                    "Todos los items deben tener cantidad mayor a 0."
                )

        return items


class OrderStatusUpdate(BaseModel):
    """Schema para actualización de estado del pedido/ticket en la cola KDS."""
    status: TicketStatus = Field(
        ...,
        description="Nuevo estado de la orden ('pending', 'progress', 'done', 'cancelled')"
    )

    model_config = ConfigDict(populate_by_name=True)


class OrderResponse(OrderBase):
    """Schema de respuesta completa para un pedido."""
    id: int
    status: TicketStatus
    total_amount: float = Field(..., alias="totalAmount")
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")
    server_name: Optional[str] = Field(None, alias="serverName")
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class KitchenTicketResponse(BaseModel):
    """
    Schema adaptado al frontend de Kitchen Display System (KDS).
    Compatible con la interfaz KitchenTicket de TypeScript.
    """
    id: int
    table: str
    server: str
    age: str
    status: TicketStatus
    items: List[str]
    note: str

    model_config = ConfigDict(populate_by_name=True)
