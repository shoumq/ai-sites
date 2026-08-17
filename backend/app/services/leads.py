"""Приём заявок/заказов с опубликованных сайтов и их доставка во внешние каналы.

Опубликованный сайт статический: собственного бэкенда у него нет, поэтому и
форма заявки, и оформление заказа из корзины стучатся сюда. Рассылка во внешние
каналы (вебхук, Telegram) делается ТОЛЬКО серверной стороной — если бы это
делал браузер, токен бота и адрес вебхука лежали бы прямо в JS-бандле сайта.

Доставка сознательно не блокирует ответ пользователю: заявка уже сохранена в
БД, и если вебхук лежит — посетитель сайта не должен видеть ошибку.
"""
from __future__ import annotations

import logging

import httpx

from app.models.lead import Lead
from app.schemas.settings import LeadDeliverySettings

logger = logging.getLogger(__name__)

DELIVERY_TIMEOUT_SECONDS = 10


def lead_to_dict(lead: Lead, project_name: str) -> dict:
    """Плоский снимок заявки для внешних каналов.

    Снимается СИНХРОННО, до постановки доставки в фоновую задачу: сама Lead —
    ORM-объект, живущий в сессии запроса, и обращаться к его полям после
    закрытия сессии нельзя (DetachedInstanceError). В фон уходит уже этот dict.
    """
    return {
        "id": str(lead.id),
        "project_id": str(lead.project_id),
        "project_name": project_name,
        "kind": lead.kind.value,
        "name": lead.name,
        "phone": lead.phone,
        "email": lead.email,
        "message": lead.message,
        "payload": lead.payload,
        "source_page": lead.source_page,
        "source_block": lead.source_block,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
    }


def _format_telegram_message(data: dict) -> str:
    kind = "Новый заказ" if data.get("kind") == "order" else "Новая заявка"
    lines = [f"<b>{kind}</b> — {data.get('project_name', '')}"]
    for label, key in (("Имя", "name"), ("Телефон", "phone"), ("E-mail", "email"), ("Сообщение", "message")):
        if data.get(key):
            lines.append(f"{label}: {data[key]}")

    payload = data.get("payload") or {}
    for key, value in (payload.get("extra") or {}).items():
        lines.append(f"{key}: {value}")

    items = payload.get("items") or []
    if items:
        lines.append("")
        lines.append("<b>Состав заказа:</b>")
        for item in items:
            lines.append(f"• {item.get('name', '')} × {item.get('qty', 1)} {item.get('price') or ''}".rstrip())
        if payload.get("total"):
            lines.append(f"<b>Итого: {payload['total']}</b>")

    if data.get("source_page"):
        lines.append("")
        lines.append(f"Страница: {data['source_page']}")

    # Telegram режет сообщения длиннее 4096 символов — обрезаем сами, иначе
    # sendMessage вернёт 400 и заявка «потеряется» в канале доставки.
    return "\n".join(lines)[:4000]


async def deliver_lead(data: dict, delivery: LeadDeliverySettings) -> None:
    """Дублирует заявку во внешние каналы. Любая ошибка канала логируется и
    проглатывается — заявка уже в БД, и падение вебхука не должно превращаться
    в 500 для посетителя сайта."""
    if not delivery.webhook_url and not (delivery.telegram_bot_token and delivery.telegram_chat_id):
        return

    async with httpx.AsyncClient(timeout=DELIVERY_TIMEOUT_SECONDS) as client:
        if delivery.webhook_url:
            try:
                response = await client.post(delivery.webhook_url, json=data)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("Не удалось доставить заявку %s в вебхук: %s", data.get("id"), exc)

        if delivery.telegram_bot_token and delivery.telegram_chat_id:
            try:
                response = await client.post(
                    f"https://api.telegram.org/bot{delivery.telegram_bot_token}/sendMessage",
                    json={
                        "chat_id": delivery.telegram_chat_id,
                        "text": _format_telegram_message(data),
                        "parse_mode": "HTML",
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("Не удалось доставить заявку %s в Telegram: %s", data.get("id"), exc)
