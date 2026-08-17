# AI-Конструктор сайтов

Fullstack-платформа: FastAPI-бэкенд + единый ИИ-оркестратор (YandexGPT для текста/состава блоков, YandexART для изображений, с mock-режимом для локальной разработки без ключей) + Vue/Nuxt 4-стек фронтенда — универсальная админка и настоящая статическая сборка сгенерированных сайтов (не склейка HTML-строк).

## Структура

```
backend/        FastAPI, SQLAlchemy, Alembic, ИИ-оркестратор (YandexGPT/YandexART), WebSocket-стриминг генерации,
                приём заявок с опубликованных сайтов, деплой в GitHub
site-blocks/    Общая библиотека Vue-блоков сайта (Nuxt layer, без своего package.json) — header/hero/text_image/
                grid_3col/pricing/testimonials/contact_map/footer/catalog_filter/faq/gallery/stats/lead_form/
                custom_content, по 3-6 вариантов вёрстки у каждого + корзина, модалка заявки, счётчики аналитики
site-renderer/  Nuxt 4-приложение: собирает конкретный SiteSchema (JSON) в полностью статический сайт (`nuxi generate`)
site-builder/   Маленький HTTP-микросервис (Express): принимает SiteSchema от backend, гоняет site-renderer, отдаёт билд
admin-panel/    Nuxt 4 SPA — универсальная админка: воронка генерации, редактор с live-превью/DnD/ИИ-чатом,
                настройки, заявки и заказы, деплой в Git
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

> Правки в `site-blocks/` и `site-renderer/` **не** подхватываются на лету: эти каталоги вкомпилированы в образ `site-builder` (см. его Dockerfile). После них нужен `docker compose build site-builder && docker compose up -d site-builder`, иначе опубликованный сайт соберётся старой версией блоков. Админка и бэкенд смонтированы томами и перечитывают код сами.

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
- **YandexGPT** пишет тексты сайта (hero/услуги/цены/отзывы/футер) под конкретный бриф и подбирает состав/порядок блоков, вариант вёрстки каждого блока, акцентный цвет, шрифт и оси вёрстки под задачу пользователя.
- **YandexART** генерирует изображения для hero/text_image-блоков (баннеры, иллюстрации) прямо из редактора — с дневным лимитом по тарифу.

Оба вызова защищены фолбэком на mock-результат при невалидном ответе модели — не роняют всю генерацию (см. `app/services/ai/providers.py`).

## Что реализовано

### Генерация и вариативность

- Воронка из 4 экранов (тип → настроение → бриф → **структура**) → WebSocket-стриминг генерации (`/ws/generate`) с прогрессом 1/4…4/4 и REST-фолбэком
- Экран «Структура» (необязательный): вручную выбрать блоки, их порядок и вариант вёрстки каждого — или отдать всё ИИ
- **Оси вёрстки темы** (`Theme.radius/density/container_width/heading_style/button_style/section_divider`) — сквозные параметры, меняющие пропорции и характер всех блоков сразу. Реализованы CSS-переменными и классами на `<html>` (`site-blocks/composables/useSiteTheme.ts` + `assets/tokens.css`), новых компонентов не требуют
- Состав блоков в фолбэке/mock-режиме подбирается **подмножеством** пула по хэшу брифа (`_seeded_subset`) — раньше в сайт попадал весь пул целиком, и все сайты одного типа выходили одинаковыми
- Строгая JSON-схема сайта (не HTML) с Pydantic-валидатором на бэкенде и зеркальным TS-контрактом на фронте (`site-blocks/types/site.ts`)
- **Настоящая статическая сборка**: `site-builder` гоняет `nuxi generate` на реальном Nuxt-приложении (`site-renderer`), использующем ту же библиотеку блоков, что и live-превью в редакторе — не HTML-строки

### Коммерция: заявки и корзина

- Поле `action` у каталога и блока услуг решает поведение карточки: `none` — витрина, `lead` — «Оставить заявку» с модальной формой и контекстом товара (каталог авто/недвижимости/услуг), `cart` — «В корзину» (интернет-магазин). Это одна ось, а не три разных типа блока
- Корзина на статическом сайте: состояние в `localStorage`, иконка со счётчиком в шапке, боковая панель, изменение количества, оформление заказа формой (`site-blocks/composables/useCart.ts`)
- Блок `lead_form` (3 варианта вёрстки) + модальная форма заявки с honeypot и согласием по 152-ФЗ
- Заявки и заказы уходят на публичный эндпоинт платформы (`POST /api/v1/public/projects/{id}/leads`), видны в админке на вкладке «Заявки», и дублируются сервером в вебхук/Telegram. Из браузера во внешние каналы ничего не шлётся — иначе токен бота лежал бы в JS-бандле сайта
- Онлайн-оплата (каркас ЮKassa): сумма заказа считается **на сервере** по ценам из схемы сайта (`app/services/commerce.py`), а не берётся из тела запроса

### Аналитика и SEO опубликованного сайта

- Яндекс.Метрика (+ Вебвизор), Яндекс.Вебмастер, Google Analytics 4, Google Tag Manager, Google Search Console, VK Пиксель, top@Mail.ru и произвольный код в `<head>`/перед `</body>`
- Сниппеты вставляются официальными, 1:1 теми, что выдают сами сервисы (`site-blocks/composables/useSiteAnalytics.ts`)
- SEO: title/description/keywords, og:image, favicon, noindex
- Раньше настройки проекта передавались в сборку, но `site-builder` их игнорировал — счётчики в опубликованный сайт не попадали вообще. Теперь публичная часть настроек уезжает в `site-renderer/data/runtime.json`, а секреты (ключ ЮKassa, токен бота, адрес вебхука) в бандл не попадают (`public_site_settings`)

### Публикация и деплой

- Публикация — реальная статическая сборка и загрузка в S3-совместимое хранилище (mock без ключей, локально раздаётся через `/preview-sites`)
- **Деплой в Git** (кнопка «Деплой в Git» в редакторе), два пути от одного и того же дерева файлов:
  - `GET /projects/{id}/deploy/folder` — zip с готовой к заливке папкой: статика сайта, `.nojekyll`, `.gitignore`, workflow GitHub Pages, `site.json` и README с командами `git init`/`git push`;
  - `POST /projects/{id}/deploy/github` — создаёт репозиторий по personal access token пользователя (или обновляет существующий), заливает сборку одним коммитом через Git Data API и включает GitHub Pages. Токен нигде не сохраняется — используется в рамках одного вызова
- Экспорт кода (Бизнес-тариф) — тот же билд, упакованный в zip

### Редактор

- Nuxt 4: click-to-select/click-to-edit прямо на живом превью, DnD-перестановка и вставка блоков (`vuedraggable`), вкладки «Конструктор» / «Блоки» / «ИИ-Чат», автосейв с индикатором статуса, Ctrl+Z
- Выбор варианта вёрстки у каждого блока и осей темы прямо в «Конструкторе»
- Генерация изображений (YandexART) для hero/text_image-блоков
- ИИ-чат умеет менять и оси темы, и `action` карточек («добавь корзину», «сделай построже»)
- Настройки сайта: домены + DNS-проверка (DoH), SEO, 152-ФЗ, аналитика, корзина, доставка заявок
- Тарифные лимиты (страницы, генерации изображений/день, экспорт кода, водяной знак) — единый источник в `app/core/tariffs.py`
- Фильтр промптов на мат и SQL-инъекции (`app/services/safety.py`)

## Библиотека блоков

| Тип | Варианты вёрстки |
| --- | --- |
| `header` | standard, centered, split, minimal (+ иконка корзины) |
| `hero` | centered, split, minimal, gradient, overlay |
| `text_image` | standard, overlap, card (× позиция картинки left/right) |
| `grid_3col` | cards, icon_rows, minimal_list, icon_top, compact_grid, photo_cards |
| `pricing` | cards, highlight, table, minimal |
| `testimonials` | cards, quotes, avatars_row, single_featured |
| `contact_map` | centered, split, cards |
| `catalog_filter` | grid, list, showcase (× действие карточки: none/lead/cart, поиск) |
| `faq` | accordion, two_columns, plain |
| `gallery` | grid, masonry, slider |
| `stats` | row, cards, big_numbers |
| `lead_form` | split, card, inline |
| `custom_content` | standard, callout, columns |
| `footer` | simple, columns, minimal |

Новый тип блока — это Pydantic-модель + запись в `BLOCK_LIBRARY` (`backend/app/schemas/site.py`), зеркальный интерфейс в `site-blocks/types/site.ts`, компонент-диспетчер в `blockRegistry.ts` и редактор в `editorRegistry.ts`. Промпты ИИ строятся из реестра автоматически.

## Дальше

- S3 всё ещё заглушка — `_call_real_api`-каркас в `storage.py`
- ЮKassa для заказов реализована, но проверена только на mock-режиме (без реальных реквизитов магазина); вебхука подтверждения платежа для заказов пока нет — статус заказа не обновляется автоматически
- Заменить rule-based интерпретатор ИИ-чата на полноценный function-calling (см. комментарий в `app/services/chat_commands.py`)
- Настроить домен-регистратор для реальной проверки DNS в проде
