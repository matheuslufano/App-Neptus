"""Add audit log table

Revision ID: a4f5c8b2d1e7
Revises: f40bda520ff1
Create Date: 2026-05-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a4f5c8b2d1e7'
down_revision = 'f40bda520ff1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Uuid(), primary_key=True, nullable=False),
        sa.Column('entity_name', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=True),
        sa.Column('operation', sa.String(length=20), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('user_email', sa.String(length=120), nullable=True),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('data_before', sa.JSON(), nullable=True),
        sa.Column('data_after', sa.JSON(), nullable=True),
        sa.Column('changed_fields', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['usuario.id'], ondelete='SET NULL')
    )


def downgrade():
    op.drop_table('audit_log')
