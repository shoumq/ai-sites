"""Заявки и заказы проекта в админке (владелец проекта, с авторизацией).

Приём заявок живёт отдельно, в app/api/routes/public.py — он открыт всему
интернету, поэтому смешивать его с этим роутером нельзя.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_owned_project
from app.db.session import get_db
from app.models.enums import LeadKind
from app.models.lead import Lead
from app.models.project import Project
from app.schemas.lead import LeadOut, LeadPatch

router = APIRouter(prefix="/projects/{project_id}/leads", tags=["leads"])


class LeadsPage(BaseModel):
    items: list[LeadOut]
    total: int
    unread: int


@router.get("", response_model=LeadsPage)
async def list_leads(
    kind: LeadKind | None = Query(default=None, description="Фильтр: только заявки или только заказы"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    project: Project = Depends(get_owned_project),
    db: AsyncSession = Depends(get_db),
) -> LeadsPage:
    base = select(Lead).where(Lead.project_id == project.id)
    if kind is not None:
        base = base.where(Lead.kind == kind)

    items = await db.scalars(base.order_by(Lead.created_at.desc()).limit(limit).offset(offset))
    total = await db.scalar(select(func.count()).select_from(base.subquery())) or 0
    unread = (
        await db.scalar(
            select(func.count())
            .select_from(Lead)
            .where(Lead.project_id == project.id, Lead.is_read.is_(False))
        )
        or 0
    )
    return LeadsPage(items=[LeadOut.model_validate(item) for item in items], total=total, unread=unread)


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: uuid.UUID,
    payload: LeadPatch,
    project: Project = Depends(get_owned_project),
    db: AsyncSession = Depends(get_db),
) -> Lead:
    lead = await db.get(Lead, lead_id)
    # Проверяем принадлежность проекту, а не только существование: иначе
    # владелец одного проекта мог бы менять заявки чужого по прямому id.
    if lead is None or lead.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")
    lead.is_read = payload.is_read
    await db.commit()
    await db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: uuid.UUID,
    project: Project = Depends(get_owned_project),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(delete(Lead).where(Lead.id == lead_id, Lead.project_id == project.id))
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")
    await db.commit()
