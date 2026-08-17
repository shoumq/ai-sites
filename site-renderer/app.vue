<script setup lang="ts">
import siteData from '~/data/site.json'
import runtimeData from '~/data/runtime.json'
import type { SiteSchema } from '~/types/site'

// site.json и runtime.json инлайнятся Vite в бандл на этапе сборки — рантайм-
// запросов нет. runtime.json пишет site-builder из настроек проекта на каждую
// сборку (см. backend/app/services/site_builder_client.py): счётчики, SEO,
// корзина и адрес, куда сайт отправляет заявки.
const site = siteData as SiteSchema
const runtime = runtimeData as Record<string, any>

const seo = runtime.seo ?? {}
const legal = runtime.legal ?? {}
const analytics = runtime.analytics ?? {}
const commerce = runtime.commerce ?? {}
const forms = runtime.forms ?? {}

// Прокидывает цвет/шрифт/фон и оси вёрстки на <html> через useHead
// (SSR/prerender-safe, см. site-blocks/composables/useSiteTheme.ts).
useSiteTheme(site.theme)

setSiteRuntime({
  apiBase: runtime.api_base ?? '',
  projectId: runtime.project_id ?? '',
  currency: commerce.currency ?? '₽',
  cartEnabled: Boolean(runtime.cart_enabled),
  checkoutMode: commerce.checkout_mode === 'payment' ? 'payment' : 'order',
  paymentAvailable: Boolean(commerce.payment_available),
  minOrderTotal: Number(commerce.min_order_total ?? 0),
  orderSuccessText: commerce.success_text || 'Заказ принят! Мы свяжемся с вами для подтверждения.',
  consentText: legal.consent_text || 'Отправляя форму, я соглашаюсь на обработку персональных данных',
  privacyPolicyUrl: legal.privacy_policy_url ?? '',
  addPdConsent: legal.add_pd_consent !== false,
  preview: false,
})

// Счётчики (Метрика/GTM/GA4/VK/top@Mail.ru), коды подтверждения прав в
// Вебмастере и Search Console, SEO-мета и favicon.
useSiteAnalytics(analytics, seo)

useHead({
  htmlAttrs: { lang: 'ru' },
  meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
})
</script>

<template>
  <div class="app-root">
    <NuxtPage />
    <!-- Корзина, модалка заявки, кнопка WhatsApp и водяной знак пробного
         тарифа — один экземпляр на весь сайт, вне зависимости от страницы. -->
    <SiteOverlays
      :watermark="Boolean(runtime.watermark)"
      :show-whatsapp="Boolean(forms.whatsapp_button)"
      :whatsapp-phone="forms.whatsapp_phone ?? ''"
    />
  </div>
</template>

<style>
/* container-type здесь даёт блокам (например бургер-меню шапки) единый
   способ реагировать на реальную доступную ширину через @container — та же
   ось, что использует live-превью в admin-panel/pages/editor/[id]/index.vue
   (.editor-canvas-frame), так что поведение совпадает и в редакторе, и на
   опубликованном сайте. */
.app-root {
  container-type: inline-size;
}
</style>
