"""gemini_embeddings_768_dim

Revision ID: 4d610850e4a8
Revises: d1df9d26405f
Create Date: 2026-06-19 13:13:25.062400

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d610850e4a8'
down_revision: Union[str, None] = 'd1df9d26405f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update pgvector dimensions from 1536 (OpenAI) to 768 (Gemini)
    op.execute("ALTER TABLE jobs ALTER COLUMN embedding TYPE vector(768);")
    op.execute("ALTER TABLE profiles ALTER COLUMN embedding TYPE vector(768);")


def downgrade() -> None:
    # Revert back to 1536
    op.execute("ALTER TABLE jobs ALTER COLUMN embedding TYPE vector(1536);")
    op.execute("ALTER TABLE profiles ALTER COLUMN embedding TYPE vector(1536);")
