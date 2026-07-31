from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimResponse
from app.services import claim_service

router = APIRouter(tags=["Claims"])


@router.post("/api/items/{item_id}/claims", response_model=ClaimResponse, status_code=201)
def submit_claim(
    item_id: int,
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_service.submit_claim(db, item_id, claim_in, current_user)


@router.get("/api/items/{item_id}/claims", response_model=list[ClaimResponse])
def list_claims_for_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_service.get_claims_for_item(db, item_id, current_user)


@router.patch("/api/claims/{claim_id}/approve", response_model=ClaimResponse)
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_service.approve_claim(db, claim_id, current_user)


@router.patch("/api/claims/{claim_id}/reject", response_model=ClaimResponse)
def reject_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_service.reject_claim(db, claim_id, current_user)


@router.patch("/api/claims/{claim_id}/cancel", response_model=ClaimResponse)
def cancel_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_service.cancel_claim(db, claim_id, current_user)
