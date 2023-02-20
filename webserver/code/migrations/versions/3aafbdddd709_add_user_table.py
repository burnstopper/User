"""Add User table

Revision ID: 3aafbdddd709
Revises: 3f9d537accda
Create Date: 2023-02-19 19:56:38.813789

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3aafbdddd709'
down_revision = '3f9d537accda'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('user',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('session_token', sa.VARCHAR(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('object')


def downgrade() -> None:
    op.create_table('object',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('user')
