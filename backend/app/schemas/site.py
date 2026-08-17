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
    # Картинка карточки — используется вариантами вёрстки с медиа (photo_cards)
    # и как превью товара, если grid_3col работает каталогом магазина.
    image: str = ""


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
    # Зачёркнутая «старая» цена — рисуется только если непустая.
    old_price: str = ""
    category: str = ""
    image: str = ""
    # Плашка поверх карточки («Хит», «-20%», «Новинка»).
    badge: str = ""
    # Артикул/VIN — попадает в заявку/заказ, чтобы владелец сайта понимал,
    # о каком именно товаре речь, даже если названия повторяются.
    sku: str = ""
    in_stock: bool = True


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


class LeadFormField(BaseModel):
    """Поле формы заявки. `name` уходит ключом в payload заявки, поэтому он
    latin-slug, а не человекочитаемая подпись (это `label`)."""

    name: str
    label: str
    type: Literal["text", "tel", "email", "textarea", "select"] = "text"
    required: bool = False
    placeholder: str = ""
    # Только для type="select".
    options: list[str] = Field(default_factory=list)


# Что делает кнопка на карточке товара/услуги. Ровно та ось, которая отличает
# каталог автомобилей (заявка, но никакой корзины) от интернет-магазина
# (добавление в корзину и оформление заказа):
#   none — карточка без кнопки, просто витрина;
#   lead — «Оставить заявку»: открывает модальную форму с контекстом товара;
#   cart — «В корзину»: кладёт товар в корзину сайта (см. site-blocks/composables/useCart.ts).
ItemAction = Literal["none", "lead", "cart"]


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
    # Иконка корзины со счётчиком в шапке — включается автоматически для
    # интернет-магазина (см. GenerationOrchestrator), для каталога с заявками
    # остаётся выключенной.
    show_cart: bool = False


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
    # standard — классические две колонки; overlap — картинка «наезжает» на
    # цветную подложку текста; card — текст и картинка в одной карточке с
    # тенью. Ось image_position (left/right) работает поверх любого варианта.
    variant: Literal["standard", "overlap", "card"] = "standard"
    title: str = ""
    text: str = ""
    image: str = ""
    image_position: Literal["left", "right"] = "right"


class Grid3ColSection(SectionBase):
    type: Literal["grid_3col"] = "grid_3col"
    # cards — карточки с рамкой; icon_rows — горизонтальные строки с номером;
    # minimal_list — компактный список «название — цена» без описаний;
    # icon_top — карточки с крупной иконкой (поле icon) над названием;
    # compact_grid — плотная сетка 2 колонки без описаний, только цена;
    # photo_cards — карточки с фотографией (поле image) во всю ширину сверху
    variant: Literal["cards", "icon_rows", "minimal_list", "icon_top", "compact_grid", "photo_cards"] = "cards"
    title: str = ""
    items: list[ServiceItem] = Field(default_factory=list)
    cta_text: str = ""
    # Кнопка на карточке: заявка или корзина (см. ItemAction).
    action: ItemAction = "none"
    action_text: str = ""


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
    """Каталог товаров/услуг с клиентской фильтрацией по категории — состояние
    фильтра живёт на клиенте (см. site-blocks/composables/useCatalogFilter.ts),
    а не генерируется ИИ.

    `action` определяет модель поведения каталога: витрина без кнопок, каталог
    с заявками (автосалон, недвижимость, услуги) или полноценный магазин с
    корзиной. Это осознанно ОДИН блок с переключателем, а не три разных типа:
    вёрстка карточки одна и та же, разница только в кнопке и её обработчике.
    """

    type: Literal["catalog_filter"] = "catalog_filter"
    # grid — сетка карточек; list — широкие строки с фото слева и характеристиками
    # справа (удобно для авто/недвижимости); showcase — крупная витрина 2 колонки
    # с большими фото
    variant: Literal["grid", "list", "showcase"] = "grid"
    title: str = ""
    # Явный порядок чипов фильтра; если пусто — фронт сам соберёт уникальные
    # category из items.
    categories: list[str] = Field(default_factory=list)
    items: list[CatalogItem] = Field(default_factory=list)
    action: ItemAction = "none"
    action_text: str = ""
    # Клиентский поиск по названию/описанию поверх фильтра по категориям.
    show_search: bool = False


class FaqSection(SectionBase):
    type: Literal["faq"] = "faq"
    # accordion — раскрывающиеся вопросы; two_columns — два столбца сразу
    # раскрытых пар вопрос/ответ; plain — простой список без рамок
    variant: Literal["accordion", "two_columns", "plain"] = "accordion"
    title: str = ""
    items: list[FaqItem] = Field(default_factory=list)


class GallerySection(SectionBase):
    type: Literal["gallery"] = "gallery"
    # grid — ровная сетка; masonry — «кирпичная кладка» разной высоты;
    # slider — горизонтальная лента с прокруткой (scroll-snap, без JS-библиотек)
    variant: Literal["grid", "masonry", "slider"] = "grid"
    title: str = ""
    items: list[GalleryItem] = Field(default_factory=list)


class StatsSection(SectionBase):
    type: Literal["stats"] = "stats"
    # row — цифры в один ряд; cards — каждая цифра в своей карточке;
    # big_numbers — очень крупные цифры в две колонки с разделителями
    variant: Literal["row", "cards", "big_numbers"] = "row"
    title: str = ""
    items: list[StatItem] = Field(default_factory=list)


class LeadFormSection(SectionBase):
    """Блок формы заявки. Куда именно уходит заявка, секция НЕ знает — это
    настройка проекта (ProjectSettings.leads), общая для всех форм сайта.
    Здесь только внешний вид и состав полей."""

    type: Literal["lead_form"] = "lead_form"
    # split — форма справа, текст/картинка слева; card — форма карточкой по
    # центру; inline — компактная строка полей в одну линию (подписка/быстрый
    # звонок)
    variant: Literal["split", "card", "inline"] = "split"
    title: str = ""
    subtitle: str = ""
    fields: list[LeadFormField] = Field(default_factory=list)
    submit_text: str = "Отправить"
    success_text: str = "Спасибо! Мы свяжемся с вами в ближайшее время."
    # Пусто = взять текст согласия из настроек проекта (152-ФЗ).
    consent_text: str = ""
    # Картинка для варианта split.
    image: str = ""


class CustomContentSection(SectionBase):
    """Запасной универсальный блок для запросов, не покрытых остальным
    реестром — заполняется по свободному тексту brief.extra_requirements или
    команде ИИ-чата. body рендерится БЕЗ v-html (см. useLiteMarkdown.ts на
    фронте) — лёгкая разметка **жирный**/*курсив*/списки через "- ", без
    произвольного HTML."""

    type: Literal["custom_content"] = "custom_content"
    # standard — обычный текстовый блок; callout — текст на цветной подложке с
    # акцентной полосой слева; columns — текст слева, пары label/value справа
    variant: Literal["standard", "callout", "columns"] = "standard"
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
    "lead_form": LeadFormSection,
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
# Выводится из BLOCK_LIBRARY, а не дублируется вручную.
SECTION_VARIANTS: dict[str, list[str]] = {name: _variants_of(model) for name, model in BLOCK_LIBRARY.items()}


class Theme(BaseModel):
    """Тема сайта. Кроме цвета/шрифта содержит «оси вёрстки» — сквозные
    параметры, которые меняют пропорции и характер ВСЕХ блоков сразу
    (скругления, плотность, ширина контента, оформление заголовков и кнопок,
    разделители секций). Именно они дают разным сайтам разный характер даже
    при совпадающем наборе блоков — раньше вариативность держалась только на
    variant отдельных блоков, и сайты выходили однотипными.

    Все оси реализованы CSS-переменными и классами на <html> (см.
    site-blocks/composables/useSiteTheme.ts + assets/tokens.css) — новых
    Vue-компонентов не требуют.
    """

    style: Literal["business", "warm", "techno", "custom"] = "business"
    primary_color: str = "#2563EB"
    font: Literal["Inter", "Roboto", "PT Sans", "Montserrat"] = "Inter"
    logo_url: str = ""
    # Фон сайта целиком — пусто = дефолтный --surface (белый) из tokens.css.
    bg_color: str = ""
    # Точечные CSS-правки от ИИ-чата, которые не сводятся к готовому полю секции
    # (например «сделай текст кнопки жирным»).
    custom_css: str = ""

    # ---- оси вёрстки ----
    # sharp — прямые углы; soft — умеренные скругления; round — сильно скруглённые
    radius: Literal["sharp", "soft", "round"] = "soft"
    # Вертикальные отступы секций и внутренние отступы карточек
    density: Literal["compact", "cozy", "airy"] = "cozy"
    # Максимальная ширина контентной колонки
    container_width: Literal["narrow", "normal", "wide"] = "normal"
    # plain — обычный заголовок; eyebrow — мелкая акцентная надстрочная подпись;
    # underline — акцентное подчёркивание под заголовком; gradient — заголовок
    # залит фирменным градиентом
    heading_style: Literal["plain", "eyebrow", "underline", "gradient"] = "plain"
    button_style: Literal["solid", "outline", "pill", "ghost"] = "solid"
    # Как визуально разделяются соседние секции
    section_divider: Literal["none", "line", "tilt", "wave"] = "none"


# Оси темы, которые подбираются под бриф (не цвет/шрифт/логотип) — единый
# список для промпта YandexLayoutEngine, санитайзинга его ответа и ручного
# выбора структуры в воронке админки.
THEME_AXES: dict[str, list[str]] = {
    name: list(get_args(Theme.model_fields[name].annotation))
    for name in ("radius", "density", "container_width", "heading_style", "button_style", "section_divider")
}


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


def site_uses_cart(site: SiteSchema) -> bool:
    """Есть ли на сайте хоть один блок с кнопкой «в корзину». Используется
    рендерером/сборщиком, чтобы не тащить корзину и оформление заказа на сайты,
    где корзины нет (каталог с заявками, лендинг, портфолио)."""
    return any(
        getattr(section, "action", None) == "cart" or getattr(section, "show_cart", False)
        for page in site.pages
        for section in page.sections
    )
