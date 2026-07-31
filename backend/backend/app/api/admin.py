from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import require_admin
from app.models.user import User
from app.schemas.admin import DashboardStats, UserListResponse
from app.schemas.user import UserResponse
from app.schemas.item import ItemResponse, ItemListResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return admin_service.get_dashboard_stats(db)


@router.get("/users", response_model=UserListResponse)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total, users = admin_service.list_all_users(db, page, page_size)
    return UserListResponse(total=total, page=page, page_size=page_size, users=users)


@router.get("/items", response_model=ItemListResponse)
def list_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total, items = admin_service.list_all_items(db, page, page_size)
    return ItemListResponse(total=total, page=page, page_size=page_size, items=items)


@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return admin_service.deactivate_user(db, user_id)


@router.patch("/users/{user_id}/reactivate", response_model=UserResponse)
def reactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return admin_service.reactivate_user(db, user_id)


@router.delete("/items/{item_id}", status_code=204)
def admin_delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    admin_service.admin_delete_item(db, item_id)
    return None
