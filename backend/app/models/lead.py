import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import LeadKind


class Lead(Base):
    """Заявка или заказ, пришедшие с опубликованного сайта.

    Сгенерированный сайт статический — своего бэкенда у него нет, поэтому форма
    стучится на наш публичный эндпоинт (`/api/v1/public/projects/{id}/leads`),
    а не куда-то ещё. Здесь заявка и живёт: владелец проекта видит её в админке,
    а внешние каналы (вебхук/Telegram) бэкенд дублирует уже серверной стороной.
    """

    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )

    kind: Mapped[LeadKind] = mapped_column(Enum(LeadKind), nullable=False, default=LeadKind.lead)

    name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    phone: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    email: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    message: Mapped[str] = mapped_column(String(2000), nullable=False, default="")

    # Произвольные поля формы (состав задаёт LeadFormSection.fields) и, для
    # заказов, состав корзины — хранятся как есть, чтобы добавление нового поля
    # в форму не требовало миграции.
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Откуда пришла заявка: страница сайта и id блока-формы.
    source_page: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    source_block: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped["Project"] = relationship(back_populates="leads")  # noqa: F821
