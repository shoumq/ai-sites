"""Клиенты трёх AI-провайдеров (ТЗ п.1: «Все запросы к AI идут через единый
Orchestrator»). Каждый клиент работает в двух режимах:

  * реальный — если в .env задан соответствующий API-ключ;
  * mock — если ключа нет (по умолчанию для локальной разработки), чтобы весь
    пайплайн генерации был проверяемым без внешних учётных данных.

Реальные HTTP-вызовы оставлены как заглушки `_call_real_api`, готовые к
подключению ключей — эндпоинты и формат payload зависят от актуальной
документации провайдеров на момент интеграции.
"""
from __future__ import annotations

import hashlib
import json
import random
import re

import httpx

from app.core.config import Settings
from app.schemas.project import BriefIn
from app.schemas.site import SECTION_VARIANTS, SiteSchema, parse_site
from app.services.chat_commands import apply_chat_command

_HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")

# Тон и структура текстов должны реально зависеть от типа сайта, а не только
# от брифа — иначе лендинг, магазин и CRM-портал выглядят как один и тот же
# сайт с разными подписями (жалоба, которую этот словарь закрывает).
_COPY_TYPE_GUIDANCE = {
    "landing": "Это лендинг с фокусом на продажу/заявку с одного экрана — пиши энергично, с явным призывом к действию.",
    "shop": (
        "Это интернет-магазин. services.items — это КОНКРЕТНЫЕ ТОВАРЫ (не абстрактные "
        'услуги), сделай 6 штук. hero.cta_text — про покупку/каталог (например "В каталог", '
        '"Купить сейчас"), а не "Оставить заявку". Если пишешь pricing — оформи как акции '
        "или комплекты товаров, а не как абонентские тарифы."
    ),
    "crm": (
        "Это SaaS/CRM-портал с личным кабинетом. services.items — это ВОЗМОЖНОСТИ платформы "
        '(фичи продукта, не услуги руками). pricing.plans — тарифы подписки (Базовый/Про/'
        'Бизнес). hero.cta_text — про начало работы (например "Начать бесплатно", "Войти").'
    ),
    "multipage": "Это многостраничный корпоративный сайт — пиши официальным, но дружелюбным тоном.",
}


def _copy_items_count(site_type: str) -> int:
    return 6 if site_type == "shop" else 3


# Структура блоков тоже должна зависеть от типа сайта — без этого DeepSeek
# в реальном режиме собирал один и тот же набор блоков (grid_3col+pricing+
# testimonials+contact_map) независимо от landing/shop/crm.
_LAYOUT_TYPE_GUIDANCE = {
    "landing": "landing — полная воронка продаж на одном экране: уместны все блоки из списка.",
    "shop": (
        "shop — это каталог товаров, а НЕ сервис с подпиской: НЕ выбирай pricing (тарифные "
        "планы не подходят для магазина с отдельными товарами). Обязательно возьми grid_3col "
        "как каталог товаров. testimonials и contact_map уместны."
    ),
    "crm": (
        "crm — это SaaS-платформа с личным кабинетом: pricing здесь означает тарифы подписки "
        "и уместен. grid_3col используй как список возможностей платформы. contact_map — как "
        "поддержку. testimonials необязательны, можно обойтись без них."
    ),
}


def _is_hex_color(value: object) -> bool:
    return isinstance(value, str) and bool(_HEX_COLOR_RE.match(value))


def _seeded_choice(seed: str, options: list[str]) -> str:
    """Детерминированный (но разный для разных seed) выбор из списка — даёт
    визуальное разнообразие в mock-режиме и при откате на фолбэк, без
    настоящей случайности (одинаковый бриф всегда даёт одинаковый результат)."""
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()
    return options[int(digest, 16) % len(options)]


class OpenAICopywriter:
    """GPT-4o — генерация текстов сайта."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.openai_api_key

    async def generate_copy(self, brief: BriefIn) -> dict:
        fallback = self._mock_copy(brief)
        if self.mock:
            return fallback
        raw = await self._call_real_api(brief)
        return self._coerce_copy(raw, fallback)

    async def _call_real_api(self, brief: BriefIn) -> dict | None:  # pragma: no cover — требует ключ
        items_count = _copy_items_count(brief.site_type.value)
        type_guidance = _COPY_TYPE_GUIDANCE.get(brief.site_type.value, "")
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.settings.openai_api_key}"},
                    json={
                        "model": self.settings.openai_model,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "Ты копирайтер AI-конструктора сайтов. Пиши тексты на русском языке. "
                                    f"{type_guidance}\n\n"
                                    "Верни строго JSON без markdown и без пояснений, СТРОГО с такими ключами "
                                    "и типами (не добавляй и не переименовывай поля):\n"
                                    "{\n"
                                    '  "hero": {"title": str, "subtitle": str, "cta_text": str},\n'
                                    '  "services": {"title": str, "items": [{"name": str, '
                                    '"description": str, "price": str}, ...]},\n'
                                    '  "pricing": {"title": str, "plans": [{"name": str, "price": str, '
                                    '"period": str, "features": [str, ...], "highlighted": bool}, ...]},\n'
                                    '  "testimonials": {"title": str, "items": [{"author": str, "text": str, '
                                    '"rating": int}, ...]},\n'
                                    '  "footer": {"company_name": str, "copyright_text": str}\n'
                                    "}\n"
                                    "price и period — всегда строки (например \"1 500\", \"мес\"), а не числа. "
                                    f"{items_count} items в services, 3 plans в pricing, 2 items в testimonials."
                                ),
                            },
                            {
                                "role": "user",
                                "content": (
                                    f"Бренд: {brief.brand_name}\nЧем занимается: {brief.description}\n"
                                    f"Цель сайта: {brief.goal.value}\nТип сайта: {brief.site_type.value}"
                                ),
                            },
                        ],
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            # Сбой сети/лимитов/невалидный JSON — откатываемся на mock-копию,
            # чтобы один упавший провайдер не ронял всю генерацию сайта.
            return None

    def _coerce_copy(self, raw: object, fallback: dict) -> dict:
        """Строит финальный `copy`, беря из ответа LLM только валидные поля и
        подстраховывая всё остальное значениями из `fallback`. Так упавший или
        неполный ответ провайдера не превращается в KeyError/ValidationError
        при сборке JSON-схемы сайта ниже по пайплайну."""
        if not isinstance(raw, dict):
            return fallback
        return {
            "hero": self._merge_dict(raw.get("hero"), fallback["hero"]),
            "services": {
                "title": self._pick_str(raw.get("services"), "title", fallback["services"]["title"]),
                "items": self._coerce_list(self._pick(raw.get("services"), "items"), ("name",), fallback["services"]["items"]),
            },
            "pricing": {
                "title": self._pick_str(raw.get("pricing"), "title", fallback["pricing"]["title"]),
                "plans": self._coerce_list(self._pick(raw.get("pricing"), "plans"), ("name", "price"), fallback["pricing"]["plans"]),
            },
            "testimonials": {
                "title": self._pick_str(raw.get("testimonials"), "title", fallback["testimonials"]["title"]),
                "items": self._coerce_list(
                    self._pick(raw.get("testimonials"), "items"), ("author", "text"), fallback["testimonials"]["items"]
                ),
            },
            "footer": self._merge_dict(raw.get("footer"), fallback["footer"]),
        }

    @staticmethod
    def _pick(obj: object, key: str) -> object:
        return obj.get(key) if isinstance(obj, dict) else None

    @staticmethod
    def _pick_str(obj: object, key: str, default: str) -> str:
        value = obj.get(key) if isinstance(obj, dict) else None
        return value if isinstance(value, str) and value.strip() else default

    @staticmethod
    def _merge_dict(raw: object, fallback: dict) -> dict:
        """Копирует из `raw` только те строковые поля, что уже есть в `fallback` —
        так LLM не может подсунуть лишний ключ (например, `bg_image` в hero,
        затерев реально сгенерированную Kandinsky-картинку)."""
        if not isinstance(raw, dict):
            return dict(fallback)
        merged = dict(fallback)
        for key in fallback:
            value = raw.get(key)
            if isinstance(value, str) and value.strip():
                merged[key] = value
        return merged

    @staticmethod
    def _coerce_list(raw: object, required_keys: tuple[str, ...], fallback: list) -> list:
        if not isinstance(raw, list):
            return fallback
        result = [
            item
            for item in raw
            if isinstance(item, dict) and all(isinstance(item.get(k), str) and item[k].strip() for k in required_keys)
        ]
        return result or fallback

    def _mock_copy(self, brief: BriefIn) -> dict:
        site_type = brief.site_type.value
        goal_cta = {
            "sales": "Купить сейчас",
            "booking": "Записаться",
            "portfolio": "Смотреть работы",
            "info": "Узнать больше",
        }[brief.goal.value]
        if site_type == "shop":
            goal_cta = "В каталог"
        elif site_type == "crm":
            goal_cta = "Начать бесплатно"

        if site_type == "shop":
            services_title = "Каталог товаров"
            item_label = "Товар"
            services_items = [
                {"name": f"{item_label} {i}", "description": f"{brief.description[:50]}…", "price": f"от {1000 + i * 500} ₽"}
                for i in range(1, 7)
            ]
        elif site_type == "crm":
            services_title = "Возможности платформы"
            services_items = [
                {"name": "Управление задачами", "description": "Планирование и контроль в одном окне", "price": ""},
                {"name": "Совместная работа", "description": "Команда видит прогресс в реальном времени", "price": ""},
                {"name": "Аналитика", "description": "Отчёты и метрики без ручной сборки", "price": ""},
            ]
        else:
            services_title = "Что мы предлагаем"
            services_items = [
                {"name": "Услуга 1", "description": f"{brief.description[:60]}…", "price": "от 1 500 ₽"},
                {"name": "Услуга 2", "description": "Индивидуальный подход к каждому клиенту", "price": "от 2 900 ₽"},
                {"name": "Услуга 3", "description": "Гарантия качества и поддержка после заказа", "price": "от 4 500 ₽"},
            ]

        return {
            "hero": {
                "title": brief.brand_name,
                "subtitle": brief.description[:140],
                "cta_text": goal_cta,
            },
            "services": {"title": services_title, "items": services_items},
            "pricing": {
                "title": "Акции" if site_type == "shop" else "Тарифы",
                "plans": [
                    {"name": "Базовый", "price": "1 500", "features": ["Консультация", "Базовый пакет услуг"]},
                    {"name": "Оптимальный", "price": "3 900", "features": ["Всё из Базового", "Приоритетная поддержка"], "highlighted": True},
                    {"name": "Премиум", "price": "7 900", "features": ["Всё из Оптимального", "Персональный менеджер"]},
                ],
            },
            "testimonials": {
                "title": "Отзывы клиентов",
                "items": [
                    {"author": "Анна К.", "text": f"Отличный сервис от «{brief.brand_name}», рекомендую!", "rating": 5},
                    {"author": "Дмитрий С.", "text": "Быстро, качественно, всё понравилось.", "rating": 5},
                ],
            },
            "footer": {
                "company_name": brief.brand_name,
                "copyright_text": f"© {brief.brand_name}. Все права защищены.",
            },
        }


class DeepSeekLayoutEngine:
    """DeepSeek — подбор темы, состава блоков и визуального варианта КАЖДОГО
    блока под бриф.

    header и hero структурно обязательны и всегда идут первыми, footer —
    последним; их оркестратор добавляет сам. Но их визуальный вариант (как и
    вариант каждого среднего блока) выбирает ИИ из фиксированной библиотеки
    React-компонентов (см. SECTION_VARIANTS в app/schemas/site.py) — поэтому
    два сайта с одинаковым набором блоков всё равно выглядят по-разному, а не
    штампуются по одному шаблону.
    """

    PRESET_THEMES = {
        "business": {"primary_color": "#2563EB", "font": "Inter"},
        "warm": {"primary_color": "#C17A4E", "font": "PT Sans"},
        "techno": {"primary_color": "#7C3AED", "font": "Montserrat"},
        "custom": {"primary_color": "#2563EB", "font": "Inter"},
    }

    ALLOWED_FONTS = {"Inter", "Roboto", "PT Sans", "Montserrat"}
    ALLOWED_MIDDLE_SECTIONS = ["text_image", "grid_3col", "pricing", "testimonials", "contact_map"]

    # Какие средние блоки в принципе уместны для типа сайта — сам выбор варианта
    # и итоговый порядок в реальном режиме решает ИИ, это лишь пул типов.
    DEFAULT_MIDDLE_SECTIONS = {
        "landing": ["grid_3col", "pricing", "testimonials", "contact_map"],
        # pricing нарочно нет — магазин с отдельными товарами, а не подпиской
        "shop": ["grid_3col", "testimonials", "contact_map"],
        "crm": ["text_image", "pricing", "contact_map"],
        "multipage": ["text_image", "grid_3col", "testimonials", "contact_map"],
    }

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.deepseek_api_key

    async def plan_layout(self, brief: BriefIn) -> dict:
        """Возвращает {"primary_color", "font", "style", "header_variant",
        "hero_variant", "footer_variant", "sections": [{"type","variant"}, ...]}."""
        preset = dict(self.PRESET_THEMES[brief.style.value])
        if brief.style.value == "custom" and brief.custom_hex_color:
            preset["primary_color"] = brief.custom_hex_color
        fallback = self._fallback_layout(brief)

        if not self.mock:
            raw = await self._call_real_api(brief)
            if raw:
                return {
                    "primary_color": raw.get("primary_color") if _is_hex_color(raw.get("primary_color")) else preset["primary_color"],
                    "font": raw.get("font") if raw.get("font") in self.ALLOWED_FONTS else preset["font"],
                    "style": brief.style.value,
                    "header_variant": self._pick_variant("header", raw.get("header_variant"), fallback["header_variant"]),
                    "hero_variant": self._pick_variant("hero", raw.get("hero_variant"), fallback["hero_variant"]),
                    "footer_variant": self._pick_variant("footer", raw.get("footer_variant"), fallback["footer_variant"]),
                    "sections": self._sanitize_sections(raw.get("sections")) or fallback["sections"],
                }

        return {**preset, "style": brief.style.value, **fallback}

    def _fallback_layout(self, brief: BriefIn) -> dict:
        """Детерминированный (по бренду) фолбэк для mock-режима и для сбоя
        реального вызова. Варианты выбираются псевдослучайно по хэшу брифа,
        поэтому разные проекты выглядят по-разному даже без ключа DeepSeek."""
        seed = f"{brief.brand_name}|{brief.description}"
        middle_types = self.DEFAULT_MIDDLE_SECTIONS.get(brief.site_type.value, self.DEFAULT_MIDDLE_SECTIONS["multipage"])
        return {
            "header_variant": _seeded_choice(f"{seed}|header", SECTION_VARIANTS["header"]),
            "hero_variant": _seeded_choice(f"{seed}|hero", SECTION_VARIANTS["hero"]),
            "footer_variant": _seeded_choice(f"{seed}|footer", SECTION_VARIANTS["footer"]),
            "sections": [
                {"type": t, "variant": _seeded_choice(f"{seed}|{t}", SECTION_VARIANTS[t]) if t in SECTION_VARIANTS else ""}
                for t in middle_types
            ],
        }

    @staticmethod
    def _pick_variant(section_type: str, raw_value: object, fallback_value: str) -> str:
        return raw_value if raw_value in SECTION_VARIANTS[section_type] else fallback_value

    def _sanitize_sections(self, sections: object) -> list[dict]:
        """Отфильтровывает несуществующие типы/варианты и убирает повторы —
        ИИ иногда придумывает несуществующий блок, дублирует его или путает
        вариант с другим типом блока. text_image — валидный тип, но у него нет
        записи в SECTION_VARIANTS (своя ось вариативности через image_position),
        поэтому для него используем .get() и пустой вариант вместо KeyError."""
        if not isinstance(sections, list):
            return []
        seen: set[str] = set()
        result: list[dict] = []
        for item in sections:
            if not isinstance(item, dict):
                continue
            section_type = item.get("type")
            if section_type not in self.ALLOWED_MIDDLE_SECTIONS or section_type in seen:
                continue
            seen.add(section_type)
            options = SECTION_VARIANTS.get(section_type)
            variant = (item.get("variant") if item.get("variant") in options else options[0]) if options else ""
            result.append({"type": section_type, "variant": variant})
        return result

    async def _call_real_api(self, brief: BriefIn) -> dict | None:  # pragma: no cover — требует ключ
        type_guidance = _LAYOUT_TYPE_GUIDANCE.get(brief.site_type.value, "")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    "https://api.deepseek.com/chat/completions",
                    headers={"Authorization": f"Bearer {self.settings.deepseek_api_key}"},
                    json={
                        "model": self.settings.deepseek_model,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "Ты фронтенд-архитектор AI-конструктора сайтов. Библиотека React-блоков "
                                    "фиксирована, но у каждого блока есть несколько визуальных вариантов — "
                                    "выбирай их осознанно под характер бизнеса и НЕ всегда один и тот же "
                                    "набор, чтобы разные сайты выглядели по-разному, а не по шаблону. Сайт "
                                    "всегда открывается шапкой (header) и героем (hero) и заканчивается "
                                    "футером (footer) — в sections их добавлять не нужно, только укажи "
                                    "их variant отдельными полями.\n\n"
                                    f"ОБЯЗАТЕЛЬНО учти тип сайта при выборе состава блоков: {type_guidance}\n\n"
                                    "Допустимые варианты:\n"
                                    f"- header_variant: {SECTION_VARIANTS['header']}\n"
                                    f"- hero_variant: {SECTION_VARIANTS['hero']}\n"
                                    f"- footer_variant: {SECTION_VARIANTS['footer']}\n"
                                    f"- variant блока grid_3col: {SECTION_VARIANTS['grid_3col']}\n"
                                    f"- variant блока pricing: {SECTION_VARIANTS['pricing']}\n"
                                    f"- variant блока testimonials: {SECTION_VARIANTS['testimonials']}\n"
                                    f"- variant блока contact_map: {SECTION_VARIANTS['contact_map']}\n\n"
                                    "Выбери от 3 до 6 блоков ИЗ СПИСКА "
                                    "[text_image, grid_3col, pricing, testimonials, contact_map] (с учётом "
                                    "правила по типу сайта выше) и порядок их показа под задачу пользователя, "
                                    "плюс акцентный HEX-цвет и шрифт. "
                                    "Верни строго JSON без markdown и пояснений: "
                                    '{"primary_color": "#RRGGBB", '
                                    '"font": "Inter" | "Roboto" | "PT Sans" | "Montserrat", '
                                    '"header_variant": "...", "hero_variant": "...", "footer_variant": "...", '
                                    '"sections": [{"type": "...", "variant": "..."}, ...]}'
                                ),
                            },
                            {
                                "role": "user",
                                "content": (
                                    f"Тип сайта: {brief.site_type.value}\nПресет настроения: {brief.style.value}\n"
                                    f"Бренд: {brief.brand_name}\nЧем занимается: {brief.description}\n"
                                    f"Цель сайта: {brief.goal.value}"
                                ),
                            },
                        ],
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            # Сбой сети/лимитов/невалидный JSON — откатываемся на детерминированный
            # фолбэк, чтобы один упавший провайдер не ломал всю генерацию.
            return None


class KandinskyImageGenerator:
    """Kandinsky 3.0 — генерация изображений для блоков."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.kandinsky_api_key

    async def generate_image(self, prompt: str) -> str:
        if self.mock:
            return self._mock_image(prompt)
        return await self._call_real_api(prompt)

    async def _call_real_api(self, prompt: str) -> str:  # pragma: no cover — требует ключ
        # Реальный вызов Fusion Brain API (Kandinsky 3.0): создать задачу генерации,
        # дождаться результата, залить base64-картинку в S3 через storage-сервис
        # и вернуть публичный URL.
        raise NotImplementedError("Подключите KANDINSKY_API_KEY для реальной генерации")

    @staticmethod
    def _mock_image(prompt: str) -> str:
        seed = hashlib.sha1(prompt.encode("utf-8")).hexdigest()[:10]
        return f"https://picsum.photos/seed/{seed}/1200/800"


_CHAT_SYSTEM_PROMPT = (
    "Ты редактор JSON-схемы сайта в AI-конструкторе. Тебе дают текущую схему сайта "
    '(поле "site") и команду пользователя на естественном языке (поле "command"). '
    "Внеси в схему ровно те изменения, которые просит пользователь — меняй текст, "
    "переставляй/удаляй/добавляй блоки, меняй variant, sticky, цвета темы (theme.primary_color), "
    "шрифт (theme.font), порядок секций и т.д. — но не трогай остальное без необходимости.\n\n"
    "Строгие правила:\n"
    '- Верни строго JSON без markdown: {"site": <полная обновлённая схема той же '
    'структуры, что и во входном "site">, "reply": "<короткий ответ на русском, '
    'одно предложение, что именно сделано>"}.\n'
    "- Не добавляй ключи, которых не было в схеме, не удаляй обязательные поля "
    '(id и type у каждой секции, id страницы), не меняй project_id.\n'
    "- variant у секции должен быть одним из допустимых для её type (см. библиотеку ниже). "
    "У text_image своя ось — image_position: left|right, variant у него нет.\n"
    "- Если просят добавить новый блок — бери тип только из библиотеки ниже и придумай новый "
    "уникальный id (например grid_3col-2).\n"
    "- Если просьба не имеет смысла для сайта или невозможна — верни site БЕЗ ИЗМЕНЕНИЙ "
    "(тот же JSON, что получил) и объясни в reply, что не можешь это сделать.\n\n"
    f"Библиотека блоков и допустимых вариантов: {json.dumps(SECTION_VARIANTS, ensure_ascii=False)}"
)


class AIChatEditor:
    """Обработчик команд вкладки «ИИ-Чат» (ТЗ п.4). Сначала пробует быстрый
    бесплатный rule-based разбор (chat_commands.py) для типовых формулировок
    из ТЗ; если он не смог распознать команду и задан OPENAI_API_KEY —
    отправляет GPT-4o всю текущую JSON-схему сайта и просьбу пользователя,
    просит вернуть обновлённую схему целиком. Результат в любом случае
    проходит parse_site() — DoD п.2 гарантирован независимо от источника правки.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.openai_api_key

    async def apply_command(self, site: SiteSchema, message: str) -> tuple[SiteSchema, str, bool]:
        updated, reply, applied = apply_chat_command(site, message)
        if applied or self.mock:
            return updated, reply, applied

        raw = await self._call_real_api(site, message)
        if raw is None or not isinstance(raw.get("site"), dict):
            return site, "Не удалось выполнить команду. Попробуйте переформулировать.", False

        try:
            new_site = parse_site(raw["site"])
        except Exception:
            # Модель вернула JSON, не соответствующий схеме сайта — не сохраняем его.
            return site, "Не удалось применить изменения — попробуйте переформулировать команду.", False

        changed = new_site.model_dump() != site.model_dump()
        reply_text = raw.get("reply") or ("Готово." if changed else "Не удалось понять, что нужно изменить.")
        return new_site, reply_text, changed

    async def _call_real_api(self, site: SiteSchema, message: str) -> dict | None:  # pragma: no cover — требует ключ
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.settings.openai_api_key}"},
                    json={
                        "model": self.settings.openai_model,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": _CHAT_SYSTEM_PROMPT},
                            {
                                "role": "user",
                                "content": json.dumps(
                                    {"site": site.model_dump(), "command": message}, ensure_ascii=False
                                ),
                            },
                        ],
                    },
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            return None


def random_avatar_seed() -> str:
    return str(random.randint(1, 10_000))
