"""Общий словарь «русское ключевое слово -> тип блока» — используется и
rule-based парсером чата (chat_commands.py, для swap/delete-button команд), и
YandexLayoutEngine._fallback_layout (чтобы brief.extra_requirements влиял на
подбор блоков даже без реального вызова YandexGPT). Один источник правды вместо
двух копий, которые бы неизбежно разошлись при добавлении нового типа блока.
"""
from __future__ import annotations

RU_NAME_TO_TYPE: dict[str, str] = {
    "шапк": "header",
    "герой": "hero",
    "услуг": "grid_3col",
    "цен": "pricing",
    "тариф": "pricing",
    "отзыв": "testimonials",
    "контакт": "contact_map",
    "карт": "contact_map",
    "футер": "footer",
    "подвал": "footer",
    "о нас": "text_image",
    "фильтр": "catalog_filter",
    "катало": "catalog_filter",
    "вопрос": "faq",
    "faq": "faq",
    "галере": "gallery",
    "портфолио": "gallery",
    "статистик": "stats",
    "цифр": "stats",
    "заявк": "lead_form",
    # Намеренно НЕ "форм": эта подстрока сидит внутри «информация»/«информируем»
    # и ловила бы каждое второе описание бизнеса как просьбу добавить форму.
    "форма обратной связи": "lead_form",
    "обратной связи": "lead_form",
    "перезвон": "lead_form",
    "консультац": "lead_form",
}


def match_type_in_text(text: str) -> str | None:
    for keyword, section_type in RU_NAME_TO_TYPE.items():
        if keyword in text:
            return section_type
    return None
