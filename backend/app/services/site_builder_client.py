"""HTTP-клиент микросервиса `site-builder` (статическая Vue/Nuxt-сборка сайтов).

Публикация и экспорт кода перестали быть склейкой HTML f-строками — теперь
это настоящая статическая сборка (`nuxi generate`) теми же Vue-блоками
(`site-blocks`), что рендерят live-превью в редакторе, поэтому опубликованный
сайт всегда идентичен тому, что видно при редактировании. `site-builder`
пишет готовую сборку на общий docker-volume `/builds`, смонтированный по
одному и тому же пути в контейнерах `backend` и `site-builder` — этот клиент
лишь просит собрать сайт и получает в ответ локальный путь к результату.
"""
from __future__ import annotations

import httpx

from app.core.config import Settings
from app.models.enums import TariffPlan
from app.schemas.settings import ProjectSettings
from app.schemas.site import SiteSchema


class SiteBuildError(RuntimeError):
    """Сборка не удалась (site-builder недоступен, упал `nuxi generate` и т.д.)."""


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
        "settings": project_settings.model_dump(),
        "tariff": tariff.value,
    }
    try:
        async with httpx.AsyncClient(timeout=180) as client:  # реальная сборка Nuxt не мгновенна
            response = await client.post(f"{app_settings.site_builder_url}/build", json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise SiteBuildError(f"Не удалось собрать сайт: {exc}") from exc

    output_dir = data.get("output_dir")
    if not output_dir:
        raise SiteBuildError("site-builder не вернул путь к готовой сборке")
    return output_dir
