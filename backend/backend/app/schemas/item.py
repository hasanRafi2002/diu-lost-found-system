import uuid
from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from app.models.item import ItemType, ItemStatus


class ItemBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    item_type: ItemType
    category_id: Optional[int] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    specific_location: Optional[str] = None
    lost_found_date: Optional[date] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    specific_location: Optional[str] = None
    lost_found_date: Optional[date] = None


class ItemStatusUpdate(BaseModel):
    status: ItemStatus


class ItemResponse(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: uuid.UUID
    user_id: int
    status: ItemStatus
    image_url: Optional[str] = None
    view_count: int
    created_at: datetime
    updated_at: datetime


class ItemListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ItemResponse]
