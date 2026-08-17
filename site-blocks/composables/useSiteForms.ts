import { useState } from '#imports'
import type { CartItem } from './useCart'

/**
 * Отправка заявок и заказов с опубликованного сайта на публичный эндпоинт
 * платформы (`POST {apiBase}/public/projects/{projectId}/leads`).
 *
 * Прямых отправок в вебхук/Telegram отсюда нет намеренно: браузер упёрся бы в
 * CORS, а токен бота и адрес вебхука пришлось бы положить в JS-бандл сайта,
 * то есть опубликовать. Рассылку делает бэкенд (backend/app/services/leads.py).
 */

export interface LeadPayload {
  kind?: 'lead' | 'order'
  name?: string
  phone?: string
  email?: string
  message?: string
  /** Поля формы сверх стандартных — ключ здесь человекочитаемый (label). */
  extra?: Record<string, string>
  items?: CartItem[]
  total?: string
  sourceBlock?: string
  /** Honeypot: заполняется только ботами, живой посетитель поля не видит. */
  companyWebsite?: string
}

/** Состояние модалки «Оставить заявку», общее для всего сайта: её открывают
 *  карточки каталога/услуг и кнопки hero, а рендерится она один раз в
 *  SiteOverlays. */
export interface LeadModalState {
  open: boolean
  title: string
  /** Товар/услуга, из карточки которого открыли форму — уезжает в заявку. */
  subject: string
  sku: string
}

export function useLeadModal() {
  const state = useState<LeadModalState>('site-lead-modal', () => ({ open: false, title: '', subject: '', sku: '' }))

  function openLeadModal(options: { title?: string; subject?: string; sku?: string } = {}) {
    state.value = {
      open: true,
      title: options.title || 'Оставить заявку',
      subject: options.subject || '',
      sku: options.sku || '',
    }
  }

  function closeLeadModal() {
    state.value = { ...state.value, open: false }
  }

  return { leadModal: state, openLeadModal, closeLeadModal }
}

export function useSiteForms() {
  const runtime = useSiteRuntime()

  /**
   * Отправляет заявку/заказ. `paymentUrl` непустой, только если магазин
   * настроен на онлайн-оплату — тогда бэкенд создаёт платёж по ценам из схемы
   * сайта и возвращает ссылку на страницу оплаты.
   *
   * В режиме превью (редактор админки) ничего не отправляет и рапортует об
   * успехе — чтобы владелец сайта мог прощёлкать форму, не засоряя себе
   * список заявок.
   */
  async function submitLead(payload: LeadPayload): Promise<{ ok: boolean; paymentUrl: string }> {
    if (runtime.value.preview || !runtime.value.apiBase || !runtime.value.projectId) {
      return { ok: true, paymentUrl: '' }
    }

    const body = {
      kind: payload.kind ?? 'lead',
      name: payload.name ?? '',
      phone: payload.phone ?? '',
      email: payload.email ?? '',
      message: payload.message ?? '',
      extra: payload.extra ?? {},
      items: (payload.items ?? []).map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
        sku: item.sku,
      })),
      total: payload.total ?? '',
      // Реальный путь страницы, с которой ушла заявка — на многостраничнике
      // без него непонятно, откуда пришёл клиент.
      source_page: typeof window === 'undefined' ? '' : window.location.pathname,
      source_block: payload.sourceBlock ?? '',
      company_website: payload.companyWebsite ?? '',
    }

    try {
      const response = await fetch(`${runtime.value.apiBase}/public/projects/${runtime.value.projectId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) return { ok: false, paymentUrl: '' }
      const data = await response.json().catch(() => ({}))
      return { ok: true, paymentUrl: typeof data.payment_url === 'string' ? data.payment_url : '' }
    } catch {
      // Сеть недоступна/эндпоинт лежит — форма покажет ошибку и предложит
      // повторить, вместо тихой потери заявки с «Спасибо!».
      return { ok: false, paymentUrl: '' }
    }
  }

  return { submitLead }
}
