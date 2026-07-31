from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.item import Item, ItemType, ItemStatus
from app.models.user import User
from app.schemas.item import ItemCreate, ItemUpdate


def create_item(db: Session, item_in: ItemCreate, current_user: User) -> Item:
    new_item = Item(
        **item_in.model_dump(),
        user_id=current_user.id,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


def get_item_or_404(db: Session, item_id: int) -> Item:
    item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.deleted_at.is_(None))
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return item


def get_item_detail(db: Session, item_id: int) -> Item:
    item = get_item_or_404(db, item_id)
    item.view_count += 1
    db.commit()
    db.refresh(item)
    return item


def list_items(
    db: Session,
    page: int = 1,
    page_size: int = 12,
    item_type: Optional[ItemType] = None,
    category_id: Optional[int] = None,
    status_filter: Optional[ItemStatus] = None,
    building: Optional[str] = None,
    search: Optional[str] = None,
):
    query = db.query(Item).filter(Item.deleted_at.is_(None))

    if item_type:
        query = query.filter(Item.item_type == item_type)
    if category_id:
        query = query.filter(Item.category_id == category_id)
    if status_filter:
        query = query.filter(Item.status == status_filter)
    else:
        query = query.filter(Item.status == ItemStatus.ACTIVE)
    if building:
        query = query.filter(Item.building == building)
    if search and len(search) <= 100:  # ✅ Added length check to prevent DoS
        like = f"%{search}%"
        query = query.filter(
            or_(Item.title.ilike(like), Item.description.ilike(like))
        )

    total = query.count()
    items = (
        query.order_by(Item.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return total, items


def check_ownership(item: Item, current_user: User) -> None:
    if item.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this item",
        )


def update_item(db: Session, item_id: int, item_in: ItemUpdate, current_user: User) -> Item:
    item = get_item_or_404(db, item_id)
    check_ownership(item, current_user)

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def update_item_status(db: Session, item_id: int, new_status: ItemStatus, current_user: User) -> Item:
    item = get_item_or_404(db, item_id)
    check_ownership(item, current_user)
    item.status = new_status
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int, current_user: User) -> None:
    item = get_item_or_404(db, item_id)
    check_ownership(item, current_user)
    # ✅ Use timezone-aware UTC datetime
    item.deleted_at = datetime.now(timezone.utc)
    db.commit()


def get_my_reports(db: Session, current_user: User, page: int = 1, page_size: int = 12):
    query = (
        db.query(Item)
        .filter(Item.user_id == current_user.id, Item.deleted_at.is_(None))
        .order_by(Item.created_at.desc())
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return total, items
