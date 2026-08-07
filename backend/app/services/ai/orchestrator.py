"""Единый AI-оркестратор (ТЗ п.1, п.3, шаг 1-2). Собирает ответы воронки в
строгую JSON-схему сайта, дирижируя тремя провайдерами и стримя прогресс
(«1/4 Пишем тексты», «2/4 Вёрстаем» и т.д.) через переданный колбэк —
колбэк дергает и WebSocket-эндпоинт, и REST-фолбэк.
"""
from __future__ import annotations

import asyncio
import uuid
from collections.abc import Awaitable, Callable

from app.core.config import Settings
from app.schemas.project import BriefIn, GenerationProgress
from app.schemas.site import Page, SiteSchema, Theme, parse_site
from app.services.ai.providers import DeepSeekLayoutEngine, KandinskyImageGenerator, OpenAICopywriter

ProgressCallback = Callable[[GenerationProgress], Awaitable[None]]

STAGES = [
    ("writing_copy", "Пишем тексты"),
    ("building_layout", "Верстаем"),
    ("generating_images", "Генерируем изображения"),
    ("finishing", "Собираем сайт"),
]

NAV_LABELS = {
    "hero": "Главная",
    "grid_3col": "Услуги",
    "pricing": "Цены",
    "testimonials": "Отзывы",
    "contact_map": "Контакты",
    "text_image": "О нас",
}

# Многостраничник (ТЗ п.2) всегда собирается из ровно 4 страниц — используется
# в роутах generate/ws для проверки тарифного лимита max_pages ДО запуска
# генерации, а не постфактум на первом сохранении в редакторе.
MULTIPAGE_PAGE_COUNT = 4


class GenerationOrchestrator:
    def __init__(self, settings: Settings):
        self.copywriter = OpenAICopywriter(settings)
        self.layout_engine = DeepSeekLayoutEngine(settings)
        self.image_generator = KandinskyImageGenerator(settings)

    async def generate(
        self,
        brief: BriefIn,
        project_id: uuid.UUID,
        on_progress: ProgressCallback | None = None,
    ) -> SiteSchema:
        async def emit(index: int, extra: str = "") -> None:
            if on_progress is None:
                return
            stage, label = STAGES[index]
            await on_progress(
                GenerationProgress(
                    stage=stage,
                    step=index + 1,
                    total_steps=len(STAGES),
                    message=f"{index + 1}/{len(STAGES)}: {label}{extra}",
                )
            )

        await emit(0)
        copy = await self.copywriter.generate_copy(brief)
        await asyncio.sleep(0.3)  # UX: видимый прогресс даже в mock-режиме

        await emit(1)
        layout = await self.layout_engine.plan_layout(brief)
        theme_data = {"primary_color": layout["primary_color"], "font": layout["font"], "style": layout["style"]}
        section_specs = [
            {"type": "header", "variant": layout["header_variant"]},
            {"type": "hero", "variant": layout["hero_variant"]},
            *layout["sections"],
            {"type": "footer", "variant": layout["footer_variant"]},
        ]
        await asyncio.sleep(0.3)

        await emit(2)
        hero_bg = await self.image_generator.generate_image(
            f"{brief.description}, {brief.style.value} style, website hero background"
        )
        is_multipage = brief.site_type.value == "multipage"
        about_image = None
        if is_multipage or any(spec["type"] == "text_image" for spec in section_specs):
            about_image = await self.image_generator.generate_image(
                f"{brief.brand_name}, {brief.description}, photo"
            )
        await asyncio.sleep(0.3)

        await emit(3)
        if is_multipage:
            # «Многостраничник» из ТЗ п.2 — реально несколько страниц (Главная/
            # Услуги/О нас/Контакты), а не один лендинг с другим ярлыком.
            pages = self._build_multipage(layout, copy, hero_bg, about_image, brief)
        else:
            sections = self._build_sections(section_specs, copy, hero_bg, about_image, brief)
            pages = [Page(slug="main", title=brief.brand_name, sections=sections)]

        site = SiteSchema(
            project_id=str(project_id),
            type=brief.site_type.value,
            theme=Theme(**theme_data),
            pages=pages,
        )
        # Финальная валидация — гарантирует, что оркестратор никогда не отдаст
        # наружу структуру, которая не проходит parse_site (см. DoD п.2).
        return parse_site(site.model_dump())

    @staticmethod
    def _build_sections(
        section_specs: list[dict], copy: dict, hero_bg: str, about_image: str | None, brief: BriefIn
    ) -> list[dict]:
        order = [spec["type"] for spec in section_specs]
        nav_items = [{"label": NAV_LABELS[key], "href": f"#{key}"} for key in order if key in NAV_LABELS]
        sections: list[dict] = []
        for spec in section_specs:
            key, variant = spec["type"], spec["variant"]
            if key == "header":
                sections.append(
                    {
                        "id": "header",
                        "type": "header",
                        "variant": variant,
                        "logo_text": brief.brand_name,
                        "nav_items": nav_items,
                        "sticky": False,
                        "cta_text": copy["hero"]["cta_text"],
                    }
                )
            elif key == "hero":
                sections.append({"id": "hero", "type": "hero", "variant": variant, "bg_image": hero_bg, **copy["hero"]})
            elif key == "text_image":
                sections.append(
                    {
                        "id": "text_image",
                        "type": "text_image",
                        "title": "О нас",
                        "text": brief.description,
                        "image": about_image or "",
                        "image_position": "right",
                    }
                )
            elif key == "grid_3col":
                # id совпадает с type, а не "services" — иначе якорь шапки
                # href="#grid_3col" (см. NAV_LABELS) никогда не найдёт цель.
                sections.append({"id": "grid_3col", "type": "grid_3col", "variant": variant, **copy["services"]})
            elif key == "pricing":
                sections.append({"id": "pricing", "type": "pricing", "variant": variant, **copy["pricing"]})
            elif key == "testimonials":
                sections.append({"id": "testimonials", "type": "testimonials", "variant": variant, **copy["testimonials"]})
            elif key == "contact_map":
                sections.append(
                    {
                        "id": "contact_map",
                        "type": "contact_map",
                        "variant": variant,
                        "title": "Контакты",
                        "address": "",
                        "phone": "",
                        "email": "",
                        "map_embed_url": "",
                        "show_map": True,
                    }
                )
            elif key == "footer":
                # Дублируем меню шапки в футер — иначе вариант footer="columns"
                # рендерит пустую колонку меню и визуально не отличается от simple.
                sections.append({"id": "footer", "type": "footer", "variant": variant, "links": nav_items, **copy["footer"]})
        return sections

    @staticmethod
    def _variant_for(layout: dict, section_type: str, default: str) -> str:
        for spec in layout["sections"]:
            if spec["type"] == section_type:
                return spec["variant"]
        return default

    def _build_multipage(
        self, layout: dict, copy: dict, hero_bg: str, about_image: str | None, brief: BriefIn
    ) -> list[Page]:
        # Ссылки — на реальные соседние HTML-файлы (см. publish.py: каждая
        # страница сохраняется как {slug}.html), а не якоря внутри одной страницы.
        nav_items = [
            {"label": "Главная", "href": "main.html"},
            {"label": "Услуги", "href": "services.html"},
            {"label": "О нас", "href": "about.html"},
            {"label": "Контакты", "href": "contacts.html"},
        ]

        def make_header() -> dict:
            return {
                "id": "header",
                "type": "header",
                "variant": layout["header_variant"],
                "logo_text": brief.brand_name,
                "nav_items": nav_items,
                "sticky": False,
                "cta_text": copy["hero"]["cta_text"],
            }

        def make_footer() -> dict:
            return {"id": "footer", "type": "footer", "variant": layout["footer_variant"], "links": nav_items, **copy["footer"]}

        grid_variant = self._variant_for(layout, "grid_3col", "cards")
        pricing_variant = self._variant_for(layout, "pricing", "cards")
        testimonials_variant = self._variant_for(layout, "testimonials", "cards")
        contact_variant = self._variant_for(layout, "contact_map", "centered")

        services_preview = dict(copy["services"])
        services_preview["items"] = services_preview["items"][:3]

        main_page = Page(
            slug="main",
            title=f"{brief.brand_name} — Главная",
            sections=[
                make_header(),
                {"id": "hero", "type": "hero", "variant": layout["hero_variant"], "bg_image": hero_bg, **copy["hero"]},
                {"id": "grid_3col", "type": "grid_3col", "variant": grid_variant, **services_preview},
                {"id": "testimonials", "type": "testimonials", "variant": testimonials_variant, **copy["testimonials"]},
                make_footer(),
            ],
        )
        services_page = Page(
            slug="services",
            title=f"{brief.brand_name} — Услуги",
            sections=[
                make_header(),
                {"id": "grid_3col", "type": "grid_3col", "variant": grid_variant, **copy["services"]},
                {"id": "pricing", "type": "pricing", "variant": pricing_variant, **copy["pricing"]},
                make_footer(),
            ],
        )
        about_page = Page(
            slug="about",
            title=f"{brief.brand_name} — О нас",
            sections=[
                make_header(),
                {
                    "id": "text_image",
                    "type": "text_image",
                    "title": "О нас",
                    "text": brief.description,
                    "image": about_image or "",
                    "image_position": "right",
                },
                make_footer(),
            ],
        )
        contacts_page = Page(
            slug="contacts",
            title=f"{brief.brand_name} — Контакты",
            sections=[
                make_header(),
                {
                    "id": "contact_map",
                    "type": "contact_map",
                    "variant": contact_variant,
                    "title": "Контакты",
                    "address": "",
                    "phone": "",
                    "email": "",
                    "map_embed_url": "",
                    "show_map": True,
                },
                make_footer(),
            ],
        )
        return [main_page, services_page, about_page, contacts_page]
