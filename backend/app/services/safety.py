"""Фильтрация пользовательских промптов на мат и SQL-инъекции (DoD п.4).

Это базовый защитный слой перед тем, как текст пользователя попадёт в промпт
AI-провайдера или в чат-команду редактора. Не заменяет параметризованные
запросы к БД (SQLAlchemy ORM уже исключает SQLi на уровне БД) — здесь цель
отфильтровать откровенно вредоносный/оскорбительный ввод до отправки в LLM.
"""
from __future__ import annotations

import re

# Корни намеренно узкие. Широкие вроде r"\bбл[яе]\w*" ловят обычные слова
# («блеск», «блестящий», «блендер»), а бриф с таким словом просто не проходит
# генерацию — пользователь видит «текст содержит нецензурную лексику» на
# описании кофейни или магазина техники. Лучше пропустить пару обфускаций,
# чем блокировать нормальные тексты.
_PROFANITY_PATTERNS = [
    r"\bху[йё]\w*",
    r"\bху[яе](?![а-яё])",
    r"\bбляд\w*",
    r"\bбля(?![а-яё])",
    r"\bеб[аёе][тнл]\w*",
    r"\bпизд\w*",
    r"\bсук[аи](?![а-яё])",
]

_SQLI_PATTERNS = [
    r"\bunion\s+select\b",
    r"\bdrop\s+table\b",
    r"\bor\s+1\s*=\s*1\b",
    r"--\s*$",
    r";\s*--",
    r"\bxp_cmdshell\b",
]

_PROFANITY_RE = re.compile("|".join(_PROFANITY_PATTERNS))
_SQLI_RE = re.compile("|".join(_SQLI_PATTERNS), re.IGNORECASE)


class UnsafeInputError(ValueError):
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)


def assert_safe_prompt(text: str) -> None:
    if _SQLI_RE.search(text):
        raise UnsafeInputError("Обнаружена потенциальная SQL-инъекция во входных данных.")
    if _PROFANITY_RE.search(text.lower()):
        raise UnsafeInputError("Текст содержит нецензурную лексику — измените формулировку.")
