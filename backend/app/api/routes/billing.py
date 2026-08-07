from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.enums import TariffPlan
from app.models.user import User
from app.services.billing import YooKassaClient

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutIn(BaseModel):
    tariff: TariffPlan
    return_url: str = "https://app.builder.ai/billing/success"


class CheckoutOut(BaseModel):
    payment_id: str
    confirmation_url: str
    amount: int


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    payload: CheckoutIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    app_settings: Settings = Depends(get_settings),
) -> CheckoutOut:
    if payload.tariff == TariffPlan.trial:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trial-тариф не требует оплаты.")

    client = YooKassaClient(app_settings)
    payment = await client.create_payment(payload.tariff.value, current_user.id, payload.return_url)

    if client.mock:
        # В mock-режиме (нет ключей ЮKassa) апгрейдим тариф сразу, чтобы
        # локальная разработка не требовала реального вебхука.
        current_user.tariff = payload.tariff
        await db.commit()

    return CheckoutOut(payment_id=payment["id"], confirmation_url=payment["confirmation_url"], amount=payment["amount"])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def yookassa_webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    """Приём уведомлений ЮKassa. Продакшен-требование: проверять, что запрос
    пришёл с IP-адресов ЮKassa (см. их документацию по вебхукам) — здесь
    опущено, так как локально ключи ЮKassa не настроены.
    """
    payload = await request.json()
    event = payload.get("event")
    obj = payload.get("object", {})

    if event == "payment.succeeded":
        metadata = obj.get("metadata", {})
        user_id = metadata.get("user_id")
        tariff = metadata.get("tariff")
        if user_id and tariff in (TariffPlan.basic.value, TariffPlan.business.value):
            user = await db.get(User, user_id)
            if user:
                user.tariff = TariffPlan(tariff)
                await db.commit()

    return {"status": "ok"}
