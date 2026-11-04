"""
Pydantic schemas para productos y categorías.
"""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category_id: int = Field(..., alias="categoryId")
    category_name: Optional[str] = Field(None, alias="categoryName")
    image_url: Optional[str] = Field(None, alias="imageUrl")
    is_active: bool = Field(True, alias="isActive")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
