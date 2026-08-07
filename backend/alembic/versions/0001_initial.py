"""initial schema — users, projects

Revision ID: 0001
Revises:
Create Date: 2026-08-06

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# create_type=False — типы создаются/удаляются вручную ниже (checkfirst=True),
# иначе op.create_table() дополнительно вешает свой собственный before_create
# на CREATE TYPE и мы получаем DuplicateObjectError.
tariff_plan = postgresql.ENUM("trial", "basic", "business", name="tariffplan", create_type=False)
site_type = postgresql.ENUM("landing", "shop", "multipage", "crm", name="sitetype", create_type=False)
style_preset = postgresql.ENUM("business", "warm", "techno", "custom", name="stylepreset", create_type=False)
project_status = postgresql.ENUM("draft", "generating", "ready", "published", name="projectstatus", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    tariff_plan.create(bind, checkfirst=True)
    site_type.create(bind, checkfirst=True)
    style_preset.create(bind, checkfirst=True)
    project_status.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("tariff", tariff_plan, nullable=False, server_default="trial"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False, server_default="Новый проект"),
        sa.Column("type", site_type, nullable=False),
        sa.Column("style", style_preset, nullable=False),
        sa.Column("status", project_status, nullable=False, server_default="draft"),
        sa.Column("site_data", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("settings", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("published_url", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_projects_owner_id", "projects", ["owner_id"])


def downgrade() -> None:
    op.drop_table("projects")
    op.drop_table("users")
    tariff_plan.drop(op.get_bind(), checkfirst=True)
    site_type.drop(op.get_bind(), checkfirst=True)
    style_preset.drop(op.get_bind(), checkfirst=True)
    project_status.drop(op.get_bind(), checkfirst=True)
