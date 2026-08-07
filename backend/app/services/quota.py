"""Дневные лимиты генерации изображений по тарифам (ТЗ п.6)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from redis.asyncio import Redis

from app.core.tariffs import TARIFF_LIMITS
from app.models.enums import TariffPlan


def _quota_key(user_id: uuid.UUID) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"img_quota:{user_id}:{today}"


async def check_and_increment_image_quota(redis: Redis, user_id: uuid.UUID, tariff: TariffPlan) -> tuple[bool, int]:
    """Возвращает (разрешено, оставшиеся_после_запроса). Business — безлимит."""
    limit = TARIFF_LIMITS[tariff].daily_images
    if limit is None:
        return True, -1

    key = _quota_key(user_id)
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, 86400)
    if current > limit:
        await redis.decr(key)
        return False, max(limit - (current - 1), 0)
    return True, limit - current
