"""S3-совместимое хранилище (VK Cloud / Yandex Cloud), ТЗ п.1.

Без заданных ключей работает в mock-режиме: реально сохраняет байты на диск
в generated_media_dir (раздаётся статикой на /media, см. app/main.py) и
возвращает по нему рабочую ссылку — удобно для локальной разработки без
реального облака, но так, чтобы сгенерированные картинки всё равно
открывались в браузере, а не превращались в нерабочий mock://-URL.
"""
from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path

import boto3

from app.core.config import Settings


class StorageClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock = not settings.s3_access_key

        if not self.mock:
            self._client = boto3.client(
                "s3",
                endpoint_url=settings.s3_endpoint_url,
                aws_access_key_id=settings.s3_access_key,
                aws_secret_access_key=settings.s3_secret_key,
                region_name=settings.s3_region,
            )

    def _mock_save(self, key: str, content: bytes) -> str:
        path = Path(self.settings.generated_media_dir) / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return f"{self.settings.public_backend_url}/media/{key}"

    def upload_text(self, key: str, content: str, content_type: str = "text/html") -> str:
        if self.mock:
            return self._mock_save(key, content.encode("utf-8"))

        self._client.put_object(  # pragma: no cover — требует реальные ключи
            Bucket=self.settings.s3_bucket,
            Key=key,
            Body=content.encode("utf-8"),
            ContentType=content_type,
            ACL="public-read",
        )
        return f"{self.settings.s3_endpoint_url}/{self.settings.s3_bucket}/{key}"

    def upload_bytes(self, key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        if self.mock:
            return self._mock_save(key, content)

        self._client.put_object(  # pragma: no cover — требует реальные ключи
            Bucket=self.settings.s3_bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
            ACL="public-read",
        )
        return f"{self.settings.s3_endpoint_url}/{self.settings.s3_bucket}/{key}"

    def upload_dir(self, local_dir: str, prefix: str) -> str:
        """Рекурсивно заливает статическую сборку сайта (вывод `nuxi generate`
        из site-builder) под указанным префиксом ключей, определяя content-type
        по расширению файла. Возвращает публичный URL каталога сборки.

        В mock-режиме ничего не копирует: сборка уже лежит в site_builds_dir
        (общий volume с site-builder) и раздаётся напрямую через /preview-sites
        (см. app/main.py и app/services/publish.py) — дублировать её байты в
        generated_media_dir было бы бессмысленной тратой места и времени.
        """
        if self.mock:
            return f"mock://{self.settings.s3_bucket}/{prefix}"

        root = Path(local_dir)
        for path in sorted(root.rglob("*")):
            if path.is_file():
                rel_key = f"{prefix}/{path.relative_to(root).as_posix()}"
                content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
                self.upload_bytes(rel_key, path.read_bytes(), content_type)

        return f"{self.settings.s3_endpoint_url}/{self.settings.s3_bucket}/{prefix}"


def new_build_id() -> str:
    return uuid.uuid4().hex[:12]
