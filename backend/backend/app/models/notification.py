import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey

from app.database.database import Base


class NotificationType(str, enum.Enum):
    CLAIM = "CLAIM"
    ITEM = "ITEM"
    SYSTEM = "SYSTEM"
    ACCOUNT = "ACCOUNT"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.SYSTEM)
    target_url = Column(String(255), nullable=True)

    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
