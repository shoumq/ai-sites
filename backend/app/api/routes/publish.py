import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_owned_project
from app.core.config import Settings, get_settings
from app.core.tariffs import TARIFF_LIMITS
from app.db.session import get_db
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.settings import ProjectSettings
from app.schemas.site import parse_site
from app.services.publish import publish_project, render_page_html
from app.services.storage import StorageClient

router = APIRouter(prefix="/projects/{project_id}", tags=["publish"])


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "site"


class PublishOut(BaseModel):
    url: str


@router.post("/publish", response_model=PublishOut)
async def publish(
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    app_settings: Settings = Depends(get_settings),
) -> PublishOut:
    if not project.site_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала сгенерируйте сайт.")

    site = parse_site(project.site_data)
    project_settings = ProjectSettings.model_validate(project.settings or {})
    storage = StorageClient(app_settings)
    subdomain = _slugify(project.name)

    url = publish_project(site, project_settings, current_user.tariff, storage, subdomain)

    project.status = ProjectStatus.published
    project.published_url = url
    await db.commit()
    return PublishOut(url=url)


@router.get("/export")
async def export_code(
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    app_settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    """Экспорт HTML+CSS+JS — доступен только на тарифе «Бизнес» (ТЗ п.6).
    Возвращает словарь {slug: html}; в проде — упаковывается в zip и отдаётся
    как файловый ответ.
    """
    if not TARIFF_LIMITS[current_user.tariff].code_export:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Экспорт кода доступен только на тарифе «Бизнес».",
        )
    if not project.site_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала сгенерируйте сайт.")

    site = parse_site(project.site_data)
    project_settings = ProjectSettings.model_validate(project.settings or {})
    return {page.slug: render_page_html(page, site, project_settings, current_user.tariff) for page in site.pages}
