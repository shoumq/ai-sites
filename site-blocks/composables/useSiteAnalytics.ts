import { useHead } from '#imports'

/**
 * Счётчики аналитики и коды подтверждения прав в <head> опубликованного сайта.
 *
 * Сниппеты — официальные, 1:1 те, что выдают сами сервисы: Метрика ожидает
 * именно свой inline-загрузчик с проверкой уже вставленного тега, GTM — свой,
 * gtag.js — свой. Переписывать их «покрасивее» нельзя: сервисы сверяют факт
 * установки именно по этому коду, а Метрика вдобавок теряет часть событий,
 * если её тег подгружать лениво.
 *
 * Всё это раньше существовало в настройках проекта, но никуда не доезжало:
 * site-builder игнорировал settings, и опубликованный сайт выходил вообще без
 * счётчиков.
 */

export interface AnalyticsConfig {
  yandex_metrika_id?: string
  metrika_webvisor?: boolean
  yandex_verification?: string
  google_analytics_id?: string
  google_tag_manager_id?: string
  google_verification?: string
  vk_pixel_id?: string
  mailru_counter_id?: string
  custom_head_html?: string
  custom_body_html?: string
}

export interface SeoConfig {
  title?: string
  description?: string
  keywords?: string
  og_image?: string
  favicon_url?: string
  noindex?: boolean
}

function metrikaSnippet(counterId: string, webvisor: boolean): string {
  return (
    `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};` +
    `m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}` +
    `k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})` +
    `(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${counterId}","ym");` +
    `ym(${counterId},"init",{ssr:true,webvisor:${webvisor},clickmap:true,ecommerce:"dataLayer",` +
    `accurateTrackBounce:true,trackLinks:true});`
  )
}

function gtmSnippet(containerId: string): string {
  return (
    `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
    `var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';` +
    `j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
    `})(window,document,'script','dataLayer','${containerId}');`
  )
}

function vkPixelSnippet(pixelId: string): string {
  return (
    `!function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,` +
    `t.src="https://vk.com/js/api/openapi.js?169",t.onload=function(){VK.Retargeting.Init("${pixelId}"),` +
    `VK.Retargeting.Hit()},document.head.appendChild(t)}();`
  )
}

function mailruSnippet(counterId: string): string {
  return (
    `var _tmr = window._tmr || (window._tmr = []);` +
    `_tmr.push({id: "${counterId}", type: "pageView", start: (new Date()).getTime()});` +
    `(function (d, w, id) {if (d.getElementById(id)) return;var ts = d.createElement("script");` +
    `ts.type = "text/javascript";ts.async = true;ts.id = id;ts.src = "https://top-fwz1.mail.ru/js/code.js";` +
    `var f = function () {var s = d.getElementsByTagName("script")[0];s.parentNode.insertBefore(ts, s);};` +
    `if (w.opera == "[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else {f();}})` +
    `(document, window, "tmr-code");`
  )
}

function rawHtmlInjector(html: string, target: 'head' | 'body'): string {
  // JSON.stringify — единственный корректный способ внести произвольную строку
  // в тело инлайн-скрипта: он экранирует кавычки, переводы строк и обратные
  // слэши. Плюс отдельно рвём последовательность "</script>", иначе она
  // закрыла бы сам инлайн-скрипт прямо посреди строкового литерала.
  const literal = JSON.stringify(html).replace(/<\/script/gi, '<\\/script')
  return (
    `(function(){var html=${literal};var tpl=document.createElement('template');tpl.innerHTML=html;` +
    `var target=document.${target};Array.prototype.forEach.call(tpl.content.childNodes,function(node){` +
    `if(node.nodeName==='SCRIPT'){var s=document.createElement('script');` +
    `Array.prototype.forEach.call(node.attributes,function(a){s.setAttribute(a.name,a.value)});` +
    `s.textContent=node.textContent;target.appendChild(s)}else{target.appendChild(node.cloneNode(true))}})})();`
  )
}

export function useSiteAnalytics(analytics: AnalyticsConfig, seo: SeoConfig = {}) {
  const script: Record<string, unknown>[] = []
  const noscript: Record<string, unknown>[] = []
  const meta: Record<string, string>[] = []
  const link: Record<string, string>[] = []

  // dataLayer объявляем до счётчиков: и GTM, и ecommerce Метрики пишут в него,
  // и если он появится позже первого события — событие потеряется.
  script.push({ innerHTML: 'window.dataLayer = window.dataLayer || [];', type: 'text/javascript' })

  if (analytics.yandex_metrika_id) {
    script.push({
      innerHTML: metrikaSnippet(analytics.yandex_metrika_id, analytics.metrika_webvisor !== false),
      type: 'text/javascript',
    })
    noscript.push({
      innerHTML: `<div><img src="https://mc.yandex.ru/watch/${analytics.yandex_metrika_id}" style="position:absolute;left:-9999px;" alt="" /></div>`,
    })
  }

  if (analytics.google_tag_manager_id) {
    script.push({ innerHTML: gtmSnippet(analytics.google_tag_manager_id), type: 'text/javascript' })
    noscript.push({
      innerHTML:
        `<iframe src="https://www.googletagmanager.com/ns.html?id=${analytics.google_tag_manager_id}" ` +
        `height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
    })
  }

  if (analytics.google_analytics_id) {
    script.push({ src: `https://www.googletagmanager.com/gtag/js?id=${analytics.google_analytics_id}`, async: true })
    script.push({
      innerHTML:
        `function gtag(){dataLayer.push(arguments);}gtag('js', new Date());` +
        `gtag('config', '${analytics.google_analytics_id}');`,
      type: 'text/javascript',
    })
  }

  if (analytics.vk_pixel_id) {
    script.push({ innerHTML: vkPixelSnippet(analytics.vk_pixel_id), type: 'text/javascript' })
  }

  if (analytics.mailru_counter_id) {
    script.push({ innerHTML: mailruSnippet(analytics.mailru_counter_id), type: 'text/javascript' })
    noscript.push({
      innerHTML:
        `<div><img src="https://top-fwz1.mail.ru/counter?id=${analytics.mailru_counter_id};js=na" ` +
        `style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div>`,
    })
  }

  // Произвольный HTML пользователя (счётчик, которого нет в списке выше).
  // useHead не умеет вставлять сырую разметку, а insertAdjacentHTML НЕ
  // исполняет вставленные <script> — поэтому инжектор пересоздаёт каждый
  // script-узел заново, иначе чужой пиксель молча не работал бы.
  if (analytics.custom_head_html) {
    script.push({ innerHTML: rawHtmlInjector(analytics.custom_head_html, 'head'), type: 'text/javascript' })
  }
  if (analytics.custom_body_html) {
    script.push({
      innerHTML: rawHtmlInjector(analytics.custom_body_html, 'body'),
      type: 'text/javascript',
      tagPosition: 'bodyClose',
    })
  }

  // Подтверждение прав в Вебмастере/Search Console — обычные meta-теги.
  if (analytics.yandex_verification) {
    meta.push({ name: 'yandex-verification', content: analytics.yandex_verification })
  }
  if (analytics.google_verification) {
    meta.push({ name: 'google-site-verification', content: analytics.google_verification })
  }

  // ---- SEO ----
  if (seo.description) meta.push({ name: 'description', content: seo.description })
  if (seo.keywords) meta.push({ name: 'keywords', content: seo.keywords })
  if (seo.noindex) meta.push({ name: 'robots', content: 'noindex, nofollow' })
  if (seo.og_image) meta.push({ property: 'og:image', content: seo.og_image })
  if (seo.title) meta.push({ property: 'og:title', content: seo.title })
  if (seo.description) meta.push({ property: 'og:description', content: seo.description })
  meta.push({ property: 'og:type', content: 'website' })
  meta.push({ property: 'og:locale', content: 'ru_RU' })

  if (seo.favicon_url) link.push({ rel: 'icon', href: seo.favicon_url })

  useHead({
    meta,
    link,
    script,
    noscript,
  })
}
