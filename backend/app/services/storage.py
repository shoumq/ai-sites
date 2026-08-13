"""S3-совместимое хранилище (VK Cloud / Yandex Cloud), ТЗ п.1.

Без заданных ключей работает в mock-режиме: «загружает» билд в память и
возвращает детерминированный URL — удобно для локальной разработки и тестов
публикации без реального облака.
"""
from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path

import boto3

from app.core.config import Settings

_MOCK_STORE: dict[str, str] = {}


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

    def upload_text(self, key: str, content: str, content_type: str = "text/html") -> str:
        if self.mock:
            _MOCK_STORE[key] = content
            return f"mock://{self.settings.s3_bucket}/{key}"

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
            return f"mock://{self.settings.s3_bucket}/{key}"

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
        по расширению файла. Возвращает публичный URL каталога сборки."""
        root = Path(local_dir)
        for path in sorted(root.rglob("*")):
            if path.is_file():
                rel_key = f"{prefix}/{path.relative_to(root).as_posix()}"
                content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
                self.upload_bytes(rel_key, path.read_bytes(), content_type)

        if self.mock:
            return f"mock://{self.settings.s3_bucket}/{prefix}"
        return f"{self.settings.s3_endpoint_url}/{self.settings.s3_bucket}/{prefix}"


def new_build_id() -> str:
    return uuid.uuid4().hex[:12]
