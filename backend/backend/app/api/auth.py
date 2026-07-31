from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import register_user, authenticate_user
from app.core.security import create_access_token
from app.dependencies import get_current_user
from app.models.user import User
from app.core.rate_limit import (
    account_login_rate_limiter,
    ip_login_rate_limiter,
    register_rate_limiter,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"

    if register_rate_limiter.is_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later.",
            headers={"Retry-After": "900"},
        )

    register_rate_limiter.record_attempt(client_ip)

    user = register_user(db, user_in)
    register_rate_limiter.reset(client_ip)

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    account_key = credentials.email.strip().lower()

    if (
        ip_login_rate_limiter.is_limited(client_ip)
        or account_login_rate_limiter.is_limited(account_key)
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
            headers={"Retry-After": "900"},
        )

    try:
        user = authenticate_user(
            db,
            credentials.email,
            credentials.password,
        )
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            ip_login_rate_limiter.record_attempt(client_ip)
            account_login_rate_limiter.record_attempt(account_key)

        raise

    ip_login_rate_limiter.reset(client_ip)
    account_login_rate_limiter.reset(account_key)

    token = create_access_token(data={"sub": str(user.uuid)})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
