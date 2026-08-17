"""Схемы заявок/заказов, приходящих с опубликованных статических сайтов.

Тело запроса приходит из открытого интернета без авторизации, поэтому здесь
всё жёстко ограничено по длине и количеству: это единственная защита от того,
чтобы форма обратной связи не превратилась в способ залить в БД мегабайты.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.enums import LeadKind

# Позиция корзины в заказе.
MAX_CART_ITEMS = 100
MAX_EXTRA_FIELDS = 30


class LeadCartItem(BaseModel):
    name: str = Field(max_length=255)
    price: str = Field(default="", max_length=64)
    qty: int = Field(default=1, ge=1, le=999)
    sku: str = Field(default="", max_length=128)


class LeadIn(BaseModel):
    kind: LeadKind = LeadKind.lead
    name: str = Field(default="", max_length=255)
    phone: str = Field(default="", max_length=64)
    email: str = Field(default="", max_length=255)
    message: str = Field(default="", max_length=2000)
    # Произвольные поля формы сверх стандартных — состав задаёт LeadFormSection.
    extra: dict[str, str] = Field(default_factory=dict)
    items: list[LeadCartItem] = Field(default_factory=list, max_length=MAX_CART_ITEMS)
    total: str = Field(default="", max_length=64)
    source_page: str = Field(default="", max_length=255)
    source_block: str = Field(default="", max_length=255)
    # Honeypot: скрытое поле, которое человек не заполняет, а простой бот — да.
    # Заполнено => заявку принимаем «на вид» (200 OK), но не сохраняем.
    company_website: str = Field(default="", max_length=255)

    @field_validator("extra")
    @classmethod
    def _limit_extra(cls, value: dict[str, str]) -> dict[str, str]:
        if len(value) > MAX_EXTRA_FIELDS:
            raise ValueError(f"слишком много полей формы (максимум {MAX_EXTRA_FIELDS})")
        return {str(k)[:64]: str(v)[:1000] for k, v in value.items()}

    def is_empty(self) -> bool:
        """Заявка без единого контакта и без состава заказа бессмысленна —
        такие не сохраняем (обычно это пустой сабмит формы)."""
        return not (self.name or self.phone or self.email or self.message or self.items or self.extra)


class LeadAccepted(BaseModel):
    """Ответ публичного эндпоинта. Намеренно не содержит id заявки и вообще
    ничего о проекте — эндпоинт открытый, лишние данные наружу не отдаём.

    Исключение — payment_url: если магазин настроен на онлайн-оплату, сюда
    приходит ссылка на страницу оплаты ЮKassa, созданную по ценам из схемы
    сайта (см. app/services/commerce.py). Пусто = оплата недоступна, заказ
    просто принят.
    """

    accepted: bool = True
    payment_url: str = ""


class LeadOut(BaseModel):
    id: uuid.UUID
    kind: LeadKind
    name: str
    phone: str
    email: str
    message: str
    payload: dict
    source_page: str
    source_block: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadPatch(BaseModel):
    is_read: bool
