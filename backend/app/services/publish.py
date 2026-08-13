"""Публикация и экспорт кода сайта (ТЗ п.5, п.6).

Раньше здесь была ручная склейка HTML f-строками — она полностью заменена на
реальную статическую Vue/Nuxt-сборку через `site_builder_client.build_site`
(контейнер `site-builder` гоняет `nuxi generate` теми же блоками из
`site-blocks`, что рендерит live-превью в редакторе). Эта функция лишь
оркестрирует: попросить сборку → залить в S3 (публикация) или зипнуть
(экспорт кода, Бизнес-тариф).
"""
from __future__ import annotations

import io
import zipfile
from pathlib import Path

from app.core.config import Settings
from app.models.enums import TariffPlan
from app.schemas.settings import ProjectSettings
from app.schemas.site import SiteSchema
from app.services.site_builder_client import build_site
from app.services.storage import StorageClient, new_build_id


async def publish_project(
    app_settings: Settings,
    site: SiteSchema,
    settings_: ProjectSettings,
    tariff: TariffPlan,
    storage: StorageClient,
    subdomain: str,
) -> str:
    build_id = new_build_id()
    output_dir = await build_site(app_settings, site, settings_, tariff, subdomain, build_id)
    storage.upload_dir(output_dir, f"sites/{subdomain}/{build_id}")

    domain = settings_.domain.custom_domain if settings_.domain.dns_verified and settings_.domain.custom_domain else None
    if domain:
        return domain
    if storage.mock:
        # Без реального S3/DNS поддомен public_base_domain никуда не резолвится —
        # отдаём реально работающий локальный URL (site-builder кладёт этот же
        # build прямо в site_builds_dir, main.py раздаёт его на /preview-sites).
        return f"{app_settings.public_backend_url}/preview-sites/{subdomain}/{build_id}/"
    return f"{subdomain}.{app_settings.public_base_domain}"


async def export_zip(
    app_settings: Settings,
    site: SiteSchema,
    settings_: ProjectSettings,
    tariff: TariffPlan,
    subdomain: str,
) -> bytes:
    """Собирает тот же статический билд, что и публикация, и упаковывает его
    в zip для скачивания (Бизнес-тариф, ТЗ п.6) — раньше это было лишь
    комментарием-заглушкой, теперь реально реализовано."""
    build_id = new_build_id()
    output_dir = await build_site(app_settings, site, settings_, tariff, subdomain, build_id)

    buffer = io.BytesIO()
    root = Path(output_dir)
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(root.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(root).as_posix())
    return buffer.getvalue()
