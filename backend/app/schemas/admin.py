from pydantic import BaseModel

from app.schemas.user import UserResponse

from app.schemas.user import UserResponse


class DashboardStats(BaseModel):
    total_users: int
    total_items: int
    total_lost: int
    total_found: int
    total_active: int
    total_resolved: int
    total_claims: int
    total_pending_claims: int


class UserRoleUpdate(BaseModel):
    role: str


class UserListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: list["UserResponse"]


class UserListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: list["UserResponse"]
