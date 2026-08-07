# AI-Конструктор сайтов

Fullstack-скелет по ТЗ: React 18 + TS + Redux Toolkit (frontend), FastAPI (backend), PostgreSQL + Redis, единый AI-оркестратор (OpenAI / DeepSeek-Coder / Kandinsky 3.0) с mock-режимом для локальной разработки без ключей.

## Структура

```
backend/    FastAPI, SQLAlchemy, Alembic, AI-оркестратор, WebSocket-стриминг генерации
frontend/   Vite + React 18 + TS + Redux Toolkit (RTK Query), редактор, воронка, DnD
docker-compose.yml   postgres + redis + backend + frontend
```

## Быстрый старт (Docker)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

Frontend: http://localhost:5173 · Backend: http://localhost:8000 · Swagger: http://localhost:8000/docs

## Быстрый старт (без Docker)

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# нужны локальные Postgres (5432) и Redis (6379), см. .env.example
alembic upgrade head
uvicorn app.main:app --reload

# frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

## Mock-режим AI

Пока в `backend/.env` не заданы `OPENAI_API_KEY` / `DEEPSEEK_API_KEY` / `KANDINSKY_API_KEY` / `YOOKASSA_SECRET_KEY` / `S3_ACCESS_KEY`, соответствующие сервисы работают в детерминированном mock-режиме (заглушки текста, `picsum.photos` вместо Kandinsky, мгновенный апгрейд тарифа вместо реального платежа ЮKassa). Это позволяет прогнать весь пайплайн — воронку, генерацию, редактор, публикацию — без единого внешнего ключа. Подставьте реальные ключи в `.env`, когда они появятся — код уже готов их использовать.

С реальными ключами `OPENAI_API_KEY` и `DEEPSEEK_API_KEY` оба провайдера действительно участвуют в генерации:
- **OpenAI (GPT-4o)** пишет тексты (hero/услуги/цены/отзывы/футер) под конкретный бриф.
- **DeepSeek** (`deepseek-v4-flash` по умолчанию — старые алиасы `deepseek-chat`/`deepseek-coder` в API DeepSeek больше не работают) выбирает состав и порядок блоков страницы из библиотеки React-компонентов (`text_image`/`grid_3col`/`pricing`/`testimonials`/`contact_map` — header/hero/footer фиксированы) плюс акцентный цвет и шрифт под задачу пользователя, а не по жёсткому пресету.

Оба вызова защищены фолбэком: невалидный JSON, сетевая ошибка или лишние/отсутствующие поля в ответе модели откатываются на детерминированный mock-результат для этого конкретного поля, а не роняют всю генерацию (см. `_coerce_copy` в `OpenAICopywriter` и `_sanitize_sections` в `DeepSeekLayoutEngine`, `app/services/ai/providers.py`).

## Что реализовано

- Воронка из 3 экранов → WebSocket-стриминг генерации (`/ws/generate`) с прогрессом 1/4…4/4 и REST-фолбэком (`POST /projects/generate`)
- Строгая JSON-схема сайта (не HTML) с Pydantic-валидатором, переиспользуемым и генератором, и ИИ-чат-командами
- Редактор: превью с click-to-select и click-to-edit, вкладки «Конструктор» / «Блоки» (DnD через `@dnd-kit`) / «ИИ-Чат» (rule-based парсер команд: липкая шапка, перестановка блоков, удаление кнопки)
- Настройки сайта: домены + DNS-проверка (DoH), SEO, согласие по 152-ФЗ, интеграции (ЮKassa/Метрика/2ГИС/WhatsApp)
- Тарифные лимиты (страницы, генерации изображений/день, экспорт кода, водяной знак) — единый источник в `app/core/tariffs.py`
- Фильтр промптов на мат и SQL-инъекции (`app/services/safety.py`)
- Публикация — сборка статического HTML/CSS/JS и загрузка в S3-совместимое хранилище (mock без ключей)

## Дальше

- OpenAI и DeepSeek уже дают реальный результат при наличии ключей (см. выше); Kandinsky, S3 и ЮKassa всё ещё только заглушки — `_call_real_api` в `providers.py`/`storage.py`/`billing.py` дописаны как каркас под реальный вызов
- Заменить rule-based интерпретатор ИИ-чата на GPT-4o с function-calling (см. комментарий в `app/services/chat_commands.py`)
- Настроить домен-регистратор для реальной проверки DNS в проде
