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
    "показател": "stats",
    "метрик": "stats",
    "заявк": "lead_form",
    # Намеренно НЕ "форм": эта подстрока сидит внутри «информация»/«информируем»
    # и ловила бы каждое второе описание бизнеса как просьбу добавить форму.
    "форма обратной связи": "lead_form",
    "обратной связи": "lead_form",
    "перезвон": "lead_form",
    "консультац": "lead_form",
    "песочниц": "sandbox",
    "свободный блок": "sandbox",
    "свободную секцию": "sandbox",
}


def match_types_in_text(text: str) -> list[str]:
    """Возвращает ВСЕ упомянутые типы в порядке первого появления.

    Старый match_type_in_text намеренно оставлен для одиночных chat-команд,
    а генератор брифа использует эту функцию: пожелание «фильтр, статистика и
    FAQ» больше не схлопывается до одного первого совпадения.
    """
    matches: list[tuple[int, str]] = []
    for keyword, section_type in RU_NAME_TO_TYPE.items():
        position = text.find(keyword)
        if position >= 0:
            matches.append((position, section_type))
    result: list[str] = []
    for _, section_type in sorted(matches, key=lambda pair: pair[0]):
        if section_type not in result:
            result.append(section_type)
    return result


def match_type_in_text(text: str) -> str | None:
    matched = match_types_in_text(text)
    return matched[0] if matched else None
