from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, billing, editor, projects, publish, settings as settings_routes
from app.core.config import get_settings
from app.ws import generate as ws_generate

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Локальный просмотр опубликованных сайтов без реального S3 (ТЗ этого захода:
# демо в Docker на машине разработчика) — раздаёт тот же build-каталог, что
# StorageClient.upload_dir читает для (mock-)заливки, см. app/services/storage.py.
if Path(settings.site_builds_dir).is_dir():
    app.mount("/preview-sites", StaticFiles(directory=settings.site_builds_dir, html=True), name="preview-sites")

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(projects.router, prefix=settings.api_v1_prefix)
app.include_router(editor.router, prefix=settings.api_v1_prefix)
app.include_router(settings_routes.router, prefix=settings.api_v1_prefix)
app.include_router(publish.router, prefix=settings.api_v1_prefix)
app.include_router(billing.router, prefix=settings.api_v1_prefix)
app.include_router(ws_generate.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "ai_mock_mode": settings.ai_mock_mode}
