"""Стриминг генерации сайта по WebSocket (ТЗ п.2: «таймер 60 секунд, стримим
прогресс: 1/4 Пишем тексты, 2/4 Верстаем…»).

Браузеры не позволяют выставлять произвольные заголовки на WS-хендшейке,
поэтому токен передаётся query-параметром — это стандартная практика для
WS-аутентификации (ровно как в первоначальном REST-фолбэке в /projects/generate).
"""
from __future__ import annotations

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.core.tariffs import TARIFF_LIMITS
from app.db.session import async_session_maker
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.project import BriefIn, GenerationProgress, ProjectOut
from app.services.ai.orchestrator import MULTIPAGE_PAGE_COUNT, GenerationOrchestrator
from app.services.safety import UnsafeInputError, assert_safe_prompt

router = APIRouter()


@router.websocket("/ws/generate")
async def ws_generate(websocket: WebSocket, token: str = Query(...)) -> None:
    user_id = decode_access_token(token)
    if user_id is None:
        await websocket.close(code=4401)
        return

    async with async_session_maker() as db:
        user = await db.get(User, user_id)
        if user is None:
            await websocket.close(code=4401)
            return

        await websocket.accept()
        try:
            raw_brief = await websocket.receive_json()
            brief = BriefIn.model_validate(raw_brief)
            assert_safe_prompt(brief.brand_name)
            assert_safe_prompt(brief.description)

            if brief.site_type.value == "multipage" and TARIFF_LIMITS[user.tariff].max_pages < MULTIPAGE_PAGE_COUNT:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": (
                            f"Многостраничник — это {MULTIPAGE_PAGE_COUNT} страницы, а тариф "
                            f"«{user.tariff.value}» ограничен {TARIFF_LIMITS[user.tariff].max_pages}. Повысьте тариф."
                        ),
                    }
                )
                await websocket.close(code=4403)
                return

            project = Project(
                owner_id=user.id,
                name=brief.brand_name,
                type=brief.site_type,
                style=brief.style,
                status=ProjectStatus.generating,
                site_data={},
                settings={},
            )
            db.add(project)
            await db.flush()

            async def on_progress(progress: GenerationProgress) -> None:
                await websocket.send_json({"type": "progress", **progress.model_dump()})

            orchestrator = GenerationOrchestrator(get_settings())
            site = await orchestrator.generate(brief, project.id, on_progress=on_progress)

            project.site_data = site.model_dump()
            project.status = ProjectStatus.ready
            await db.commit()
            await db.refresh(project)

            await websocket.send_json({"type": "done", "project": ProjectOut.model_validate(project).model_dump(mode="json")})
            await websocket.close()
        except (ValidationError, UnsafeInputError) as exc:
            detail = exc.reason if isinstance(exc, UnsafeInputError) else str(exc)
            await websocket.send_json({"type": "error", "message": detail})
            await websocket.close(code=4400)
        except WebSocketDisconnect:
            pass
