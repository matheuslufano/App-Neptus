"""Missing placeholder migration for revision f1c682e18b0c

This placeholder exists because the repository references revision f1c682e18b0c
as the parent of 757d1c0dcfb5, but the original migration file is absent.

If the schema in the database already matches the application models, this
placeholder allows Alembic to resolve the revision graph and continue.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f1c682e18b0c'
down_revision = 'f40bda520ff1'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
