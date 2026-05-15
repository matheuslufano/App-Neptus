"""Atualiza model Tanque

Revision ID: daa3e4058ab8
Revises: f40bda520ff1
Create Date: 2025-11-17 17:14:38.888877

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'daa3e4058ab8'
down_revision = 'f40bda520ff1'
branch_labels = None
depends_on = None


def upgrade():
    # Ensure the old unique constraint is dropped if it exists.
    op.execute("ALTER TABLE tanque DROP CONSTRAINT IF EXISTS tanque_nome_key")

    # Create the new multi-column unique constraint only when it does not already exist.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'uq_tanque_nome_propriedade'
                  AND conrelid = 'tanque'::regclass
            ) THEN
                ALTER TABLE tanque ADD CONSTRAINT uq_tanque_nome_propriedade UNIQUE (id_propriedade, nome);
            END IF;
        END
        $$;
        """
    )


def downgrade():
    op.execute("ALTER TABLE tanque DROP CONSTRAINT IF EXISTS uq_tanque_nome_propriedade")
    op.execute("ALTER TABLE tanque DROP CONSTRAINT IF EXISTS tanque_nome_key")
    op.execute("ALTER TABLE tanque ADD CONSTRAINT tanque_nome_key UNIQUE (nome)")
