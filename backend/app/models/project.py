import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import ProjectStatus, SiteType, StylePreset


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Новый проект")
    type: Mapped[SiteType] = mapped_column(Enum(SiteType), nullable=False)
    style: Mapped[StylePreset] = mapped_column(Enum(StylePreset), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(Enum(ProjectStatus), default=ProjectStatus.draft, nullable=False)

    # Site content — stored as JSON schema, never as raw HTML (see ТЗ п.1, п.3)
    site_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Domains / SEO / 152-ФЗ / integrations (ТЗ п.5)
    settings: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    published_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship(back_populates="projects")
