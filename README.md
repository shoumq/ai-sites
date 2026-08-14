# AI-Конструктор сайтов

Fullstack-платформа: FastAPI-бэкенд + единый ИИ-оркестратор (YandexGPT для текста/состава блоков, YandexART для изображений, с mock-режимом для локальной разработки без ключей) + Vue/Nuxt 4-стек фронтенда — универсальная админка и настоящая статическая сборка сгенерированных сайтов (не склейка HTML-строк).

## Структура

```
backend/        FastAPI, SQLAlchemy, Alembic, ИИ-оркестратор (YandexGPT/YandexART), WebSocket-стриминг генерации
site-blocks/    Общая библиотека Vue-блоков сайта (Nuxt layer, без своего package.json) — header/hero/text_image/
                grid_3col/pricing/testimonials/contact_map/footer, по несколько вариантов вёрстки каждый
site-renderer/  Nuxt 4-приложение: собирает конкретный SiteSchema (JSON) в полностью статический сайт (`nuxi generate`)
site-builder/   Маленький HTTP-микросервис (Express): принимает SiteSchema от backend, гоняет site-renderer, отдаёт билд
admin-panel/    Nuxt 4 SPA — универсальная админка: воронка генерации, редактор с live-превью/DnD/ИИ-чатом, настройки
docker-compose.yml   postgres + redis + backend + site-builder + admin-panel
```

Раньше был React+Vite фронтенд (`frontend/`) со склейкой HTML f-строками при публикации — заменён на настоящий Vue-рендеринг: один и тот же набор Vue-компонентов (`site-blocks`) рендерит и live-превью в редакторе, и финальный статический сайт.

## Быстрый старт (Docker)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Админка: http://localhost:3000 · Backend: http://localhost:8000 · Swagger: http://localhost:8000/docs · site-builder: http://localhost:4000/health

Опубликованные (mock-режим, без реального S3/DNS) сайты открываются прямо на бэкенде: `http://localhost:8000/preview-sites/{subdomain}/{build_id}/`.

## Быстрый старт (без Docker)

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# нужны локальные Postgres (5432) и Redis (6379), см. .env.example
alembic upgrade head
uvicorn app.main:app --reload

# site-builder (в другом терминале) — нужен для генерации/публикации сайтов
cd site-builder
npm install
BUILDS_DIR=./builds npm start

# admin-panel (в третьем терминале)
cd admin-panel
npm install
npm run dev
```

> Node 22+ обязателен для `site-renderer`/`site-builder`/`admin-panel`: прод-сборка Nuxt 4 использует `Set.prototype.isSubsetOf` (через cssnano) — этого метода нет в Node 20, сборка падает с `isSubsetOf is not a function`. Все Dockerfile’ы уже на `node:22-slim`.

## Mock-режим ИИ

Пока в `backend/.env` не задан `YANDEX_API_KEY` (+ `YANDEX_FOLDER_ID`), генерация текста/состава блоков/изображений работает в детерминированном mock-режиме (заглушки текста, градиентные заглушки вместо картинок) — весь пайплайн (воронка → генерация → редактор → публикация) прогоняется без единого внешнего ключа.

С реальным ключом (Yandex AI Studio, aistudio.yandex.ru — есть бесплатный грант для новых аккаунтов):
- **YandexGPT** пишет тексты сайта (hero/услуги/цены/отзывы/футер) под конкретный бриф и подбирает состав/порядок блоков + акцентный цвет и шрифт под задачу пользователя.
- **YandexART** генерирует изображения для hero/text_image-блоков (баннеры, иллюстрации) прямо из редактора — с дневным лимитом по тарифу.

Оба вызова защищены фолбэком на mock-результат при невалидном ответе модели — не роняют всю генерацию (см. `app/services/ai/providers.py`).

## Что реализовано

- Воронка из 3 экранов → WebSocket-стриминг генерации (`/ws/generate`) с прогрессом 1/4…4/4 и REST-фолбэком
- Строгая JSON-схема сайта (не HTML) с Pydantic-валидатором на бэкенде и зеркальным TS-контрактом на фронте (`site-blocks/types/site.ts`)
- **Настоящая статическая сборка**: `site-builder` гоняет `nuxi generate` на реальном Nuxt-приложении (`site-renderer`), использующем ту же библиотеку блоков, что и live-превью в редакторе — не HTML-строки
- Редактор на Nuxt 4: click-to-select/click-to-edit прямо на живом превью, DnD-перестановка и вставка блоков (`vuedraggable`), вкладки «Конструктор» / «Блоки» / «ИИ-Чат», автосейв с индикатором статуса, Ctrl+Z
- Генерация изображений (YandexART) прямо из редактора для hero/text_image-блоков
- Настройки сайта: домены + DNS-проверка (DoH), SEO, согласие по 152-ФЗ, интеграции (ЮKassa/Метрика/2ГИС/WhatsApp)
- Тарифные лимиты (страницы, генерации изображений/день, экспорт кода, водяной знак) — единый источник в `app/core/tariffs.py`
- Фильтр промптов на мат и SQL-инъекции (`app/services/safety.py`)
- Публикация — реальная статическая сборка и загрузка в S3-совместимое хранилище (mock без ключей, локально раздаётся через `/preview-sites`); экспорт кода (Бизнес-тариф) — тот же билд, упакованный в zip

## Дальше

- YandexGPT/YandexART уже дают реальный результат при наличии ключей; S3 и ЮKassa всё ещё только заглушки — `_call_real_api`-каркас в `storage.py`/`billing.py`
- Заменить rule-based интерпретатор ИИ-чата на полноценный function-calling (см. комментарий в `app/services/chat_commands.py`)
- Настроить домен-регистратор для реальной проверки DNS в проде
