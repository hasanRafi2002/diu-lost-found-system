from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, ProfileUpdate
from app.services import user_service
from app.services.upload_service import save_avatar_image

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update_profile(db, current_user, data)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_my_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_url = await save_avatar_image(file)
    return user_service.update_profile_image(db, current_user, image_url)
