"""Проверка DNS-записей пользовательского домена (ТЗ п.5).

Использует публичный DoH-резолвер вместо самостоятельной обвязки над сокетами —
не требует дополнительной системной библиотеки резолвера и работает одинаково
в контейнере и локально.
"""
from __future__ import annotations

import httpx

from app.core.config import Settings
from app.schemas.settings import DnsCheckResult


async def check_domain_cname(domain: str, settings: Settings) -> DnsCheckResult:
    expected = f"{settings.public_base_domain}."
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(
                "https://dns.google/resolve", params={"name": domain, "type": "CNAME"}
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError:
        return DnsCheckResult(
            domain=domain, verified=False, expected_record=expected, detail="Не удалось выполнить DNS-запрос."
        )

    answers = payload.get("Answer", [])
    for answer in answers:
        if answer.get("data", "").rstrip(".") == expected.rstrip("."):
            return DnsCheckResult(domain=domain, verified=True, expected_record=expected, detail="CNAME подтверждён.")

    return DnsCheckResult(
        domain=domain,
        verified=False,
        expected_record=expected,
        detail=f"Добавьте CNAME-запись {domain} → {expected}",
    )
