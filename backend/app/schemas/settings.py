"""Настройки проекта: домен, SEO, 152-ФЗ, аналитика, коммерция, доставка заявок.

Всё, что здесь описано, реально доезжает до опубликованного сайта: site-builder
кладёт этот объект в site-renderer/data/settings.json, а site-renderer
подставляет счётчики/мета-теги в <head> и настраивает поведение форм и корзины
(см. site-renderer/app.vue). Раньше settings передавались в билд, но нигде не
использовались — счётчик Метрики в опубликованный сайт не попадал вообще.
"""
from pydantic import BaseModel, Field


class DomainSettings(BaseModel):
    custom_domain: str = ""
    subdomain: str = ""  # <subdomain>.builder.ai
    dns_verified: bool = False


class SeoSettings(BaseModel):
    title: str = ""
    description: str = ""
    keywords: str = ""
    # Картинка для соцсетей (og:image) и favicon — абсолютные URL.
    og_image: str = ""
    favicon_url: str = ""
    # robots.txt: закрыть сайт от индексации целиком (для черновиков/staging).
    noindex: bool = False


class LegalSettings(BaseModel):
    """152-ФЗ: согласие на обработку персональных данных + реквизиты."""

    add_pd_consent: bool = True
    inn: str = ""
    ogrn: str = ""
    company_legal_name: str = ""
    privacy_policy_url: str = ""
    consent_text: str = "Отправляя форму, я соглашаюсь на обработку персональных данных"


class AnalyticsSettings(BaseModel):
    """Счётчики и коды подтверждения прав. Вставляются в <head> статической
    сборки ровно теми официальными сниппетами, что дают сами сервисы (см.
    site-renderer/app.vue) — идентично тому, как это сделано вручную на
    боевом сайте rostov-gorod-auto.ru, только собирается из настроек проекта.
    """

    # Яндекс.Метрика — только номер счётчика, сниппет собирается сам.
    yandex_metrika_id: str = ""
    metrika_webvisor: bool = True
    # <meta name="yandex-verification"> для Яндекс.Вебмастера.
    yandex_verification: str = ""
    # Google Analytics 4 (G-XXXXXXX) — тег gtag.js.
    google_analytics_id: str = ""
    # Google Tag Manager (GTM-XXXXXX) — контейнер, включая noscript-iframe в <body>.
    google_tag_manager_id: str = ""
    # <meta name="google-site-verification"> для Google Search Console.
    google_verification: str = ""
    # VK Пиксель (VK-RTRG-XXXXXX-XXXXX).
    vk_pixel_id: str = ""
    # Mail.ru top@Mail.Ru / VK Ads счётчик.
    mailru_counter_id: str = ""
    # Произвольный HTML для <head> и конца <body> — на случай счётчика, которого
    # нет в списке выше. Вставляется как есть, поэтому доступен только владельцу
    # проекта через настройки (не через ИИ-чат и не через промпт).
    custom_head_html: str = ""
    custom_body_html: str = ""


class CommerceSettings(BaseModel):
    """Корзина и оформление заказа интернет-магазина.

    Корзина включается автоматически, если на сайте есть блок с action="cart"
    (см. site_uses_cart в app/schemas/site.py) — этот флаг лишь позволяет
    выключить её принудительно.
    """

    cart_enabled: bool = True
    currency: str = "₽"
    # order — оформление заказа заявкой (менеджер перезванивает);
    # payment — то же плюс кнопка онлайн-оплаты через ЮKassa.
    checkout_mode: str = "order"
    # Реквизиты магазина для ЮKassa. secret_key наружу (в статический сайт)
    # НИКОГДА не отдаётся — платёж создаёт бэкенд (см. app/services/billing.py).
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""
    min_order_total: int = 0
    # Что показать после успешного оформления.
    success_text: str = "Заказ принят! Мы свяжемся с вами для подтверждения."


class LeadDeliverySettings(BaseModel):
    """Куда уходят заявки и заказы с опубликованного сайта.

    Сайт статический, поэтому форма всегда стучится на наш бэкенд
    (`POST /api/v1/public/projects/{id}/leads`) — он сохраняет заявку в БД и уже
    сам, серверной стороной, рассылает её во внешние каналы. Слать из браузера
    напрямую в вебхук/Telegram нельзя: это и CORS, и утечка токена бота в
    исходники страницы.
    """

    store_in_platform: bool = True
    webhook_url: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    # Показывать ли плавающую кнопку WhatsApp на сайте (номер — в integrations).
    whatsapp_button: bool = False


class IntegrationSettings(BaseModel):
    """Исторический набор интеграций из первой версии ТЗ. yandex_metrika_id
    здесь оставлен для обратной совместимости с уже сохранёнными проектами —
    актуальное место счётчика теперь AnalyticsSettings (см. migrate_legacy ниже).
    """

    yookassa_enabled: bool = False
    yandex_metrika_id: str = ""
    dgis_enabled: bool = False
    whatsapp_widget_phone: str = ""


class ProjectSettings(BaseModel):
    domain: DomainSettings = Field(default_factory=DomainSettings)
    seo: SeoSettings = Field(default_factory=SeoSettings)
    legal: LegalSettings = Field(default_factory=LegalSettings)
    integrations: IntegrationSettings = Field(default_factory=IntegrationSettings)
    analytics: AnalyticsSettings = Field(default_factory=AnalyticsSettings)
    commerce: CommerceSettings = Field(default_factory=CommerceSettings)
    leads: LeadDeliverySettings = Field(default_factory=LeadDeliverySettings)

    def migrate_legacy(self) -> "ProjectSettings":
        """Переносит значения из старых полей в новые для проектов, созданных
        до появления AnalyticsSettings. Вызывается при чтении настроек, чтобы
        уже настроенный счётчик Метрики не потерялся при обновлении."""
        if self.integrations.yandex_metrika_id and not self.analytics.yandex_metrika_id:
            self.analytics.yandex_metrika_id = self.integrations.yandex_metrika_id
        if self.integrations.whatsapp_widget_phone and not self.leads.whatsapp_button:
            self.leads.whatsapp_button = True
        return self


class DnsCheckResult(BaseModel):
    domain: str
    verified: bool
    expected_record: str
    detail: str


def public_site_settings(settings: ProjectSettings) -> dict:
    """Подмножество настроек, которое безопасно инлайнить в статическую сборку.

    Всё, что является секретом (secret_key ЮKassa, токен Telegram-бота, адрес
    вебхука, e-mail получателя заявок), остаётся только на бэкенде: сайт лишь
    отправляет заявку на наш публичный эндпоинт, а рассылкой занимается сервер.
    Без этой фильтрации секреты уехали бы в JS-бандл опубликованного сайта.
    """
    return {
        "seo": settings.seo.model_dump(),
        "legal": settings.legal.model_dump(),
        "analytics": settings.analytics.model_dump(),
        "commerce": {
            "cart_enabled": settings.commerce.cart_enabled,
            "currency": settings.commerce.currency,
            "checkout_mode": settings.commerce.checkout_mode,
            "min_order_total": settings.commerce.min_order_total,
            "success_text": settings.commerce.success_text,
            # Наличие ключей, но не сами ключи — сайту нужно лишь знать,
            # показывать ли кнопку «Оплатить».
            "payment_available": bool(settings.commerce.yookassa_shop_id and settings.commerce.yookassa_secret_key),
        },
        "forms": {
            "whatsapp_button": settings.leads.whatsapp_button,
            "whatsapp_phone": settings.integrations.whatsapp_widget_phone,
        },
    }
