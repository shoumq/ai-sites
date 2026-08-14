from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_owned_project
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.project import BriefIn, ProjectOut, ProjectSummary
from app.services.ai.orchestrator import GenerationOrchestrator
from app.services.safety import UnsafeInputError, assert_safe_prompt

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectSummary])
async def list_projects(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Project]:
    result = await db.scalars(select(Project).where(Project.owner_id == current_user.id).order_by(Project.updated_at.desc()))
    return list(result)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project: Project = Depends(get_owned_project)) -> Project:
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project: Project = Depends(get_owned_project), db: AsyncSession = Depends(get_db)
) -> None:
    await db.delete(project)
    await db.commit()


@router.post("/generate", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def generate_project(
    brief: BriefIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> Project:
    """REST-фолбэк генерации (без стриминга прогресса) — см. WS /ws/generate
    для стрима «1/4, 2/4…» по ТЗ п.2. Оба пути используют один и тот же
    GenerationOrchestrator и одинаково валидируют результат перед сохранением.
    """
    try:
        assert_safe_prompt(brief.brand_name)
        assert_safe_prompt(brief.description)
        if brief.extra_requirements:
            assert_safe_prompt(brief.extra_requirements)
    except UnsafeInputError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.reason) from exc

    project = Project(
        owner_id=current_user.id,
        name=brief.brand_name,
        type=brief.site_type,
        style=brief.style,
        status=ProjectStatus.generating,
        site_data={},
        settings={},
    )
    db.add(project)
    await db.flush()  # получить project.id до генерации

    orchestrator = GenerationOrchestrator(settings)
    site = await orchestrator.generate(brief, project.id)

    project.site_data = site.model_dump()
    project.status = ProjectStatus.ready
    await db.commit()
    await db.refresh(project)
    return project
