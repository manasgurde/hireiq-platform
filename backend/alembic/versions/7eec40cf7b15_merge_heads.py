"""merge_heads

Revision ID: 7eec40cf7b15
Revises: 4d610850e4a8, a2d7041db7fd
Create Date: 2026-06-20 21:33:50.860358

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7eec40cf7b15'
down_revision: Union[str, None] = ('4d610850e4a8', 'a2d7041db7fd')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
