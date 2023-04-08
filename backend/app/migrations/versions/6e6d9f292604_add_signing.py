"""Add signing

Revision ID: 6e6d9f292604
Revises: 3aafbdddd709
Create Date: 2023-04-08 23:50:48.637799

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6e6d9f292604'
down_revision = '3aafbdddd709'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('email',
                    sa.Column('email_address', sa.VARCHAR(), nullable=False),
                    sa.Column('user_id', sa.INTEGER(), nullable=False),
                    sa.PrimaryKeyConstraint('email_address')
                    )
    op.create_table('registrationrequest',
                    sa.Column('email_address', sa.VARCHAR(), nullable=False),
                    sa.Column('id', sa.INTEGER(), nullable=False),
                    sa.Column('user_id', sa.INTEGER(), nullable=False),
                    sa.Column('creation_datetime', sa.DATETIME(), nullable=False),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('email_address')
                    )
    op.create_table('loginrequests',
                    sa.Column('id', sa.INTEGER(), nullable=False),
                    sa.Column('user_id', sa.INTEGER(), nullable=False),
                    sa.Column('creation_datetime', sa.DATETIME(), nullable=False),
                    sa.PrimaryKeyConstraint('id')
                    )


def downgrade() -> None:
    op.drop_table('loginrequests')
    op.drop_table('registrationrequest')
    op.drop_table('email')