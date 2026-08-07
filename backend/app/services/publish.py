"""Сборка статического HTML/CSS/JS билда из JSON-схемы и публикация (ТЗ п.5).

Рендерит SiteSchema в самостоятельный HTML-документ (тема — через CSS-переменные,
без инлайн-стилей на секциях, как требует архитектура п.4) и заливает через
StorageClient. Используется и кнопкой «Опубликовать», и тарифным экспортом
кода (Бизнес-тариф, ТЗ п.6).
"""
from __future__ import annotations

from app.models.enums import TariffPlan
from app.schemas.settings import ProjectSettings
from app.schemas.site import Page, Section, SiteSchema
from app.services.storage import StorageClient, new_build_id

FONT_STACKS = {
    "Inter": "'Inter', system-ui, sans-serif",
    "Roboto": "'Roboto', system-ui, sans-serif",
    "PT Sans": "'PT Sans', system-ui, sans-serif",
    "Montserrat": "'Montserrat', system-ui, sans-serif",
}


def _render_section(section: Section) -> str:
    if section.type == "header":
        nav = "".join(f'<a href="{i.href}">{i.label}</a>' for i in section.nav_items)
        sticky = " data-sticky" if section.sticky else ""
        cta = f'<a class="btn" href="#hero">{section.cta_text}</a>' if section.cta_text else ""
        return f'<header{sticky}><div class="logo">{section.logo_text}</div><nav>{nav}</nav>{cta}</header>'
    if section.type == "hero":
        cta = f'<a class="btn" href="{section.cta_href}">{section.cta_text}</a>' if section.cta_text else ""
        bg = f' style="background-image:url(\'{section.bg_image}\')"' if section.bg_image else ""
        return (
            f'<section id="hero" class="hero"{bg}><h1>{section.title}</h1>'
            f"<p>{section.subtitle}</p>{cta}</section>"
        )
    if section.type == "text_image":
        img = f'<img src="{section.image}" alt="{section.title}"/>' if section.image else ""
        return (
            f'<section class="text-image pos-{section.image_position}"><div class="text">'
            f"<h2>{section.title}</h2><p>{section.text}</p></div>{img}</section>"
        )
    if section.type == "grid_3col":
        cards = "".join(
            f'<div class="card"><h3>{i.name}</h3><p>{i.description}</p><span class="price">{i.price}</span></div>'
            for i in section.items
        )
        cta = f'<a class="btn" href="#">{section.cta_text}</a>' if section.cta_text else ""
        # id="grid_3col", а не "services" — совпадает с href="#grid_3col" в nav_items (см. NAV_LABELS в orchestrator.py)
        return f'<section id="grid_3col" class="grid-3col"><h2>{section.title}</h2><div class="grid">{cards}</div>{cta}</section>'
    if section.type == "pricing":
        plans = "".join(
            f'<div class="plan{" highlighted" if p.highlighted else ""}"><h3>{p.name}</h3>'
            f'<div class="price">{p.price} ₽/{p.period}</div><ul>'
            + "".join(f"<li>{f}</li>" for f in p.features)
            + "</ul></div>"
            for p in section.plans
        )
        return f'<section id="pricing" class="pricing"><h2>{section.title}</h2><div class="plans">{plans}</div></section>'
    if section.type == "testimonials":
        items = "".join(
            f'<div class="testimonial"><p>“{t.text}”</p><cite>{t.author}</cite></div>' for t in section.items
        )
        return f'<section id="testimonials" class="testimonials"><h2>{section.title}</h2>{items}</section>'
    if section.type == "contact_map":
        map_html = f'<iframe src="{section.map_embed_url}" loading="lazy"></iframe>' if section.show_map and section.map_embed_url else ""
        return (
            f'<section id="contact_map" class="contact"><h2>{section.title}</h2>'
            f"<p>{section.address}</p><p>{section.phone}</p><p>{section.email}</p>{map_html}</section>"
        )
    if section.type == "footer":
        links = "".join(f'<a href="{i.href}">{i.label}</a>' for i in section.links)
        return f'<footer><div>{section.company_name}</div><nav>{links}</nav><p>{section.copyright_text}</p></footer>'
    return ""


def render_page_html(page: Page, site: SiteSchema, settings_: ProjectSettings, tariff: TariffPlan) -> str:
    body = "\n".join(_render_section(s) for s in page.sections)

    watermark = ""
    if tariff == TariffPlan.trial:
        watermark = '<div class="ai-watermark">Сделано в AI-Конструкторе сайтов</div>'

    consent = ""
    if settings_.legal.add_pd_consent:
        consent = (
            '<div class="pd-consent">Продолжая пользоваться сайтом, вы соглашаетесь с '
            "<a href=\"#\">обработкой персональных данных</a> (152-ФЗ).</div>"
        )

    metrika = ""
    if settings_.integrations.yandex_metrika_id:
        metrika = (
            f"<script>(function(m,e,t,r,i,k,a){{m[i]=m[i]||function(){{(m[i].a=m[i].a||[])."
            f"push(arguments)}};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++)"
            f"{{if(document.scripts[j].src===r){{return;}}}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],"
            f"k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}})(window,document,'script',"
            f"'https://mc.yandex.ru/metrika/tag.js','ym');ym({settings_.integrations.yandex_metrika_id},"
            f"'init',{{webvisor:true}});</script>"
        )

    whatsapp = ""
    if settings_.integrations.whatsapp_widget_phone:
        phone = settings_.integrations.whatsapp_widget_phone
        whatsapp = f'<a class="whatsapp-widget" href="https://wa.me/{phone}" target="_blank" rel="noopener">WhatsApp</a>'

    font_stack = FONT_STACKS.get(site.theme.font, FONT_STACKS["Inter"])

    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{settings_.seo.title or page.title}</title>
<meta name="description" content="{settings_.seo.description}"/>
<meta name="keywords" content="{settings_.seo.keywords}"/>
<style>
html {{ scroll-behavior: smooth; }}
:root {{ --primary: {site.theme.primary_color}; --font: {font_stack}; }}
body {{ margin:0; font-family: var(--font); color:#1a1a1a; }}
header {{ display:flex; justify-content:space-between; align-items:center; padding:16px 24px; }}
header[data-sticky] {{ position: sticky; top:0; background:#fff; z-index:10; }}
header nav a, footer nav a {{ color:inherit; text-decoration:none; }}
header nav a:hover, footer nav a:hover {{ text-decoration:underline; }}
.btn {{ background:var(--primary); color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; }}
.hero {{ padding:80px 24px; text-align:center; background-size:cover; background-position:center; }}
.grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }}
@media (max-width: 768px) {{ .grid {{ grid-template-columns:1fr; }} header {{ flex-direction:column; gap:8px; }} }}
.plans {{ display:flex; gap:24px; flex-wrap:wrap; }}
.plan.highlighted {{ border:2px solid var(--primary); }}
.ai-watermark {{ position:fixed; bottom:8px; right:8px; font-size:12px; opacity:.6; }}
.pd-consent {{ font-size:12px; padding:12px 24px; opacity:.7; }}
.whatsapp-widget {{ position:fixed; bottom:16px; left:16px; background:#25D366; color:#fff; padding:12px 16px; border-radius:50%; text-decoration:none; }}
{site.theme.custom_css}
</style>
{metrika}
</head>
<body>
{body}
{consent}
{watermark}
{whatsapp}
</body>
</html>"""


def publish_project(
    site: SiteSchema, settings_: ProjectSettings, tariff: TariffPlan, storage: StorageClient, subdomain: str
) -> str:
    build_id = new_build_id()
    for i, page in enumerate(site.pages):
        html = render_page_html(page, site, settings_, tariff)
        storage.upload_text(f"sites/{subdomain}/{build_id}/{page.slug}.html", html)
        if i == 0:
            # Первая страница дублируется как index.html — иначе корень домена
            # (GET /) не откроется: статический хостинг ищет index-документ,
            # а не {slug}.html.
            storage.upload_text(f"sites/{subdomain}/{build_id}/index.html", html)

    domain = settings_.domain.custom_domain if settings_.domain.dns_verified and settings_.domain.custom_domain else None
    return domain or f"{subdomain}.builder.ai"
