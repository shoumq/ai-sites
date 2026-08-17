"""Деплой сайта в git: готовая папка для самостоятельной заливки и GitHub.

Оба маршрута собирают ОДНО И ТО ЖЕ дерево файлов (см. app/services/git_export.py) —
разница только в способе доставки: zip пользователю в браузер или коммит через
GitHub REST API.

GitHub-токен принимается в теле запроса, используется в рамках одного вызова и
нигде не сохраняется: ни в БД, ни в логах, ни в ответе. Поэтому же у поля нет
GET-эндпоинта «показать сохранённый токен» — сохранять нечего.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_owned_project
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.settings import ProjectSettings
from app.schemas.site import parse_site
from app.services.git_export import (
    GitDeployError,
    build_repo_files,
    export_repo_zip,
    push_to_github,
    validate_repo_name,
)
from app.services.publish import slugify_project_name
from app.services.site_builder_client import SiteBuildError, build_site
from app.services.storage import new_build_id

router = APIRouter(prefix="/projects/{project_id}/deploy", tags=["deploy"])


class GitHubDeployIn(BaseModel):
    # Personal access token пользователя. Classic-токену нужен scope `repo`,
    # fine-grained — права Contents: read/write, Administration: read/write
    # (для создания репозитория) и Pages: read/write.
    token: str = Field(min_length=8, max_length=255)
    repo_name: str = Field(min_length=1, max_length=100)
    private: bool = False
    description: str = ""
    commit_message: str = "Обновление сайта из AI-конструктора"
    enable_pages: bool = True


class GitHubDeployOut(BaseModel):
    repo_url: str
    pages_url: str
    commit_sha: str
    files_count: int
    created: bool


async def _build_repo_files(
    project: Project, app_settings: Settings, current_user: User, repo_name: str
) -> dict[str, bytes]:
    if not project.site_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала сгенерируйте сайт.")

    site = parse_site(project.site_data)
    project_settings = ProjectSettings.model_validate(project.settings or {}).migrate_legacy()
    subdomain = slugify_project_name(project.name)

    try:
        output_dir = await build_site(
            app_settings, site, project_settings, current_user.tariff, subdomain, new_build_id()
        )
    except SiteBuildError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return build_repo_files(output_dir, site, project_settings, repo_name)


@router.get("/folder")
async def download_git_folder(
    repo_name: str = "",
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    app_settings: Settings = Depends(get_settings),
) -> Response:
    """Zip с готовой к заливке папкой репозитория: статика сайта, `.nojekyll`,
    `.gitignore`, README с командами `git init`/`git push` и workflow для
    GitHub Pages. Пользователю остаётся только придумать название репозитория."""
    name = repo_name.strip() or slugify_project_name(project.name)
    try:
        name = validate_repo_name(name)
    except GitDeployError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    files = await _build_repo_files(project, app_settings, current_user, name)
    return Response(
        content=export_repo_zip(files),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{name}.zip"'},
    )


@router.post("/github", response_model=GitHubDeployOut)
async def deploy_to_github(
    payload: GitHubDeployIn,
    project: Project = Depends(get_owned_project),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    app_settings: Settings = Depends(get_settings),
) -> GitHubDeployOut:
    try:
        repo_name = validate_repo_name(payload.repo_name)
    except GitDeployError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    files = await _build_repo_files(project, app_settings, current_user, repo_name)

    try:
        result = await push_to_github(
            payload.token,
            repo_name,
            files,
            private=payload.private,
            description=payload.description or f"Сайт «{project.name}», собран в AI-конструкторе",
            commit_message=payload.commit_message,
            enable_pages=payload.enable_pages,
        )
    except GitDeployError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    # Ссылку на GitHub Pages считаем публикацией проекта — она реально
    # работающая, в отличие от mock-поддомена без S3/DNS.
    if result["pages_url"]:
        project.published_url = result["pages_url"]
        project.status = ProjectStatus.published
        await db.commit()

    return GitHubDeployOut(
        repo_url=result["repo_url"],
        pages_url=result["pages_url"],
        commit_sha=result["commit_sha"],
        files_count=int(result["files_count"]),
        created=result["created"] == "1",
    )
