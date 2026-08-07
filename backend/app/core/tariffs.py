"""Единый источник правды по лимитам тарифов (ТЗ п.6)."""
from dataclasses import dataclass

from app.models.enums import TariffPlan


@dataclass(frozen=True)
class TariffLimits:
    max_pages: int
    custom_domain: bool
    watermark: bool
    daily_images: int | None  # None = безлимит
    code_export: bool


TARIFF_LIMITS: dict[TariffPlan, TariffLimits] = {
    TariffPlan.trial: TariffLimits(max_pages=1, custom_domain=False, watermark=True, daily_images=3, code_export=False),
    TariffPlan.basic: TariffLimits(max_pages=10, custom_domain=True, watermark=False, daily_images=20, code_export=False),
    TariffPlan.business: TariffLimits(max_pages=50, custom_domain=True, watermark=False, daily_images=None, code_export=True),
}
