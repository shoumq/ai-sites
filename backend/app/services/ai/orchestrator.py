"""Единый AI-оркестратор (ТЗ п.1, п.3, шаг 1-2). Собирает ответы воронки в
строгую JSON-схему сайта, дирижируя тремя провайдерами и стримя прогресс
(«1/4 Планируем блоки», «2/4 Пишем тексты» и т.д.) через переданный колбэк —
колбэк дергает и WebSocket-эндпоинт, и REST-фолбэк.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from collections.abc import Awaitable, Callable

from app.core.config import Settings
from app.schemas.project import BriefIn, GenerationProgress
from app.schemas.site import Page, SiteSchema, Theme, parse_site
from app.services.ai.providers import YandexArtImageGenerator, YandexCopywriter, YandexLayoutEngine
from app.services.storage import StorageClient

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[GenerationProgress], Awaitable[None]]

# Подбор блоков должен произойти ДО копирайтинга — копирайтеру нужно точно
# знать, для каких типов блоков писать контент (см. generate() ниже).
STAGES = [
    ("planning_layout", "Планируем блоки"),
    ("writing_copy", "Пишем тексты"),
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
    "catalog_filter": "Каталог",
    "faq": "Вопросы",
    "gallery": "Галерея",
    "lead_form": "Заявка",
}

# Типы, которые оркестратор заполняет сам (картинки/nav/бренд/пустые поля для
# ручного заполнения) — их контент НЕ приходит от YandexCopywriter. Всё
# остальное (hero, footer и любой «чистый контентный» тип из BLOCK_LIBRARY —
# grid_3col/pricing/testimonials/catalog_filter/faq/gallery/stats/
# custom_content) — контентные типы, для них нужен copy[type].
_HAND_FILLED_TYPES = {"header", "text_image", "contact_map"}

# Многостраничник (ТЗ п.2) всегда собирается из ровно 4 страниц — используется
# в роутах generate/ws для проверки тарифного лимита max_pages ДО запуска
# генерации, а не постфактум на первом сохранении в редакторе.
MULTIPAGE_PAGE_COUNT = 4

# Блоки, карточки которых умеют «заявка/в корзину» (см. ItemAction в
# app/schemas/site.py).
_ACTIONABLE_TYPES = {"catalog_filter", "grid_3col"}

# Что делает кнопка на карточке по умолчанию для каждого типа сайта. Ровно это
# отличает каталог автомобилей (заявка на конкретную машину, корзины нет) от
# интернет-магазина (товар кладётся в корзину и оформляется заказом).
_DEFAULT_ITEM_ACTION = {
    "shop": "cart",
    "landing": "lead",
    "multipage": "lead",
    "crm": "none",
}

_ACTION_TEXT = {
    "cart": "В корзину",
    "lead": "Оставить заявку",
    "none": "",
}

# Состав полей формы заявки задаёт оркестратор, а не языковая модель: по этим
# именам ходит приём заявок на бэкенде (app/api/routes/public.py), и модель не
# должна их переизобретать.
_LEAD_FORM_FIELDS = [
    {"name": "name", "label": "Ваше имя", "type": "text", "required": True, "placeholder": "Иван"},
    {"name": "phone", "label": "Телефон", "type": "tel", "required": True, "placeholder": "+7 (___) ___-__-__"},
    {"name": "email", "label": "E-mail", "type": "email", "required": False, "placeholder": "mail@example.com"},
    {"name": "message", "label": "Комментарий", "type": "textarea", "required": False, "placeholder": "Что вас интересует?"},
]


class GenerationOrchestrator:
    def __init__(self, settings: Settings, storage: StorageClient | None = None):
        self.copywriter = YandexCopywriter(settings)
        self.layout_engine = YandexLayoutEngine(settings)
        self.image_generator = YandexArtImageGenerator(settings, storage or StorageClient(settings))

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
        layout = await self.layout_engine.plan_layout(brief)
        # Оси вёрстки (скругления/плотность/ширина/заголовки/кнопки/разделители)
        # едут в тему как есть — они уже провалидированы подборщиком макета.
        theme_data = {
            "primary_color": layout["primary_color"],
            "font": layout["font"],
            "style": layout["style"],
            **layout["axes"],
        }
        section_specs = [
            {"type": "header", "variant": layout["header_variant"]},
            {"type": "hero", "variant": layout["hero_variant"]},
            *layout["sections"],
            {"type": "footer", "variant": layout["footer_variant"]},
        ]
        await asyncio.sleep(0.3)  # UX: видимый прогресс даже в mock-режиме

        await emit(1)
        is_multipage = brief.site_type.value == "multipage"
        copy_types = {spec["type"] for spec in section_specs} - _HAND_FILLED_TYPES
        if is_multipage:
            # _build_multipage — фиксированный скелет 4 страниц (Главная/Услуги/
            # О нас/Контакты), ему всегда нужен контент для этих типов, даже
            # если подборщик блоков не включил какой-то из них в "доп." секции
            # для главной страницы (см. _build_multipage). lead_form здесь
            # обязателен: форма стоит на странице контактов всегда.
            copy_types |= {"grid_3col", "pricing", "testimonials", "lead_form"}
        copy = await self.copywriter.generate_copy(brief, sorted(copy_types))
        await asyncio.sleep(0.3)

        await emit(2)
        hero_bg = await self.image_generator.generate_image(
            f"{brief.description}, {brief.style.value} style, website hero background"
        )
        about_image = None
        if is_multipage or any(spec["type"] == "text_image" for spec in section_specs):
            about_image = await self.image_generator.generate_image(
                f"{brief.brand_name}, {brief.description}, photo"
            )
        await asyncio.sleep(0.3)

        await emit(3)
        item_action = self._resolve_item_action(brief)
        if is_multipage:
            # «Многостраничник» из ТЗ п.2 — реально несколько страниц (Главная/
            # Услуги/О нас/Контакты), а не один лендинг с другим ярлыком.
            pages = self._build_multipage(layout, copy, hero_bg, about_image, brief, item_action)
        else:
            sections = self._build_sections(section_specs, copy, hero_bg, about_image, brief, item_action)
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
    def _resolve_item_action(brief: BriefIn) -> str:
        """Что делают кнопки на карточках каталога/услуг: ничего, заявка или
        корзина. Явный выбор пользователя на экране «Структура» важнее дефолта
        по типу сайта."""
        chosen = brief.layout.item_action
        if chosen in _ACTION_TEXT:
            return chosen
        return _DEFAULT_ITEM_ACTION.get(brief.site_type.value, "lead")

    @staticmethod
    def _decorate_section(section: dict, item_action: str) -> dict:
        """Дописывает секции коммерческое поведение, если её тип это поддерживает.
        Вынесено отдельно, чтобы одностраничник и многостраничник получали его
        одинаково, а не двумя разошедшимися копиями логики."""
        if section["type"] in _ACTIONABLE_TYPES:
            section["action"] = item_action
            section["action_text"] = _ACTION_TEXT[item_action]
        return section

    @staticmethod
    def _build_lead_form(spec: dict, copy: dict, section_id: str = "lead_form") -> dict:
        """Форма заявки: тексты от копирайтера, состав полей — фиксированный
        (см. _LEAD_FORM_FIELDS)."""
        return {
            "id": section_id,
            "type": "lead_form",
            "variant": spec["variant"],
            "fields": [dict(field) for field in _LEAD_FORM_FIELDS],
            **copy["lead_form"],
        }

    @classmethod
    def _build_sections(
        cls,
        section_specs: list[dict],
        copy: dict,
        hero_bg: str,
        about_image: str | None,
        brief: BriefIn,
        item_action: str,
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
                        # Иконка корзины нужна ровно тогда, когда карточки
                        # кладут товар в корзину — иначе она вела бы в пустоту.
                        "show_cart": item_action == "cart",
                    }
                )
            elif key == "lead_form":
                sections.append(cls._build_lead_form(spec, copy))
            elif key == "hero":
                sections.append({"id": "hero", "type": "hero", "variant": variant, "bg_image": hero_bg, **copy["hero"]})
            elif key == "text_image":
                sections.append(
                    {
                        "id": "text_image",
                        "type": "text_image",
                        "variant": variant,
                        "title": "О нас",
                        "text": brief.description,
                        "image": about_image or "",
                        "image_position": "right",
                    }
                )
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
            elif key in copy:
                # Единая ветка для «чистых контентных» блоков — их содержимое
                # целиком приходит из copy[key] (grid_3col, pricing, testimonials
                # и новые catalog_filter/faq/gallery/stats/custom_content), без
                # ручной досборки полей. Новый тип в BLOCK_LIBRARY не требует
                # новой ветки здесь, пока копирайтер умеет его заполнить.
                sections.append(cls._decorate_section({"id": key, "type": key, "variant": variant, **copy[key]}, item_action))
            else:
                # Тип прошёл через YandexLayoutEngine._sanitize_sections (то
                # есть валиден), но копирайтер почему-то не вернул для него
                # контент — пропускаем секцию вместо падения всей генерации.
                logger.warning("GenerationOrchestrator: нет контента для секции %r, пропущена", key)
        return sections

    @staticmethod
    def _variant_for(layout: dict, section_type: str, default: str) -> str:
        for spec in layout["sections"]:
            if spec["type"] == section_type:
                return spec["variant"]
        return default

    def _build_multipage(
        self, layout: dict, copy: dict, hero_bg: str, about_image: str | None, brief: BriefIn, item_action: str
    ) -> list[Page]:
        # Ссылки — на реальные чистые маршруты статической Nuxt-сборки (см.
        # site-renderer: slug "main" рендерится в "/", остальные — в "/{slug}"),
        # а не якоря внутри одной страницы.
        nav_items = [
            {"label": "Главная", "href": "/"},
            {"label": "Услуги", "href": "/services"},
            {"label": "О нас", "href": "/about"},
            {"label": "Контакты", "href": "/contacts"},
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
                "show_cart": item_action == "cart",
            }

        def make_footer() -> dict:
            return {"id": "footer", "type": "footer", "variant": layout["footer_variant"], "links": nav_items, **copy["footer"]}

        grid_variant = self._variant_for(layout, "grid_3col", "cards")
        pricing_variant = self._variant_for(layout, "pricing", "cards")
        testimonials_variant = self._variant_for(layout, "testimonials", "cards")
        contact_variant = self._variant_for(layout, "contact_map", "centered")
        text_image_variant = self._variant_for(layout, "text_image", "standard")

        services_preview = dict(copy["grid_3col"])
        services_preview["items"] = services_preview["items"][:3]

        def make_grid(section_id: str, content: dict) -> dict:
            return self._decorate_section(
                {"id": section_id, "type": "grid_3col", "variant": grid_variant, **content}, item_action
            )

        # Доп. блоки из расширенного реестра (фильтр каталога/FAQ/галерея/
        # статистика/форма заявки/произвольный блок), если ИИ их выбрал под
        # задачу — размещаем на главной перед футером. 4 «базовых» типа уже
        # закреплены за конкретными страницами (services/about/contacts) ниже.
        _placed_types = {"header", "hero", "grid_3col", "pricing", "testimonials", "contact_map", "text_image", "footer"}
        extra_sections = [
            self._build_lead_form(spec, copy)
            if spec["type"] == "lead_form"
            else self._decorate_section(
                {"id": spec["type"], "type": spec["type"], "variant": spec["variant"], **copy[spec["type"]]}, item_action
            )
            for spec in layout["sections"]
            if spec["type"] not in _placed_types and spec["type"] in copy
        ]

        main_page = Page(
            slug="main",
            title=f"{brief.brand_name} — Главная",
            sections=[
                make_header(),
                {"id": "hero", "type": "hero", "variant": layout["hero_variant"], "bg_image": hero_bg, **copy["hero"]},
                make_grid("grid_3col", services_preview),
                {"id": "testimonials", "type": "testimonials", "variant": testimonials_variant, **copy["testimonials"]},
                *extra_sections,
                make_footer(),
            ],
        )
        services_page = Page(
            slug="services",
            title=f"{brief.brand_name} — Услуги",
            sections=[
                make_header(),
                make_grid("grid_3col", copy["grid_3col"]),
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
                    "variant": text_image_variant,
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
                # Страница контактов без формы обратной связи бессмысленна:
                # это единственный экран многостраничника, ради которого
                # посетитель на него и заходит.
                self._build_lead_form(
                    {"variant": self._variant_for(layout, "lead_form", "split")}, copy, section_id="lead_form"
                ),
                make_footer(),
            ],
        )
        return [main_page, services_page, about_page, contacts_page]
