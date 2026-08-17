import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.enums import ProjectStatus, SiteGoal, SiteType, StylePreset
from app.schemas.site import SiteSchema


class BlockPreference(BaseModel):
    """Один блок, выбранный пользователем вручную на экране «Структура».
    Пустой variant означает «вариант вёрстки пусть подберёт ИИ»."""

    type: str
    variant: str = ""


class LayoutPreferences(BaseModel):
    """Ручной выбор структуры сайта (экран 4 воронки).

    Раньше пользователь мог выбрать только тип сайта — состав блоков и их
    вёрстку целиком решал ИИ, из-за чего сайты выходили однотипными. Теперь
    любую ось можно зафиксировать вручную, а всё незаполненное по-прежнему
    подбирает ИИ (mode="auto" игнорирует blocks целиком).

    Все строковые поля осей допускают пустую строку = «на усмотрение ИИ»;
    валидность значений проверяется при применении (см. YandexLayoutEngine),
    а не здесь, чтобы список допустимых значений жил в одном месте —
    app/schemas/site.py.
    """

    mode: str = "auto"  # auto | manual
    blocks: list[BlockPreference] = Field(default_factory=list, max_length=20)
    header_variant: str = ""
    hero_variant: str = ""
    footer_variant: str = ""

    # Оси темы (см. Theme в app/schemas/site.py); пусто = подбирает ИИ.
    radius: str = ""
    density: str = ""
    container_width: str = ""
    heading_style: str = ""
    button_style: str = ""
    section_divider: str = ""

    # Коммерческое поведение карточек каталога/услуг: none | lead | cart.
    # Пусто = вывести из типа сайта (магазин -> корзина, остальное -> заявка).
    item_action: str = ""


class BriefIn(BaseModel):
    """Воронка: Экран 1 (тип сайта) + Экран 2 (настроение) + Экран 3 (опросник)
    + Экран 4 (структура сайта, необязательный)."""

    site_type: SiteType
    style: StylePreset
    custom_hex_color: str | None = Field(default=None, description="Только для style=custom")
    brand_name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=500)
    goal: SiteGoal
    # Свободный текст: какие блоки/функции нужны сверх стандартного набора
    # (например «нужен фильтр по категориям товаров») — учитывается при подборе
    # блоков (YandexLayoutEngine) и их наполнении контентом (YandexCopywriter).
    extra_requirements: str | None = Field(default=None, max_length=800)
    layout: LayoutPreferences = Field(default_factory=LayoutPreferences)

    @field_validator("layout", mode="before")
    @classmethod
    def _default_layout(cls, value: object) -> object:
        """Пустой/отсутствующий layout = «структуру подбирает ИИ».

        Явный null сюда прилетает от вкладок, открытых до появления экрана
        «Структура»: их сохранённый в sessionStorage бриф не содержит layout,
        и toBrief() отправляет undefined -> null. Без этого валидатора такой
        запрос падал бы с 422 и генерация просто не запускалась.
        """
        return LayoutPreferences() if value is None else value


class ProjectOut(BaseModel):
    id: uuid.UUID
    name: str
    type: SiteType
    style: StylePreset
    status: ProjectStatus
    site_data: dict
    settings: dict
    published_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    id: uuid.UUID
    name: str
    type: SiteType
    status: ProjectStatus
    updated_at: datetime

    model_config = {"from_attributes": True}


class GenerationProgress(BaseModel):
    stage: str
    step: int
    total_steps: int = 4
    message: str


class SiteUpdateIn(BaseModel):
    """Полная замена site_data — валидируется как SiteSchema перед сохранением."""

    site_data: SiteSchema
