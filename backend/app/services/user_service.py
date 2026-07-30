from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import ProfileUpdate


def update_profile(db: Session, current_user: User, data: ProfileUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


def update_profile_image(db: Session, current_user: User, image_url: str) -> User:
    current_user.profile_image = image_url
    db.commit()
    db.refresh(current_user)
    return current_user
