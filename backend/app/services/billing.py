"""ЮKassa — рекуррентные подписки (ТЗ п.1, п.6)."""
from __future__ import annotations

import uuid

import httpx

from app.core.config import Settings

TARIFF_PRICE_RUB = {"basic": 1500, "business": 3900}


class YooKassaClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.yookassa_secret_key

    async def create_payment(self, tariff: str, user_id: uuid.UUID, return_url: str) -> dict:
        amount = TARIFF_PRICE_RUB[tariff]
        if self.mock:
            payment_id = f"mock-{uuid.uuid4().hex[:12]}"
            return {"id": payment_id, "confirmation_url": f"{return_url}?mock_payment_id={payment_id}", "amount": amount}

        return await self._call_real_api(tariff, amount, user_id, return_url)

    async def _call_real_api(self, tariff: str, amount: int, user_id: uuid.UUID, return_url: str) -> dict:  # pragma: no cover
        idempotence_key = str(uuid.uuid4())
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.yookassa.ru/v3/payments",
                auth=(self.settings.yookassa_shop_id, self.settings.yookassa_secret_key),
                headers={"Idempotence-Key": idempotence_key},
                json={
                    "amount": {"value": f"{amount}.00", "currency": "RUB"},
                    "capture": True,
                    "confirmation": {"type": "redirect", "return_url": return_url},
                    "save_payment_method": True,
                    "description": f"Подписка «{tariff}»",
                    "metadata": {"user_id": str(user_id), "tariff": tariff},
                },
            )
            response.raise_for_status()
            payload = response.json()
            return {
                "id": payload["id"],
                "confirmation_url": payload["confirmation"]["confirmation_url"],
                "amount": amount,
            }
