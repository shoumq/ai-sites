"""Оформление заказа из корзины сгенерированного магазина.

Ключевое решение: сумма заказа считается НА СЕРВЕРЕ по ценам из JSON-схемы
сайта (project.site_data), а не берётся из тела запроса. Тело запроса приходит
из браузера посетителя, и доверять присланной там сумме нельзя — иначе платёж
можно было бы создать на 1 рубль за товар в сто тысяч.

ЮKassa вызывается реквизитами КОНКРЕТНОГО проекта (магазина), а не платформы:
владелец сайта получает деньги на свой shop_id, платформа лишь создаёт платёж.
Без заданных реквизитов работает в mock-режиме — как и остальной проект.
"""
from __future__ import annotations

import logging
import re
import uuid

import httpx

from app.schemas.settings import CommerceSettings

logger = logging.getLogger(__name__)

YOOKASSA_PAYMENTS_URL = "https://api.yookassa.ru/v3/payments"
PAYMENT_TIMEOUT_SECONDS = 15

# «от 1 500 ₽» -> 1500. Пробелы (в т.ч. неразрывные) — разделители разрядов.
_SPACES_RE = re.compile(r"[\s  ]")
_NUMBER_RE = re.compile(r"\d+(?:\.\d+)?")


def parse_price(price: str) -> float:
    """Зеркало parsePrice() из site-blocks/composables/useCart.ts — цены в схеме
    сайта это свободные строки, а не числа."""
    if not price:
        return 0.0
    normalized = _SPACES_RE.sub("", price).replace(",", ".")
    match = _NUMBER_RE.search(normalized)
    return float(match.group(0)) if match else 0.0


def catalog_price_index(site_data: dict) -> dict[str, float]:
    """Собирает {ключ позиции -> цена} по всем каталогам сайта.

    Ключ — тот же, что использует корзина на фронте: sku, если он задан, иначе
    название товара (см. useCart.add).
    """
    index: dict[str, float] = {}
    for page in site_data.get("pages") or []:
        for section in page.get("sections") or []:
            if section.get("type") not in ("catalog_filter", "grid_3col"):
                continue
            for item in section.get("items") or []:
                name = item.get("name") or ""
                if not name:
                    continue
                price = parse_price(item.get("price") or "")
                index[item.get("sku") or name] = price
                # Дублируем по названию: корзина, собранная до того как товару
                # проставили sku, хранит позицию под именем.
                index.setdefault(name, price)
    return index


def compute_order_total(site_data: dict, items: list) -> float:
    """Сумма заказа по ценам из схемы сайта. Позиции, которых в каталоге нет
    (товар удалили после того, как посетитель положил его в корзину), считаются
    нулевыми — заказ всё равно сохраняется, но платёж на них не выставляется."""
    index = catalog_price_index(site_data)
    total = 0.0
    for item in items:
        key = item.sku or item.name
        price = index.get(key, index.get(item.name, 0.0))
        total += price * item.qty
    return round(total, 2)


async def create_order_payment(
    commerce: CommerceSettings,
    amount: float,
    description: str,
    return_url: str,
    order_id: uuid.UUID,
) -> str:
    """Создаёт платёж в ЮKassa и возвращает URL страницы оплаты.

    Пустая строка означает «оплата недоступна» — вызывающий код показывает
    обычное подтверждение заказа без кнопки оплаты, а не ошибку.
    """
    if amount <= 0:
        return ""
    if not (commerce.yookassa_shop_id and commerce.yookassa_secret_key):
        # Mock: реквизитов магазина нет — платёж не создаём, но и заказ не рушим.
        return ""

    try:
        async with httpx.AsyncClient(timeout=PAYMENT_TIMEOUT_SECONDS) as client:
            response = await client.post(
                YOOKASSA_PAYMENTS_URL,
                auth=(commerce.yookassa_shop_id, commerce.yookassa_secret_key),
                # Ключ идемпотентности — id заказа: повторная отправка той же
                # формы (двойной клик, ретрай сети) не создаст второй платёж.
                headers={"Idempotence-Key": str(order_id)},
                json={
                    "amount": {"value": f"{amount:.2f}", "currency": "RUB"},
                    "capture": True,
                    "confirmation": {"type": "redirect", "return_url": return_url},
                    "description": description[:128],
                    "metadata": {"order_id": str(order_id)},
                },
            )
            response.raise_for_status()
            return response.json()["confirmation"]["confirmation_url"]
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        # Платёж не создался — заказ уже принят и лежит в БД, владелец магазина
        # свяжется с клиентом сам. Ронять оформление из-за платёжки нельзя.
        logger.warning("Не удалось создать платёж ЮKassa для заказа %s: %s", order_id, exc)
        return ""
