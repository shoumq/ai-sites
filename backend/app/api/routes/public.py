"""Публичный (без авторизации) API для опубликованных статических сайтов.

Единственное, что сгенерированный сайт умеет делать «вживую» — присылать сюда
заявки и заказы. Всё остальное на нём статика. Эндпоинт открыт всему интернету,
поэтому здесь: жёсткие лимиты на размер тела (см. app/schemas/lead.py),
honeypot-поле, rate limit по IP и отсутствие любых данных проекта в ответе.
"""
from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.redis import get_redis
from app.db.session import get_db
from app.models.enums import LeadKind
from app.models.lead import Lead
from app.models.project import Project
from app.schemas.lead import LeadAccepted, LeadIn
from app.schemas.settings import ProjectSettings
from app.services.commerce import compute_order_total, create_order_payment
from app.services.leads import deliver_lead, lead_to_dict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["public"])

# Не больше 20 заявок за 10 минут с одного IP на один проект — обычному
# посетителю хватает с запасом, автоматической спам-рассылке уже нет.
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW_SECONDS = 600


def _client_ip(request: Request) -> str:
    # За обратным прокси (nginx/CDN) реальный адрес приходит в X-Forwarded-For.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def _check_rate_limit(project_id: uuid.UUID, ip: str) -> bool:
    key = f"lead_rate:{project_id}:{ip}"
    try:
        redis = get_redis()
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS)
        return current <= RATE_LIMIT_MAX
    except Exception as exc:  # noqa: BLE001 — Redis лежит: пропускаем заявку, а не теряем её
        logger.warning("Rate limit заявок недоступен (Redis): %s", exc)
        return True


@router.post("/projects/{project_id}/leads", response_model=LeadAccepted)
async def submit_lead(
    project_id: uuid.UUID,
    payload: LeadIn,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> LeadAccepted:
    """Принимает заявку/заказ с опубликованного сайта.

    Отвечает `{"accepted": true}` практически всегда — даже honeypot-срабатыванию
    и пустому сабмиту: боту не за что зацепиться, а живому посетителю незачем
    видеть техническую ошибку. Реальные отказы — только 404 (нет такого проекта)
    и 429 (превышен лимит).
    """
    if not await _check_rate_limit(project_id, _client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Слишком много заявок. Попробуйте позже.",
        )

    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден")

    if payload.company_website or payload.is_empty():
        return LeadAccepted()

    project_settings = ProjectSettings.model_validate(project.settings or {}).migrate_legacy()

    lead = Lead(
        # id проставляем сами, а не полагаемся на column default: при
        # store_in_platform=False строка в БД не создаётся вообще, но во внешние
        # каналы заявка всё равно уходит и должна иметь идентификатор.
        id=uuid.uuid4(),
        project_id=project.id,
        kind=payload.kind,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        message=payload.message,
        payload={
            "extra": payload.extra,
            "items": [item.model_dump() for item in payload.items],
            "total": payload.total,
        },
        source_page=payload.source_page,
        source_block=payload.source_block,
    )

    if project_settings.leads.store_in_platform:
        db.add(lead)
        await db.commit()
        await db.refresh(lead)

    # Доставка во внешние каналы — после ответа: посетитель сайта не должен
    # ждать, пока чужой вебхук отработает свой таймаут. Снимок полей делаем
    # здесь, пока сессия жива (см. lead_to_dict).
    background_tasks.add_task(deliver_lead, lead_to_dict(lead, project.name), project_settings.leads)

    payment_url = ""
    if payload.kind == LeadKind.order and project_settings.commerce.checkout_mode == "payment" and payload.items:
        # Сумму считаем по ценам из схемы сайта, а НЕ по payload.total из
        # браузера — иначе платёж можно выставить себе на любую сумму.
        amount = compute_order_total(project.site_data or {}, payload.items)
        payment_url = await create_order_payment(
            project_settings.commerce,
            amount,
            description=f"Заказ на сайте «{project.name}»",
            return_url=str(request.headers.get("referer") or "/"),
            order_id=lead.id,
        )

    return LeadAccepted(payment_url=payment_url)
