import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from app.models.claim import ClaimStatus


class ClaimCreate(BaseModel):
    message: str = Field(..., min_length=10)
    proof_text: Optional[str] = None


class ClaimantInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None


class ClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: uuid.UUID
    item_id: int
    message: str
    proof_text: Optional[str] = None
    status: ClaimStatus
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    claimant: ClaimantInfo
