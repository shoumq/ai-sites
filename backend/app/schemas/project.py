import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import ProjectStatus, SiteGoal, SiteType, StylePreset
from app.schemas.site import SiteSchema


class BriefIn(BaseModel):
    """Воронка: Экран 1 (тип сайта) + Экран 2 (настроение) + Экран 3 (опросник)."""

    site_type: SiteType
    style: StylePreset
    custom_hex_color: str | None = Field(default=None, description="Только для style=custom")
    brand_name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=500)
    goal: SiteGoal


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
