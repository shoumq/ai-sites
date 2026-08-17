"""Выгрузка готового сайта в git: zip-папка «залей сам» и деплой в GitHub.

Две ветки одного и того же результата (ТЗ этого захода — «деплой сайта»):

  * `build_repo_files()` собирает дерево файлов будущего репозитория —
    статическая сборка сайта в корне плюс `.nojekyll`, `README.md`,
    `.gitignore`, `site.json` (исходная JSON-схема) и workflow GitHub Pages;
  * `export_repo_zip()` отдаёт это дерево zip-архивом (пользователь заливает
    сам, указав только название репозитория — команды есть в README);
  * `push_to_github()` создаёт репозиторий через GitHub REST API и заливает то
    же дерево одним коммитом, после чего включает GitHub Pages.

Токен GitHub приходит в теле запроса, живёт только на время вызова и НИКОГДА
не сохраняется в БД и не пишется в логи — см. app/api/routes/deploy.py.
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import re
import zipfile
from pathlib import Path

import httpx

from app.schemas.settings import ProjectSettings
from app.schemas.site import SiteSchema

GITHUB_API = "https://api.github.com"
GITHUB_TIMEOUT = 60

# Имя репозитория идёт в URL GitHub API — сам GitHub допускает буквы, цифры,
# дефис, подчёркивание и точку.
REPO_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$")

# Сколько блобов заливаем одновременно. Больше — упираемся в secondary rate
# limit GitHub, меньше — сборка из ~60 файлов заливается заметно дольше.
BLOB_CONCURRENCY = 6


class GitDeployError(RuntimeError):
    """Ошибка деплоя, пригодная для показа пользователю (без токена внутри)."""


def validate_repo_name(name: str) -> str:
    cleaned = name.strip()
    if not REPO_NAME_RE.match(cleaned):
        raise GitDeployError(
            "Некорректное название репозитория: допустимы латинские буквы, цифры, «-», «_» и «.» (до 100 символов)."
        )
    return cleaned


def _readme(repo_name: str, site: SiteSchema, settings: ProjectSettings) -> str:
    domain = settings.domain.custom_domain or "—"
    pages = "\n".join(f"- `/{page.slug if page.slug != 'main' else ''}` — {page.title or page.slug}" for page in site.pages)
    return f"""# {repo_name}

Статический сайт, собранный в AI-конструкторе сайтов. Это готовая к раздаче
сборка: чистые HTML/CSS/JS, без серверной части и без сборочного шага.

## Страницы

{pages}

## Как залить в свой репозиторий

```bash
git init
git add .
git commit -m "init: сайт из AI-конструктора"
git branch -M main
git remote add origin https://github.com/<ваш-логин>/{repo_name}.git
git push -u origin main
```

## Как опубликовать бесплатно на GitHub Pages

1. Settings → Pages → Build and deployment → Source: **Deploy from a branch**
2. Branch: `main`, папка `/ (root)` → Save
3. Через минуту сайт будет доступен на `https://<ваш-логин>.github.io/{repo_name}/`

Файл `.nojekyll` в корне обязателен и уже добавлен: без него GitHub Pages
прогоняет содержимое через Jekyll, а тот игнорирует каталог `_nuxt/` (имена,
начинающиеся с подчёркивания) — сайт открылся бы без стилей и скриптов.

Альтернативно в репозитории лежит workflow `.github/workflows/deploy-pages.yml` —
если в Settings → Pages выбрать Source: **GitHub Actions**, публикация пойдёт
через него.

## Свой домен

Текущий домен проекта: {domain}

Для своего домена добавьте файл `CNAME` в корень репозитория с одной строкой —
вашим доменом, и пропишите у регистратора CNAME-запись на `<ваш-логин>.github.io`.

## Что где лежит

- `index.html` и остальные страницы — готовая статика
- `_nuxt/` — собранные стили и скрипты
- `site.json` — исходная JSON-схема сайта из конструктора (для повторного импорта)
"""


_GITIGNORE = """.DS_Store
Thumbs.db
node_modules/
*.log
"""

_PAGES_WORKFLOW = """# Публикация статики из корня репозитория на GitHub Pages.
# Нужен, только если в Settings -> Pages выбран Source: GitHub Actions.
# При Source: Deploy from a branch этот workflow не используется.
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
"""


def build_repo_files(
    build_dir: str,
    site: SiteSchema,
    settings: ProjectSettings,
    repo_name: str,
) -> dict[str, bytes]:
    """Дерево файлов будущего репозитория: путь относительно корня -> байты.

    Статическая сборка кладётся в корень (а не в `docs/`), потому что так
    GitHub Pages работает и через ветку, и через workflow без дополнительных
    настроек.
    """
    files: dict[str, bytes] = {}

    root = Path(build_dir)
    for path in sorted(root.rglob("*")):
        if path.is_file():
            files[path.relative_to(root).as_posix()] = path.read_bytes()

    # Без .nojekyll GitHub Pages прогоняет статику через Jekyll, а он выкидывает
    # каталоги, начинающиеся с подчёркивания — то есть весь _nuxt/ со стилями.
    files[".nojekyll"] = b""
    files[".gitignore"] = _GITIGNORE.encode("utf-8")
    files["README.md"] = _readme(repo_name, site, settings).encode("utf-8")
    files[".github/workflows/deploy-pages.yml"] = _PAGES_WORKFLOW.encode("utf-8")
    files["site.json"] = json.dumps(site.model_dump(), ensure_ascii=False, indent=2).encode("utf-8")

    if settings.domain.custom_domain:
        files["CNAME"] = f"{settings.domain.custom_domain}\n".encode("utf-8")

    return files


def export_repo_zip(files: dict[str, bytes]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for path, content in sorted(files.items()):
            zf.writestr(path, content)
    return buffer.getvalue()


# ---- GitHub REST API ---------------------------------------------------------


def _headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _api_error(response: httpx.Response, fallback: str) -> GitDeployError:
    """Сообщение об ошибке от GitHub без утечки заголовков/токена наружу."""
    try:
        message = response.json().get("message") or fallback
    except ValueError:
        message = fallback
    if response.status_code == 401:
        message = "GitHub отклонил токен (401). Проверьте, что токен действителен и не истёк."
    elif response.status_code == 403:
        message = f"GitHub отказал в доступе (403): {message}. Нужен scope `repo` (и `workflow`, если заливаете workflow)."
    return GitDeployError(f"{message}")


async def _create_repo_if_missing(
    client: httpx.AsyncClient, token: str, owner: str, repo: str, private: bool, description: str
) -> bool:
    """Создаёт репозиторий, если его ещё нет. Возвращает True, если создан."""
    existing = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=_headers(token))
    if existing.status_code == 200:
        return False
    if existing.status_code != 404:
        raise _api_error(existing, "Не удалось проверить репозиторий")

    created = await client.post(
        f"{GITHUB_API}/user/repos",
        headers=_headers(token),
        json={
            "name": repo,
            "private": private,
            "description": description[:350],
            # auto_init=False — репозиторий создаётся пустым, чтобы первый же
            # коммит был нашим и без лишнего merge-конфликта с чужим README.
            "auto_init": False,
        },
    )
    if created.status_code not in (200, 201):
        raise _api_error(created, "Не удалось создать репозиторий")
    return True


async def _upload_blobs(client: httpx.AsyncClient, token: str, owner: str, repo: str, files: dict[str, bytes]) -> list[dict]:
    semaphore = asyncio.Semaphore(BLOB_CONCURRENCY)

    async def upload(path: str, content: bytes) -> dict:
        async with semaphore:
            response = await client.post(
                f"{GITHUB_API}/repos/{owner}/{repo}/git/blobs",
                headers=_headers(token),
                json={"content": base64.b64encode(content).decode("ascii"), "encoding": "base64"},
            )
            if response.status_code not in (200, 201):
                raise _api_error(response, f"Не удалось загрузить файл {path}")
            return {"path": path, "mode": "100644", "type": "blob", "sha": response.json()["sha"]}

    return list(await asyncio.gather(*(upload(path, content) for path, content in sorted(files.items()))))


async def _enable_pages(client: httpx.AsyncClient, token: str, owner: str, repo: str, branch: str) -> str:
    """Включает GitHub Pages из корня ветки. Возвращает URL сайта или пустую
    строку — Pages может быть недоступен (приватный репозиторий на бесплатном
    тарифе), и это не повод считать весь деплой неудачным."""
    response = await client.post(
        f"{GITHUB_API}/repos/{owner}/{repo}/pages",
        headers=_headers(token),
        json={"source": {"branch": branch, "path": "/"}},
    )
    if response.status_code in (200, 201):
        return response.json().get("html_url", "")
    if response.status_code == 409:  # Pages уже включены
        current = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/pages", headers=_headers(token))
        if current.status_code == 200:
            return current.json().get("html_url", "")
    return ""


async def push_to_github(
    token: str,
    repo_name: str,
    files: dict[str, bytes],
    *,
    private: bool = False,
    description: str = "",
    commit_message: str = "Обновление сайта из AI-конструктора",
    branch: str = "main",
    enable_pages: bool = True,
) -> dict[str, str]:
    """Создаёт (при необходимости) репозиторий и заливает в него всё дерево
    одним коммитом через Git Data API.

    Повторный деплой в тот же репозиторий поддержан: если ветка уже есть, её
    текущий коммит становится родителем нового, и ref переставляется вперёд —
    история не теряется и force-push не нужен.
    """
    repo = validate_repo_name(repo_name)

    async with httpx.AsyncClient(timeout=GITHUB_TIMEOUT) as client:
        me = await client.get(f"{GITHUB_API}/user", headers=_headers(token))
        if me.status_code != 200:
            raise _api_error(me, "Не удалось получить данные пользователя GitHub")
        owner = me.json()["login"]

        created = await _create_repo_if_missing(client, token, owner, repo, private, description)

        # Родительский коммит: у только что созданного пустого репозитория его
        # нет, у существующего — головной коммит ветки.
        parents: list[str] = []
        ref_exists = False
        if not created:
            ref = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/git/ref/heads/{branch}", headers=_headers(token))
            if ref.status_code == 200:
                ref_exists = True
                parents = [ref.json()["object"]["sha"]]

        tree_entries = await _upload_blobs(client, token, owner, repo, files)

        tree_payload: dict = {"tree": tree_entries}
        # base_tree намеренно НЕ передаём: дерево должно стать ровно таким, как
        # в новой сборке, иначе удалённые в новой версии файлы остались бы в репо.
        tree = await client.post(f"{GITHUB_API}/repos/{owner}/{repo}/git/trees", headers=_headers(token), json=tree_payload)
        if tree.status_code not in (200, 201):
            raise _api_error(tree, "Не удалось создать дерево файлов")

        commit = await client.post(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/commits",
            headers=_headers(token),
            json={"message": commit_message, "tree": tree.json()["sha"], "parents": parents},
        )
        if commit.status_code not in (200, 201):
            raise _api_error(commit, "Не удалось создать коммит")
        commit_sha = commit.json()["sha"]

        if ref_exists:
            ref_response = await client.patch(
                f"{GITHUB_API}/repos/{owner}/{repo}/git/refs/heads/{branch}",
                headers=_headers(token),
                json={"sha": commit_sha, "force": False},
            )
        else:
            ref_response = await client.post(
                f"{GITHUB_API}/repos/{owner}/{repo}/git/refs",
                headers=_headers(token),
                json={"ref": f"refs/heads/{branch}", "sha": commit_sha},
            )
        if ref_response.status_code not in (200, 201):
            raise _api_error(ref_response, "Не удалось обновить ветку")

        pages_url = ""
        if enable_pages and not private:
            pages_url = await _enable_pages(client, token, owner, repo, branch)

        return {
            "repo_url": f"https://github.com/{owner}/{repo}",
            "pages_url": pages_url,
            "commit_sha": commit_sha,
            "files_count": str(len(files)),
            "created": "1" if created else "0",
        }
