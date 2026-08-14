"""Интроспекция Pydantic-моделей секций (backend/app/schemas/site.py) в
JSON-shape-текст для промптов YandexGPT. Единая точка, которую используют
YandexCopywriter, YandexLayoutEngine и AIChatEditor (app/services/ai/providers.py) —
без неё каждый новый тип блока в BLOCK_LIBRARY требовал бы ручного дублирования
описания его полей в трёх промптах отдельно.
"""
from __future__ import annotations

from typing import Literal, get_args, get_origin

from pydantic import BaseModel

# Поля, которые ИИ не должен ни видеть, ни заполнять сам — id генерируется/
# сохраняется отдельно, type/variant выбирает YandexLayoutEngine, bg_color
# правится только точечно через ИИ-чат по явной просьбе.
EXCLUDED_FIELDS = {"id", "type", "variant", "bg_color"}

_PY_TYPE_NAMES = {str: "str", bool: "bool", int: "int", float: "float"}


def _describe_type(annotation: object) -> str:
    origin = get_origin(annotation)
    if origin is list:
        (item,) = get_args(annotation)
        if isinstance(item, type) and issubclass(item, BaseModel):
            return f"[{_describe_model_inline(item)}, ...]"
        return f"[{_describe_type(item)}, ...]"
    if origin is Literal:
        return "str"
    if origin is not None:
        # Union/Optional и подобное — берём первый значимый (не-None) аргумент.
        args = [a for a in get_args(annotation) if a is not type(None)]
        return _describe_type(args[0]) if args else "str"
    return _PY_TYPE_NAMES.get(annotation, "str")


def _describe_model_inline(model: type[BaseModel]) -> str:
    parts = [f'"{name}": {_describe_type(field.annotation)}' for name, field in model.model_fields.items()]
    return "{" + ", ".join(parts) + "}"


def describe_block_fields(model: type[BaseModel]) -> str:
    """Возвращает JSON-shape-строку вида `{"title": str, "items": [{"name": str, ...}, ...]}`
    по полям модели секции, исключая служебные (см. EXCLUDED_FIELDS)."""
    parts = [
        f'"{name}": {_describe_type(field.annotation)}'
        for name, field in model.model_fields.items()
        if name not in EXCLUDED_FIELDS
    ]
    return "{" + ", ".join(parts) + "}"
