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

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]

    # Database
    database_url: str = "postgresql+asyncpg://ai_sites:ai_sites@localhost:5432/ai_sites"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI providers — leave blank to run in mock mode (no external calls)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-v4-flash"
    kandinsky_api_key: str = ""
    kandinsky_secret_key: str = ""

    # S3-compatible storage (VK Cloud / Yandex Cloud)
    s3_endpoint_url: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket: str = "ai-sites-builds"
    s3_region: str = "ru-central1"
    public_base_domain: str = "builder.ai"

    # ЮKassa
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""

    # Yandex Metrika / integrations defaults are per-project, stored in DB

    @property
    def ai_mock_mode(self) -> bool:
        return not self.openai_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
