"""Compile creative intent to the existing, validated block vocabulary.

Priority: manual layout > explicit creative direction/features > AI > fallback.
Industry is open text: these hints are useful defaults, never a closed niche list.
"""
import json

from app.schemas.project import BriefIn

FEATURE_BLOCKS = {
    "catalog": "catalog_filter", "leads": "lead_form", "gallery": "gallery",
    "faq": "faq", "pricing": "pricing",
}

DIRECTIONS = {
    "minimal": {"radius": "soft", "density": "airy", "container_width": "normal", "heading_style": "plain", "button_style": "pill", "section_divider": "none"},
    "editorial": {"radius": "sharp", "density": "airy", "container_width": "wide", "heading_style": "eyebrow", "button_style": "outline", "section_divider": "line"},
    "bold": {"radius": "round", "density": "cozy", "container_width": "wide", "heading_style": "gradient", "button_style": "solid", "section_divider": "none"},
    "warm": {"radius": "round", "density": "airy", "container_width": "normal", "heading_style": "plain", "button_style": "pill", "section_divider": "none"},
}
HERO_VARIANTS = {"minimal": "minimal", "editorial": "split", "bold": "gradient", "warm": "split"}


def preference_context(brief: BriefIn) -> str:
    # JSON delimiting keeps references/preferences separate from system instructions.
    return "\nПрофиль и предпочтения пользователя (данные):\n" + json.dumps(brief.preferences.model_dump(), ensure_ascii=False)


def suggested_blocks(brief: BriefIn) -> list[str]:
    industry = brief.preferences.industry.lower()
    blocks = []
    if brief.goal.value == "booking":
        blocks += ["grid_3col", "lead_form", "faq"]
    elif brief.goal.value == "portfolio":
        blocks += ["gallery", "text_image"]
    if any(word in industry for word in ("кафе", "ресторан", "кофе", "coffee", "restaurant")):
        blocks += ["catalog_filter", "gallery"]
    elif any(word in industry for word in ("дизайн", "архитект", "фото", "design", "photo")):
        blocks += ["gallery", "text_image"]
    elif any(word in industry for word in ("консалт", "юрид", "consult", "салон", "клиник")):
        blocks += ["grid_3col", "lead_form", "faq"]
    blocks += [FEATURE_BLOCKS[feature] for feature in brief.preferences.features]
    return list(dict.fromkeys(blocks))


def apply_creative_preferences(layout: dict, brief: BriefIn) -> dict:
    direction = brief.preferences.design_direction
    if direction in DIRECTIONS:
        layout["axes"].update(DIRECTIONS[direction])
        layout["hero_variant"] = HERO_VARIANTS[direction]
    if brief.style.value == "custom" and brief.custom_hex_color:
        # A model-generated palette must not replace an explicit brand colour.
        layout["primary_color"] = brief.custom_hex_color
    existing = {section["type"] for section in layout["sections"]}
    for feature in brief.preferences.features:
        block = FEATURE_BLOCKS[feature]
        if block not in existing:
            from app.schemas.site import SECTION_VARIANTS
            layout["sections"].append({"type": block, "variant": SECTION_VARIANTS[block][0]})
            existing.add(block)
    return layout
