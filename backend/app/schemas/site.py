"""Строгая JSON-схема сайта (ТЗ п.3). Все секции валидируются через discriminated union —
это и есть «валидатор на бэке», требуемый DoD п.2: любая команда ИИ-чата обязана
пройти через parse_site() прежде чем быть сохранённой в project.site_data.

BLOCK_LIBRARY — единый источник правды по типам блоков: чтобы добавить новый тип,
достаточно описать Pydantic-модель и добавить одну запись сюда. `Section` (discriminated
union) и `SECTION_VARIANTS` вычисляются из BLOCK_LIBRARY автоматически ниже — без
ручного дублирования списка типов в нескольких местах (было главной причиной, почему
раньше добавление блока требовало правок в 7+ местах).
"""
from __future__ import annotations

from typing import Annotated, Literal, Union, get_args

from pydantic import BaseModel, Field, field_validator

# ---- общие блоки -----------------------------------------------------------


class NavItem(BaseModel):
    label: str
    href: str = "#"


class SocialLink(BaseModel):
    platform: str
    url: str


class ServiceItem(BaseModel):
    name: str
    description: str = ""
    price: str = ""
    icon: str = ""


class PricingPlan(BaseModel):
    name: str
    price: str
    period: str = "мес"
    features: list[str] = Field(default_factory=list)
    highlighted: bool = False


class Testimonial(BaseModel):
    author: str
    text: str
    avatar: str = ""
    rating: int = 5


class CatalogItem(BaseModel):
    name: str
    description: str = ""
    price: str = ""
    category: str = ""
    image: str = ""


class FaqItem(BaseModel):
    question: str
    answer: str = ""


class GalleryItem(BaseModel):
    image: str
    caption: str = ""


class StatItem(BaseModel):
    value: str
    label: str


class CustomContentItem(BaseModel):
    label: str
    value: str = ""


# ---- секции (обязательное поле id уникально в пределах страницы) ----------


class SectionBase(BaseModel):
    id: str
    # Фон конкретного блока — пусто = наследует фон сайта (theme.bg_color)
    # либо дефолтный --surface из site-blocks/assets/tokens.css.
    bg_color: str = ""


class HeaderSection(SectionBase):
    type: Literal["header"] = "header"
    # standard — лого слева, меню и кнопка справа; centered — лого сверху по центру, меню под ним;
    # split — лого слева, меню по центру, кнопка справа тремя колонками;
    # minimal — только лого и кнопка, без видимого меню
    variant: Literal["standard", "centered", "split", "minimal"] = "standard"
    logo_text: str = ""
    nav_items: list[NavItem] = Field(default_factory=list)
    sticky: bool = False
    cta_text: str = ""


class HeroSection(SectionBase):
    type: Literal["hero"] = "hero"
    # centered — текст поверх фонового изображения; split — текст и картинка рядом;
    # minimal — без изображения, крупный текст на заливке акцентным цветом;
    # gradient — крупный текст на фирменном градиенте вместо фото;
    # overlay — фото на весь блок с тёмной затемняющей подложкой и белым текстом
    variant: Literal["centered", "split", "minimal", "gradient", "overlay"] = "centered"
    title: str = ""
    subtitle: str = ""
    cta_text: str = ""
    cta_href: str = "#"
    bg_image: str = ""


class TextImageSection(SectionBase):
    type: Literal["text_image"] = "text_image"
    title: str = ""
    text: str = ""
    image: str = ""
    image_position: Literal["left", "right"] = "right"


class Grid3ColSection(SectionBase):
    type: Literal["grid_3col"] = "grid_3col"
    # cards — карточки с рамкой; icon_rows — горизонтальные строки с номером;
    # minimal_list — компактный список «название — цена» без описаний;
    # icon_top — карточки с крупной иконкой (поле icon) над названием;
    # compact_grid — плотная сетка 2 колонки без описаний, только цена
    variant: Literal["cards", "icon_rows", "minimal_list", "icon_top", "compact_grid"] = "cards"
    title: str = ""
    items: list[ServiceItem] = Field(default_factory=list)
    cta_text: str = ""


class PricingSection(SectionBase):
    type: Literal["pricing"] = "pricing"
    # cards — три равных карточки; highlight — средний план крупнее и по центру;
    # table — компактная таблица-сравнение в один блок; minimal — только
    # название/цена/кнопка без списка опций
    variant: Literal["cards", "highlight", "table", "minimal"] = "cards"
    title: str = ""
    plans: list[PricingPlan] = Field(default_factory=list)


class TestimonialsSection(SectionBase):
    type: Literal["testimonials"] = "testimonials"
    # cards — карточки в ряд; quotes — крупные цитаты в один столбец;
    # avatars_row — компактный ряд с круглым аватаром и именем;
    # single_featured — один крупный выделенный отзыв по центру
    variant: Literal["cards", "quotes", "avatars_row", "single_featured"] = "cards"
    title: str = ""
    items: list[Testimonial] = Field(default_factory=list)


class ContactMapSection(SectionBase):
    type: Literal["contact_map"] = "contact_map"
    # centered — вся информация по центру; split — карта слева, контакты справа;
    # cards — адрес/телефон/email в отдельных карточках в ряд
    variant: Literal["centered", "split", "cards"] = "centered"
    title: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    map_embed_url: str = ""
    show_map: bool = True


class FooterSection(SectionBase):
    type: Literal["footer"] = "footer"
    # simple — один ряд (лого, меню, копирайт); columns — колонки с описанием бренда;
    # minimal — только копирайт по центру, без меню и лого
    variant: Literal["simple", "columns", "minimal"] = "simple"
    company_name: str = ""
    copyright_text: str = ""
    links: list[NavItem] = Field(default_factory=list)
    socials: list[SocialLink] = Field(default_factory=list)


class CatalogFilterSection(SectionBase):
    """Каталог товаров/услуг с клиентской фильтрацией по категории — единственный
    интерактивный блок, состояние фильтра живёт на клиенте (см.
    site-blocks/composables/useCatalogFilter.ts), а не генерируется ИИ."""

    type: Literal["catalog_filter"] = "catalog_filter"
    variant: Literal["grid"] = "grid"
    title: str = ""
    # Явный порядок чипов фильтра; если пусто — фронт сам соберёт уникальные
    # category из items.
    categories: list[str] = Field(default_factory=list)
    items: list[CatalogItem] = Field(default_factory=list)


class FaqSection(SectionBase):
    type: Literal["faq"] = "faq"
    variant: Literal["accordion"] = "accordion"
    title: str = ""
    items: list[FaqItem] = Field(default_factory=list)


class GallerySection(SectionBase):
    type: Literal["gallery"] = "gallery"
    variant: Literal["grid"] = "grid"
    title: str = ""
    items: list[GalleryItem] = Field(default_factory=list)


class StatsSection(SectionBase):
    type: Literal["stats"] = "stats"
    variant: Literal["row"] = "row"
    title: str = ""
    items: list[StatItem] = Field(default_factory=list)


class CustomContentSection(SectionBase):
    """Запасной универсальный блок для запросов, не покрытых остальным
    реестром — заполняется по свободному тексту brief.extra_requirements или
    команде ИИ-чата. body рендерится БЕЗ v-html (см. useLiteMarkdown.ts на
    фронте) — лёгкая разметка **жирный**/*курсив*/списки через "- ", без
    произвольного HTML."""

    type: Literal["custom_content"] = "custom_content"
    variant: Literal["standard"] = "standard"
    title: str = ""
    body: str = ""
    items: list[CustomContentItem] = Field(default_factory=list)


BLOCK_LIBRARY: dict[str, type[BaseModel]] = {
    "header": HeaderSection,
    "hero": HeroSection,
    "text_image": TextImageSection,
    "grid_3col": Grid3ColSection,
    "pricing": PricingSection,
    "testimonials": TestimonialsSection,
    "contact_map": ContactMapSection,
    "footer": FooterSection,
    "catalog_filter": CatalogFilterSection,
    "faq": FaqSection,
    "gallery": GallerySection,
    "stats": StatsSection,
    "custom_content": CustomContentSection,
}

Section = Annotated[
    Union[tuple(BLOCK_LIBRARY.values())],  # type: ignore[misc]
    Field(discriminator="type"),
]


def _variants_of(model: type[BaseModel]) -> list[str]:
    field = model.model_fields.get("variant")
    if field is None:
        return []
    return list(get_args(field.annotation))


# Единый источник правды по допустимым визуальным вариантам каждого блока —
# используется и Pydantic-моделями выше (Literal), и YandexLayoutEngine при
# формировании промпта/санитайзинге ответа (см. app/services/ai/providers.py),
# чтобы каждый сгенерированный сайт выглядел по-разному, а не по одному шаблону.
# Выводится из BLOCK_LIBRARY, а не дублируется вручную — типы без поля variant
# (text_image, custom_content) естественным образом дают пустой список.
SECTION_VARIANTS: dict[str, list[str]] = {name: _variants_of(model) for name, model in BLOCK_LIBRARY.items()}


class Theme(BaseModel):
    style: Literal["business", "warm", "techno", "custom"] = "business"
    primary_color: str = "#2563EB"
    font: Literal["Inter", "Roboto", "PT Sans", "Montserrat"] = "Inter"
    logo_url: str = ""
    # Фон сайта целиком — пусто = дефолтный --surface (белый) из tokens.css.
    bg_color: str = ""
    # Точечные CSS-правки от ИИ-чата, которые не сводятся к готовому полю секции
    # (например «сделай текст кнопки жирным»).
    custom_css: str = ""


class Page(BaseModel):
    slug: str
    title: str = ""
    sections: list[Section] = Field(default_factory=list)

    @field_validator("sections")
    @classmethod
    def _unique_section_ids(cls, sections: list) -> list:
        """id секции обязан быть уникален в пределах страницы (см. комментарий
        у SectionBase) — иначе `:key="section.id"` в PageCanvas/SectionRenderer
        путает секции при обновлении. Раньше это нигде не проверялось: ИИ-чат
        иногда переиспользовал id существующей секции для новой (например,
        добавляя второй `faq`) — теперь такой ответ отклоняется parse_site() и
        уходит на retry в AIChatEditor вместо тихого сохранения дубликата."""
        seen = set()
        for section in sections:
            if section.id in seen:
                raise ValueError(f"duplicate section id: {section.id!r}")
            seen.add(section.id)
        return sections


class SiteSchema(BaseModel):
    """Корневая JSON-схема сайта — ровно то, что хранится в Project.site_data."""

    project_id: str
    type: Literal["landing", "shop", "multipage", "crm"]
    theme: Theme
    pages: list[Page]


def parse_site(data: dict) -> SiteSchema:
    """Валидирует произвольный dict как SiteSchema. Бросает pydantic.ValidationError
    при поломанной структуре — используется и генератором, и обработчиком ИИ-чата,
    чтобы гарантировать DoD п.2 (JSON никогда не сохраняется в невалидном виде)."""
    return SiteSchema.model_validate(data)
