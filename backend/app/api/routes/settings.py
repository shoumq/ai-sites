from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_owned_project
from app.core.config import Settings, get_settings
from app.core.tariffs import TARIFF_LIMITS
from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.settings import DnsCheckResult, ProjectSettings
from app.services.dns_check import check_domain_cname

router = APIRouter(prefix="/projects/{project_id}/settings", tags=["settings"])


@router.get("", response_model=ProjectSettings)
async def get_settings_(project: Project = Depends(get_owned_project)) -> ProjectSettings:
    return ProjectSettings.model_validate(project.settings or {})


@router.put("", response_model=ProjectSettings)
async def update_settings(
    payload: ProjectSettings,
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProjectSettings:
    if payload.domain.custom_domain and not TARIFF_LIMITS[current_user.tariff].custom_domain:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Свой домен доступен на тарифах «Базовый» и «Бизнес».",
        )

    project.settings = payload.model_dump()
    await db.commit()
    return payload


@router.post("/check-domain", response_model=DnsCheckResult)
async def check_domain(
    project: Project = Depends(get_owned_project),
    app_settings: Settings = Depends(get_settings),
) -> DnsCheckResult:
    current_settings = ProjectSettings.model_validate(project.settings or {})
    if not current_settings.domain.custom_domain:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Домен не указан в настройках проекта.")
    return await check_domain_cname(current_settings.domain.custom_domain, app_settings)
