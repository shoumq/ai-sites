from fastapi import APIRouter, Depends, HTTPException, Response, status
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
from app.services.publish import export_zip, publish_project, slugify_project_name
from app.services.site_builder_client import SiteBuildError
from app.services.storage import StorageClient

router = APIRouter(prefix="/projects/{project_id}", tags=["publish"])


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
    project_settings = ProjectSettings.model_validate(project.settings or {}).migrate_legacy()
    storage = StorageClient(app_settings)
    subdomain = slugify_project_name(project.name)

    try:
        url = await publish_project(app_settings, site, project_settings, current_user.tariff, storage, subdomain)
    except SiteBuildError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    project.status = ProjectStatus.published
    project.published_url = url
    await db.commit()
    return PublishOut(url=url)


@router.get("/export")
async def export_code(
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    app_settings: Settings = Depends(get_settings),
) -> Response:
    """Экспорт статической Vue/Nuxt-сборки как zip-архива — доступен только на
    тарифе «Бизнес» (ТЗ п.6). Раньше здесь была лишь заглушка-комментарий,
    теперь реальный `nuxi generate` + упаковка в zip (см. app/services/publish.py)."""
    if not TARIFF_LIMITS[current_user.tariff].code_export:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Экспорт кода доступен только на тарифе «Бизнес».",
        )
    if not project.site_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала сгенерируйте сайт.")

    site = parse_site(project.site_data)
    project_settings = ProjectSettings.model_validate(project.settings or {}).migrate_legacy()
    subdomain = slugify_project_name(project.name)

    try:
        archive = await export_zip(app_settings, site, project_settings, current_user.tariff, subdomain)
    except SiteBuildError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return Response(
        content=archive,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{subdomain}.zip"'},
    )
