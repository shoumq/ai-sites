"""leads — заявки и заказы с опубликованных сайтов

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# create_type=False — тип создаётся вручную ниже (checkfirst=True), как в 0001:
# иначе op.create_table() навесит собственный before_create на CREATE TYPE и
# упадёт с DuplicateObjectError.
lead_kind = postgresql.ENUM("lead", "order", name="leadkind", create_type=False)


def upgrade() -> None:
    lead_kind.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("kind", lead_kind, nullable=False, server_default="lead"),
        sa.Column("name", sa.String(255), nullable=False, server_default=""),
        sa.Column("phone", sa.String(64), nullable=False, server_default=""),
        sa.Column("email", sa.String(255), nullable=False, server_default=""),
        sa.Column("message", sa.String(2000), nullable=False, server_default=""),
        sa.Column("payload", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("source_page", sa.String(255), nullable=False, server_default=""),
        sa.Column("source_block", sa.String(255), nullable=False, server_default=""),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_leads_project_id", "leads", ["project_id"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_leads_created_at", table_name="leads")
    op.drop_index("ix_leads_project_id", table_name="leads")
    op.drop_table("leads")
    lead_kind.drop(op.get_bind(), checkfirst=True)
