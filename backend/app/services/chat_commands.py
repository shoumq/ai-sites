"""Правки JSON-схемы сайта командами ИИ-чата без перегенерации всего сайта
(ТЗ п.4, вкладка 3). MVP использует rule-based разбор для ключевых сценариев
из ТЗ (липкая шапка, перестановка блоков, удаление кнопки); в продакшене этот
слой заменяется вызовом GPT-4o с function-calling, эмитирующим ту же JSON
patch-структуру. В обоих случаях результат обязан пройти parse_site() —
это и есть валидатор из DoD п.2, гарантирующий, что схема не ломается.
"""
from __future__ import annotations

from app.schemas.site import SiteSchema, parse_site
from app.services.block_keywords import RU_NAME_TO_TYPE, match_type_in_text


def _find_section(site: SiteSchema, section_type: str, page_index: int = 0) -> int | None:
    page = site.pages[page_index]
    for i, section in enumerate(page.sections):
        if section.type == section_type:
            return i
    return None


def apply_chat_command(site: SiteSchema, message: str) -> tuple[SiteSchema, str, bool]:
    """Возвращает (обновлённая_схема, ответ_ассистента, применено_ли_изменение)."""
    text = message.strip().lower()
    data = site.model_dump()
    page = data["pages"][0]
    sections = page["sections"]

    # 1. Липкая шапка
    if "шапк" in text and ("липк" in text or "прилип" in text or "sticky" in text):
        make_sticky = not ("убер" in text or "не " in text or "откреп" in text)
        for section in sections:
            if section["type"] == "header":
                section["sticky"] = make_sticky
                reply = "Шапка теперь прилипает к верху при прокрутке." if make_sticky else "Шапка больше не липкая."
                return parse_site(data), reply, True

    # 2. Поменять местами два блока: «поменяй местами блоки "Отзывы" и "Цены"»
    if "помен" in text and "мест" in text:
        found_types: list[str] = []
        for keyword, section_type in RU_NAME_TO_TYPE.items():
            if keyword in text and section_type not in found_types:
                found_types.append(section_type)
        if len(found_types) >= 2:
            idx_a = next((i for i, s in enumerate(sections) if s["type"] == found_types[0]), None)
            idx_b = next((i for i, s in enumerate(sections) if s["type"] == found_types[1]), None)
            if idx_a is not None and idx_b is not None:
                sections[idx_a], sections[idx_b] = sections[idx_b], sections[idx_a]
                return parse_site(data), "Готово, блоки поменяны местами.", True
        return site, "Не удалось распознать оба блока для перестановки. Укажите их точные названия.", False

    # 3. Удалить кнопку в блоке
    if "удали" in text and "кнопк" in text:
        target_type = match_type_in_text(text)
        cta_fields = {"header": "cta_text", "hero": "cta_text", "grid_3col": "cta_text"}
        if target_type and target_type in cta_fields:
            for section in sections:
                if section["type"] == target_type:
                    section[cta_fields[target_type]] = ""
                    return parse_site(data), "Кнопка удалена.", True
        return site, "Не нашёл кнопку в указанном блоке.", False

    return site, (
        "Не удалось распознать команду. Попробуйте, например: «Сделай шапку липкой» "
        "или «Поменяй местами блоки Отзывы и Цены»."
    ), False
