from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime

from app.models.user import User
from app.models.item import Item, ItemType, ItemStatus
from app.models.claim import Claim, ClaimStatus
from app.schemas.admin import DashboardStats


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_users = db.query(func.count(User.id)).scalar()
    total_items = db.query(func.count(Item.id)).filter(Item.deleted_at.is_(None)).scalar()
    total_lost = db.query(func.count(Item.id)).filter(
        Item.item_type == ItemType.LOST, Item.deleted_at.is_(None)
    ).scalar()
    total_found = db.query(func.count(Item.id)).filter(
        Item.item_type == ItemType.FOUND, Item.deleted_at.is_(None)
    ).scalar()
    total_active = db.query(func.count(Item.id)).filter(
        Item.status == ItemStatus.ACTIVE, Item.deleted_at.is_(None)
    ).scalar()
    total_resolved = db.query(func.count(Item.id)).filter(
        Item.status == ItemStatus.RESOLVED, Item.deleted_at.is_(None)
    ).scalar()
    total_claims = db.query(func.count(Claim.id)).scalar()
    total_pending_claims = db.query(func.count(Claim.id)).filter(
        Claim.status == ClaimStatus.PENDING
    ).scalar()

    return DashboardStats(
        total_users=total_users,
        total_items=total_items,
        total_lost=total_lost,
        total_found=total_found,
        total_active=total_active,
        total_resolved=total_resolved,
        total_claims=total_claims,
        total_pending_claims=total_pending_claims,
    )


def list_all_users(db: Session, page: int = 1, page_size: int = 20):
    query = db.query(User).order_by(User.created_at.desc())
    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    return total, users


def list_all_items(db: Session, page: int = 1, page_size: int = 20):
    query = db.query(Item).order_by(Item.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return total, items


def deactivate_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def reactivate_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


def admin_delete_item(db: Session, item_id: int) -> None:
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.deleted_at = datetime.utcnow()
    db.commit()
