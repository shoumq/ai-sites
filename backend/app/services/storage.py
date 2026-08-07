"""S3-совместимое хранилище (VK Cloud / Yandex Cloud), ТЗ п.1.

Без заданных ключей работает в mock-режиме: «загружает» билд в память и
возвращает детерминированный URL — удобно для локальной разработки и тестов
публикации без реального облака.
"""
from __future__ import annotations

import uuid

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

    def get_mock_content(self, key: str) -> str | None:
        return _MOCK_STORE.get(key)


def new_build_id() -> str:
    return uuid.uuid4().hex[:12]
