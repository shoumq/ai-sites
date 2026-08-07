from pydantic import BaseModel, Field


class DomainSettings(BaseModel):
    custom_domain: str = ""
    subdomain: str = ""  # <subdomain>.builder.ai
    dns_verified: bool = False


class SeoSettings(BaseModel):
    title: str = ""
    description: str = ""
    keywords: str = ""


class LegalSettings(BaseModel):
    """152-ФЗ: согласие на обработку персональных данных + реквизиты."""

    add_pd_consent: bool = True
    inn: str = ""
    ogrn: str = ""


class IntegrationSettings(BaseModel):
    yookassa_enabled: bool = False
    yandex_metrika_id: str = ""
    dgis_enabled: bool = False
    whatsapp_widget_phone: str = ""


class ProjectSettings(BaseModel):
    domain: DomainSettings = Field(default_factory=DomainSettings)
    seo: SeoSettings = Field(default_factory=SeoSettings)
    legal: LegalSettings = Field(default_factory=LegalSettings)
    integrations: IntegrationSettings = Field(default_factory=IntegrationSettings)


class DnsCheckResult(BaseModel):
    domain: str
    verified: bool
    expected_record: str
    detail: str
