"""Строгая JSON-схема сайта (ТЗ п.3). Все секции валидируются через discriminated union —
это и есть «валидатор на бэке», требуемый DoD п.2: любая команда ИИ-чата обязана
пройти через parse_site() прежде чем быть сохранённой в project.site_data.
"""
from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field

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


# ---- секции (обязательное поле id уникально в пределах страницы) ----------


class SectionBase(BaseModel):
    id: str


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


Section = Annotated[
    Union[
        HeaderSection,
        HeroSection,
        TextImageSection,
        Grid3ColSection,
        PricingSection,
        TestimonialsSection,
        ContactMapSection,
        FooterSection,
    ],
    Field(discriminator="type"),
]

BLOCK_LIBRARY: dict[str, type[BaseModel]] = {
    "header": HeaderSection,
    "hero": HeroSection,
    "text_image": TextImageSection,
    "grid_3col": Grid3ColSection,
    "pricing": PricingSection,
    "testimonials": TestimonialsSection,
    "contact_map": ContactMapSection,
    "footer": FooterSection,
}

# Единый источник правды по допустимым визуальным вариантам каждого блока —
# используется и Pydantic-моделями выше (Literal), и YandexLayoutEngine при
# формировании промпта/санитайзинге ответа (см. app/services/ai/providers.py),
# чтобы каждый сгенерированный сайт выглядел по-разному, а не по одному шаблону.
SECTION_VARIANTS: dict[str, list[str]] = {
    "header": ["standard", "centered", "split", "minimal"],
    "hero": ["centered", "split", "minimal", "gradient", "overlay"],
    "grid_3col": ["cards", "icon_rows", "minimal_list", "icon_top", "compact_grid"],
    "pricing": ["cards", "highlight", "table", "minimal"],
    "testimonials": ["cards", "quotes", "avatars_row", "single_featured"],
    "contact_map": ["centered", "split", "cards"],
    "footer": ["simple", "columns", "minimal"],
}


class Theme(BaseModel):
    style: Literal["business", "warm", "techno", "custom"] = "business"
    primary_color: str = "#2563EB"
    font: Literal["Inter", "Roboto", "PT Sans", "Montserrat"] = "Inter"
    logo_url: str = ""
    # Точечные CSS-правки от YandexGPT для запросов из ИИ-чата, которые не
    # сводятся к готовому полю секции (например «сделай текст кнопки жирным»).
    custom_css: str = ""


class Page(BaseModel):
    slug: str
    title: str = ""
    sections: list[Section] = Field(default_factory=list)


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
