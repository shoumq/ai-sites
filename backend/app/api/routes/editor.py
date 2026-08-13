from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_owned_project
from app.core.config import Settings, get_settings
from app.db.redis import get_redis
from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.chat import ChatCommandIn, ChatCommandOut
from app.schemas.project import SiteUpdateIn
from app.schemas.site import parse_site
from app.services.ai.providers import AIChatEditor, YandexImageGenerator
from app.services.quota import check_and_increment_image_quota
from app.services.safety import UnsafeInputError, assert_safe_prompt

router = APIRouter(prefix="/projects/{project_id}", tags=["editor"])


@router.put("/site", response_model=SiteUpdateIn)
async def update_site(
    payload: SiteUpdateIn,
    project: Project = Depends(get_owned_project),
    db: AsyncSession = Depends(get_db),
) -> SiteUpdateIn:
    """Полная замена JSON-схемы — используется DnD-перестановкой блоков и
    правками в «Конструкторе». payload.site_data уже прошёл валидацию как
    SiteSchema на уровне Pydantic (FastAPI отклонит некорректное тело до
    попадания в этот обработчик) — это и есть требуемый DoD п.2 валидатор.
    """
    project.site_data = payload.site_data.model_dump()
    await db.commit()
    return payload


@router.post("/chat", response_model=ChatCommandOut)
async def chat_command(
    payload: ChatCommandIn,
    project: Project = Depends(get_owned_project),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> ChatCommandOut:
    try:
        assert_safe_prompt(payload.message)
    except UnsafeInputError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.reason) from exc

    site = parse_site(project.site_data)
    chat_editor = AIChatEditor(settings)
    updated_site, reply, applied = await chat_editor.apply_command(site, payload.message)

    if applied:
        project.site_data = updated_site.model_dump()
        await db.commit()

    return ChatCommandOut(reply=reply, applied=applied, site_data=updated_site)


class ImageGenerateIn(BaseModel):
    prompt: str


class ImageGenerateOut(BaseModel):
    url: str
    remaining_today: int


@router.post("/images", response_model=ImageGenerateOut)
async def generate_block_image(
    payload: ImageGenerateIn,
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> ImageGenerateOut:
    try:
        assert_safe_prompt(payload.prompt)
    except UnsafeInputError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.reason) from exc

    redis = get_redis()
    allowed, remaining = await check_and_increment_image_quota(redis, current_user.id, current_user.tariff)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Дневной лимит генераций изображений исчерпан для вашего тарифа.",
        )

    generator = YandexImageGenerator(settings)
    url = await generator.generate_image(payload.prompt)
    return ImageGenerateOut(url=url, remaining_today=remaining)
