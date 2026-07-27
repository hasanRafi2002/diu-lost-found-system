import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Enum,
    ForeignKey, Date
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.database import Base


class ItemType(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"


class ItemStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLAIMED = "CLAIMED"
    RESOLVED = "RESOLVED"
    ARCHIVED = "ARCHIVED"


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    item_type = Column(Enum(ItemType), nullable=False, index=True)
    status = Column(Enum(ItemStatus), default=ItemStatus.ACTIVE, index=True)

    brand = Column(String(80), nullable=True)
    color = Column(String(50), nullable=True)

    building = Column(String(50), nullable=True, index=True)
    floor = Column(String(10), nullable=True)
    room = Column(String(20), nullable=True)
    specific_location = Column(String(150), nullable=True)

    lost_found_date = Column(Date, nullable=True)
    image_url = Column(String(255), nullable=True)

    view_count = Column(Integer, default=0)

    # ✅ Updated to use lambda with timezone-aware UTC
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)

    owner = relationship("User", back_populates="items")
    category = relationship("Category", back_populates="items")
