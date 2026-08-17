import { useState } from '#imports'

/**
 * Рантайм-настройки опубликованного сайта: куда слать заявки, включена ли
 * корзина, какая валюта, какие тексты показывать после отправки.
 *
 * Заполняется один раз на входе в приложение:
 *   * site-renderer — из `data/runtime.json`, который site-builder получает от
 *     бэкенда на каждую сборку (см. backend/app/services/site_builder_client.py);
 *   * admin-panel (live-превью) — режимом preview, где формы и корзина
 *     работают визуально, но ничего никуда не отправляют.
 *
 * Секретов здесь нет и быть не может: объект целиком инлайнится в JS-бандл
 * статического сайта (фильтрация — public_site_settings на бэкенде).
 */
export interface SiteRuntime {
  /** Пусто = превью в редакторе: формы не отправляются, а показывают заглушку. */
  apiBase: string
  projectId: string
  currency: string
  cartEnabled: boolean
  /** order — оформление заявкой; payment — плюс кнопка онлайн-оплаты. */
  checkoutMode: 'order' | 'payment'
  paymentAvailable: boolean
  minOrderTotal: number
  orderSuccessText: string
  consentText: string
  privacyPolicyUrl: string
  addPdConsent: boolean
  /** true в live-превью админки — блокирует реальные сетевые отправки. */
  preview: boolean
}

export const DEFAULT_SITE_RUNTIME: SiteRuntime = {
  apiBase: '',
  projectId: '',
  currency: '₽',
  cartEnabled: false,
  checkoutMode: 'order',
  paymentAvailable: false,
  minOrderTotal: 0,
  orderSuccessText: 'Заказ принят! Мы свяжемся с вами для подтверждения.',
  consentText: 'Отправляя форму, я соглашаюсь на обработку персональных данных',
  privacyPolicyUrl: '',
  addPdConsent: true,
  preview: false,
}

export function useSiteRuntime() {
  return useState<SiteRuntime>('site-runtime', () => ({ ...DEFAULT_SITE_RUNTIME }))
}

/** Вызывается один раз в app.vue приложения-потребителя. */
export function setSiteRuntime(patch: Partial<SiteRuntime>) {
  const runtime = useSiteRuntime()
  runtime.value = { ...DEFAULT_SITE_RUNTIME, ...patch }
  return runtime
}
