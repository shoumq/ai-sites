from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    auth,
    billing,
    deploy,
    editor,
    leads,
    projects,
    public,
    publish,
    settings as settings_routes,
)
from app.core.config import get_settings
from app.ws import generate as ws_generate

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

# Публичный префикс, на который стучатся ФОРМЫ ЗАЯВОК опубликованных сайтов.
# Сайты живут на произвольных доменах (поддомен платформы, свой домен клиента,
# github.io), поэтому заранее перечислить их в cors_origins невозможно.
PUBLIC_API_PREFIX = f"{settings.api_v1_prefix}/public/"


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ВАЖЕН ПОРЯДОК: Starlette собирает стек так, что добавленный ПОСЛЕДНИМ
# middleware оказывается САМЫМ ВНЕШНИМ. Этот обработчик обязан стоять снаружи
# CORSMiddleware — иначе preflight с чужого домена до него просто не доходит:
# CORSMiddleware сам отвечает 400 «Disallowed CORS origin» на любой OPTIONS с
# origin'ом не из cors_origins, а опубликованные сайты живут именно на чужих
# доменах.
@app.middleware("http")
async def public_api_cors(request: Request, call_next):
    """Разрешает cross-origin доступ только к /api/v1/public/* и только без
    кук: `Access-Control-Allow-Origin: *` и `allow_credentials` несовместимы
    по спецификации, а этому эндпоинту куки и не нужны — он не авторизует.

    Отдельный middleware вместо расширения общего CORSMiddleware нужен именно
    поэтому: у остального API остаётся строгий список origin'ов с куками.
    """
    if not request.url.path.startswith(PUBLIC_API_PREFIX):
        return await call_next(request)

    if request.method == "OPTIONS":
        response = Response(status_code=204)
    else:
        response = await call_next(request)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Max-Age"] = "600"
    return response

# Локальный просмотр опубликованных сайтов без реального S3 (ТЗ этого захода:
# демо в Docker на машине разработчика) — раздаёт тот же build-каталог, что
# StorageClient.upload_dir читает для (mock-)заливки, см. app/services/storage.py.
if Path(settings.site_builds_dir).is_dir():
    app.mount("/preview-sites", StaticFiles(directory=settings.site_builds_dir, html=True), name="preview-sites")

# Раздаёт байты, которые StorageClient сохранил на диск в mock-режиме S3 (см.
# app/services/storage.py) — иначе сгенерированные YandexART-картинки не
# открывались бы в браузере локально без реального облака.
Path(settings.generated_media_dir).mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.generated_media_dir), name="media")

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(projects.router, prefix=settings.api_v1_prefix)
app.include_router(editor.router, prefix=settings.api_v1_prefix)
app.include_router(settings_routes.router, prefix=settings.api_v1_prefix)
app.include_router(publish.router, prefix=settings.api_v1_prefix)
app.include_router(deploy.router, prefix=settings.api_v1_prefix)
app.include_router(leads.router, prefix=settings.api_v1_prefix)
app.include_router(public.router, prefix=settings.api_v1_prefix)
app.include_router(billing.router, prefix=settings.api_v1_prefix)
app.include_router(ws_generate.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "ai_mock_mode": settings.ai_mock_mode}
