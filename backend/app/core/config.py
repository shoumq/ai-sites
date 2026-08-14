from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "AI-Конструктор сайтов"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 60 * 24 * 7

    # CORS — 3000 это admin-panel (Nuxt dev server)
    cors_origins: list[str] = ["http://localhost:3000"]

    # Database
    database_url: str = "postgresql+asyncpg://ai_sites:ai_sites@localhost:5432/ai_sites"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI providers — Yandex AI Studio (YandexGPT + YandexART), единственный
    # провайдер ИИ во всём проекте (бриф, подбор блоков, картинки, ИИ-чат).
    # Leave blank to run in mock mode.
    yandex_api_key: str = ""
    yandex_folder_id: str = ""
    yandex_gpt_model: str = "yandexgpt/latest"
    yandex_art_model: str = "yandex-art/latest"

    # S3-compatible storage (VK Cloud / Yandex Cloud)
    s3_endpoint_url: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket: str = "ai-sites-builds"
    s3_region: str = "ru-central1"
    public_base_domain: str = "builder.ai"
    # Откуда браузер разработчика реально достучится до бэкенда — используется
    # только в mock-режиме публикации (см. app/services/publish.py), чтобы
    # ссылка "Сайт опубликован" вела на реально работающий /preview-sites, а
    # не на несуществующий поддомен public_base_domain.
    public_backend_url: str = "http://localhost:8000"

    # ЮKassa
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""

    # Микросервис статической сборки сайтов (Nuxt `nuxi generate`)
    site_builder_url: str = "http://site-builder:4000"
    # Общий с site-builder docker-volume — backend читает готовые файлы отсюда
    # для заливки в S3/зип-экспорта, а в mock-режиме (без реальных S3-ключей)
    # раздаёт их напрямую через /preview-sites, чтобы билд можно было открыть
    # в браузере локально без облака.
    site_builds_dir: str = "/builds"
    # Куда StorageClient реально сохраняет байты (сгенерированные YandexART
    # картинки и т.п.) в mock-режиме S3 (без реальных S3-ключей) — раздаётся
    # через /media (см. app/main.py), чтобы картинка открывалась в браузере
    # локально без облака, а не превращалась в нерабочую ссылку mock://.
    generated_media_dir: str = "/generated-media"

    # Yandex Metrika / integrations defaults are per-project, stored in DB

    @property
    def ai_mock_mode(self) -> bool:
        return not self.yandex_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
