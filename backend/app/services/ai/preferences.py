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
    "bold": {"radius": "soft", "density": "airy", "container_width": "wide", "heading_style": "plain", "button_style": "solid", "section_divider": "line"},
    "warm": {"radius": "round", "density": "airy", "container_width": "normal", "heading_style": "plain", "button_style": "pill", "section_divider": "none"},
}
HERO_VARIANTS = {"minimal": "minimal", "editorial": "split", "bold": "overlay", "warm": "split"}

# Art direction applies to the entire page, not just its first screen.
SECTION_PALETTES = {
    "minimal": {"header": "minimal", "footer": "minimal", "grid_3col": "minimal_list", "pricing": "minimal", "testimonials": "single_featured", "gallery": "grid", "faq": "plain", "stats": "row", "text_image": "standard", "lead_form": "inline", "contact_map": "centered", "catalog_filter": "grid"},
    "editorial": {"header": "split", "footer": "columns", "grid_3col": "icon_rows", "pricing": "table", "testimonials": "quotes", "gallery": "masonry", "faq": "two_columns", "stats": "big_numbers", "text_image": "overlap", "lead_form": "split", "contact_map": "split", "catalog_filter": "showcase"},
    "bold": {"header": "standard", "footer": "columns", "grid_3col": "cards", "pricing": "highlight", "testimonials": "single_featured", "gallery": "slider", "faq": "accordion", "stats": "big_numbers", "text_image": "overlap", "lead_form": "card", "contact_map": "split", "catalog_filter": "showcase"},
    "warm": {"header": "centered", "footer": "simple", "grid_3col": "icon_top", "pricing": "cards", "testimonials": "quotes", "gallery": "masonry", "faq": "accordion", "stats": "row", "text_image": "card", "lead_form": "split", "contact_map": "cards", "catalog_filter": "grid"},
}


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
    palette = SECTION_PALETTES.get(direction, {})
    if palette:
        layout["header_variant"] = palette["header"]
        layout["footer_variant"] = palette["footer"]
        for section in layout["sections"]:
            if section["type"] in palette:
                section["variant"] = palette[section["type"]]
    # Keep the story first and conversion last. Manual ordering is applied later.
    closing = {"faq": 1, "lead_form": 2, "contact_map": 3}
    layout["sections"].sort(key=lambda section: closing.get(section["type"], 0))
    return layout
