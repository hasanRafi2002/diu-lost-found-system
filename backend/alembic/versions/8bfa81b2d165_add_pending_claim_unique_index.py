"""add unique pending claim index

Revision ID: add_pending_claim_unique
Revises: 225d8a0a93a5
"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy import text


revision: str = "add_pending_claim_unique"
down_revision: Union[str, Sequence[str], None] = "225d8a0a93a5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "uq_claims_pending_item_claimant",
        "claims",
        ["item_id", "claimant_id"],
        unique=True,
        postgresql_where=text("status = 'PENDING'"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_claims_pending_item_claimant",
        table_name="claims",
    )
