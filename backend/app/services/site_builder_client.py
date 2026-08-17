"""HTTP-клиент микросервиса `site-builder` (статическая Vue/Nuxt-сборка сайтов).

Публикация и экспорт кода перестали быть склейкой HTML f-строками — теперь
это настоящая статическая сборка (`nuxi generate`) теми же Vue-блоками
(`site-blocks`), что рендерят live-превью в редакторе, поэтому опубликованный
сайт всегда идентичен тому, что видно при редактировании. `site-builder`
пишет готовую сборку на общий docker-volume `/builds`, смонтированный по
одному и тому же пути в контейнерах `backend` и `site-builder` — этот клиент
лишь просит собрать сайт и получает в ответ локальный путь к результату.

Вместе со схемой сайта в сборку уезжает `runtime`: счётчики аналитики, SEO,
настройки корзины и адрес, куда сайт шлёт заявки. Это ПУБЛИЧНАЯ часть настроек
(см. public_site_settings) — секреты (ключ ЮKassa, токен Telegram-бота, адрес
вебхука) в статический бандл не попадают никогда.
"""
from __future__ import annotations

import httpx

from app.core.config import Settings
from app.core.tariffs import TARIFF_LIMITS
from app.models.enums import TariffPlan
from app.schemas.settings import ProjectSettings, public_site_settings
from app.schemas.site import SiteSchema, site_uses_cart


class SiteBuildError(RuntimeError):
    """Сборка не удалась (site-builder недоступен, упал `nuxi generate` и т.д.)."""


def build_runtime_payload(
    app_settings: Settings,
    site: SiteSchema,
    project_settings: ProjectSettings,
    tariff: TariffPlan,
) -> dict:
    """Формирует объект, который site-builder кладёт в `site-renderer/data/settings.json`
    и который site-renderer инлайнит в статическую сборку."""
    public = public_site_settings(project_settings)
    return {
        "project_id": site.project_id,
        # Куда опубликованный сайт шлёт заявки и заказы (см. app/api/routes/public.py).
        "api_base": f"{app_settings.public_backend_url.rstrip('/')}/api/v1",
        "tariff": tariff.value,
        "watermark": TARIFF_LIMITS[tariff].watermark,
        # Корзина есть, только если её реально включает хоть один блок сайта —
        # иначе каталог с заявками (автосалон и т.п.) получил бы лишнюю иконку
        # корзины и мёртвый экран оформления заказа.
        "cart_enabled": public["commerce"]["cart_enabled"] and site_uses_cart(site),
        **public,
    }


async def build_site(
    app_settings: Settings,
    site: SiteSchema,
    project_settings: ProjectSettings,
    tariff: TariffPlan,
    subdomain: str,
    build_id: str,
) -> str:
    """Просит `site-builder` статически собрать сайт и возвращает локальный
    путь к готовой сборке (директория на общем docker-volume `/builds`)."""
    payload = {
        "subdomain": subdomain,
        "build_id": build_id,
        "site": site.model_dump(),
        "runtime": build_runtime_payload(app_settings, site, project_settings, tariff),
        "tariff": tariff.value,
    }
    try:
        async with httpx.AsyncClient(timeout=300) as client:  # реальная сборка Nuxt не мгновенна
            response = await client.post(f"{app_settings.site_builder_url}/build", json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise SiteBuildError(f"Не удалось собрать сайт: {exc}") from exc

    output_dir = data.get("output_dir")
    if not output_dir:
        raise SiteBuildError("site-builder не вернул путь к готовой сборке")
    return output_dir
