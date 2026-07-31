from datetime import datetime, timezone
from app.services.notification_service import create_notification
from app.models.notification import NotificationType

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.claim import Claim, ClaimStatus
from app.models.item import Item, ItemType, ItemStatus
from app.models.user import User
from app.schemas.claim import ClaimCreate
from app.services.item_service import get_item_or_404


def submit_claim(db: Session, item_id: int, claim_in: ClaimCreate, current_user: User) -> Claim:
    item = get_item_or_404(db, item_id)

    if item.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot claim your own item",
        )

    if item.status != ItemStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This item is not open for claims",
        )

    existing = (
        db.query(Claim)
        .filter(
            Claim.item_id == item_id,
            Claim.claimant_id == current_user.id,
            Claim.status == ClaimStatus.PENDING,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending claim on this item",
        )

    claim = Claim(
        item_id=item_id,
        claimant_id=current_user.id,
        message=claim_in.message,
        proof_text=claim_in.proof_text,
    )
    db.add(claim)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        # PostgreSQL's partial unique index prevents two concurrent
        # pending claims for the same user/item.
        if "uq_claims_pending_item_claimant" in str(exc.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a pending claim on this item",
            )

        raise

    db.refresh(claim)

    # ✅ FIX: Fetch item owner info for notification
    item_owner = db.query(User).filter(User.id == item.user_id).first()
    
    verb = "found your lost item" if item.item_type == ItemType.LOST else "submitted a claim on your found item"
    
    # ✅ FIX: Send notification to item owner
    create_notification(
        db,
        user_id=item.user_id,
        title="New response on your item" if item.item_type == ItemType.LOST else "New claim on your item",
        message=f"{current_user.full_name} {verb} '{item.title}'",
        notification_type=NotificationType.CLAIM,
        target_url=f"/items/{item.id}",
    )
    
    # ✅ FIX: Commit after notification is created
    db.commit()

    return claim


def get_claims_for_item(db: Session, item_id: int, current_user: User) -> list[Claim]:
    item = get_item_or_404(db, item_id)

    if item.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the item owner can view claims",
        )

    return (
        db.query(Claim)
        .filter(Claim.item_id == item_id)
        .order_by(Claim.created_at.desc())
        .all()
    )


def get_claim_or_404(db: Session, claim_id: int) -> Claim:
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


def _check_item_owner(item: Item, current_user: User) -> None:
    if item.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the item owner can review this claim",
        )


def approve_claim(db: Session, claim_id: int, current_user: User) -> Claim:
    claim = get_claim_or_404(db, claim_id)
    item = get_item_or_404(db, claim.item_id)
    _check_item_owner(item, current_user)

    if claim.status != ClaimStatus.PENDING:
        raise HTTPException(status_code=400, detail="Claim already reviewed")

    # ✅ Use timezone-aware UTC datetime
    now = datetime.now(timezone.utc)

    claim.status = ClaimStatus.APPROVED
    claim.reviewed_by = current_user.id
    claim.reviewed_at = now

    item.status = ItemStatus.RESOLVED

    # Reject all other pending claims for this item.
    (
        db.query(Claim)
        .filter(
            Claim.item_id == item.id,
            Claim.id != claim.id,
            Claim.status == ClaimStatus.PENDING,
        )
        .update(
            {
                Claim.status: ClaimStatus.REJECTED,
                Claim.reviewed_by: current_user.id,
                Claim.reviewed_at: now,
            },
            synchronize_session=False,
        )
    )

    verb = "was confirmed" if item.item_type == ItemType.LOST else "was approved"

    create_notification(
        db,
        user_id=claim.claimant_id,
        title=(
            "Your response was confirmed"
            if item.item_type == ItemType.LOST
            else "Your claim was approved"
        ),
        message=(
            f"Your submission on '{item.title}' {verb}. "
            "You can now contact the reporter."
        ),
        notification_type=NotificationType.CLAIM,
        target_url=f"/items/{item.id}",
    )

    db.commit()
    db.refresh(claim)

    return claim


def reject_claim(db: Session, claim_id: int, current_user: User) -> Claim:
    claim = get_claim_or_404(db, claim_id)
    item = get_item_or_404(db, claim.item_id)
    _check_item_owner(item, current_user)

    if claim.status != ClaimStatus.PENDING:
        raise HTTPException(status_code=400, detail="Claim already reviewed")

    claim.status = ClaimStatus.REJECTED
    claim.reviewed_by = current_user.id
    # ✅ Use timezone-aware UTC datetime
    claim.reviewed_at = datetime.now(timezone.utc)

    create_notification(
        db,
        user_id=claim.claimant_id,
        title="Your claim was rejected",
        message=f"Your claim on '{item.title}' was not approved.",
        notification_type=NotificationType.CLAIM,
        target_url=f"/items/{item.id}",
    )

    db.commit()
    db.refresh(claim)

    return claim


def cancel_claim(db: Session, claim_id: int, current_user: User) -> Claim:
    claim = get_claim_or_404(db, claim_id)

    if claim.claimant_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own claim")

    if claim.status != ClaimStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending claims can be cancelled")

    claim.status = ClaimStatus.CANCELLED
    db.commit()
    db.refresh(claim)
    return claim
