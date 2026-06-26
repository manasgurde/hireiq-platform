"""merge heads

Revision ID: 30a75a7312bc
Revises: 32a2ff804294, 432b7e521048
Create Date: 2026-06-22 10:56:12.114401

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30a75a7312bc'
down_revision: Union[str, None] = ('32a2ff804294', '432b7e521048')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
