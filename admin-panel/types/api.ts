/**
 * Контракт REST/WS API — зеркало Pydantic-схем бэкенда (см.
 * backend/app/schemas/{auth,project,settings,chat}.py, backend/app/core/tariffs.py,
 * backend/app/models/enums.py). Поля snake_case НЕ переименовывать.
 */
import type { SiteSchema, Theme } from './site'

export type Tariff = 'trial' | 'basic' | 'business'

export interface User {
  id: string
  email: string
  tariff: Tariff
}

export interface Token {
  access_token: string
  token_type: string
}

export type SiteType = 'landing' | 'shop' | 'multipage' | 'crm'
export type StylePreset = Theme['style']
export type SiteGoal = 'sales' | 'booking' | 'portfolio' | 'info'

export interface BlockPreference {
  type: string
  variant: string
}

/** Ручной выбор структуры сайта (экран «Структура» воронки). Пустая строка в
 *  любой оси означает «подберёт ИИ»; mode='auto' игнорирует blocks целиком. */
export interface LayoutPreferences {
  mode: 'auto' | 'manual'
  blocks: BlockPreference[]
  header_variant: string
  hero_variant: string
  footer_variant: string
  radius: string
  density: string
  container_width: string
  heading_style: string
  button_style: string
  section_divider: string
  item_action: string
}

export interface BriefIn {
  site_type: SiteType
  style: StylePreset
  custom_hex_color?: string | null
  brand_name: string
  description: string
  goal: SiteGoal
  extra_requirements?: string | null
  layout: LayoutPreferences
}

export function emptyLayoutPreferences(): LayoutPreferences {
  return {
    mode: 'auto',
    blocks: [],
    header_variant: '',
    hero_variant: '',
    footer_variant: '',
    radius: '',
    density: '',
    container_width: '',
    heading_style: '',
    button_style: '',
    section_divider: '',
    item_action: '',
  }
}

export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'published'

export interface ProjectSummary {
  id: string
  name: string
  type: SiteType
  status: ProjectStatus
  updated_at: string
}

export interface ProjectOut {
  id: string
  name: string
  type: SiteType
  style: StylePreset
  status: ProjectStatus
  site_data: SiteSchema
  settings: Record<string, unknown>
  published_url: string | null
  created_at: string
  updated_at: string
}

/** stage — значение backend GenerationStage (writing_copy/building_layout/generating_images/finishing/done/error). */
export interface GenerationProgress {
  stage: string
  step: number
  total_steps: number
  message: string
}

export interface ChatCommandOut {
  reply: string
  applied: boolean
  site_data: SiteSchema
}

export interface DomainSettings {
  custom_domain: string
  subdomain: string
  dns_verified: boolean
}

export interface SeoSettings {
  title: string
  description: string
  keywords: string
  og_image: string
  favicon_url: string
  noindex: boolean
}

export interface LegalSettings {
  add_pd_consent: boolean
  inn: string
  ogrn: string
  company_legal_name: string
  privacy_policy_url: string
  consent_text: string
}

export interface IntegrationSettings {
  yookassa_enabled: boolean
  yandex_metrika_id: string
  dgis_enabled: boolean
  whatsapp_widget_phone: string
}

/** Счётчики и коды подтверждения прав — реально попадают в <head>
 *  опубликованного сайта (см. site-blocks/composables/useSiteAnalytics.ts). */
export interface AnalyticsSettings {
  yandex_metrika_id: string
  metrika_webvisor: boolean
  yandex_verification: string
  google_analytics_id: string
  google_tag_manager_id: string
  google_verification: string
  vk_pixel_id: string
  mailru_counter_id: string
  custom_head_html: string
  custom_body_html: string
}

export interface CommerceSettings {
  cart_enabled: boolean
  currency: string
  checkout_mode: 'order' | 'payment'
  yookassa_shop_id: string
  yookassa_secret_key: string
  min_order_total: number
  success_text: string
}

export interface LeadDeliverySettings {
  store_in_platform: boolean
  webhook_url: string
  telegram_bot_token: string
  telegram_chat_id: string
  whatsapp_button: boolean
}

export interface ProjectSettings {
  domain: DomainSettings
  seo: SeoSettings
  legal: LegalSettings
  integrations: IntegrationSettings
  analytics: AnalyticsSettings
  commerce: CommerceSettings
  leads: LeadDeliverySettings
}

export type LeadKind = 'lead' | 'order'

export interface Lead {
  id: string
  kind: LeadKind
  name: string
  phone: string
  email: string
  message: string
  payload: {
    extra?: Record<string, string>
    items?: { name: string; price: string; qty: number; sku: string }[]
    total?: string
  }
  source_page: string
  source_block: string
  is_read: boolean
  created_at: string
}

export interface LeadsPage {
  items: Lead[]
  total: number
  unread: number
}

export interface GitHubDeployOut {
  repo_url: string
  pages_url: string
  commit_sha: string
  files_count: number
  created: boolean
}

export interface DnsCheckResult {
  domain: string
  verified: boolean
  expected_record: string
  detail: string
}

export interface PublishOut {
  url: string
}

export interface ImageGenerateOut {
  url: string
  remaining_today: number
}

export interface CheckoutIn {
  tariff: Tariff
  return_url?: string
}

export interface CheckoutOut {
  payment_id: string
  confirmation_url: string
  amount: number
}

export function emptyProjectSettings(): ProjectSettings {
  return {
    domain: { custom_domain: '', subdomain: '', dns_verified: false },
    seo: { title: '', description: '', keywords: '', og_image: '', favicon_url: '', noindex: false },
    legal: {
      add_pd_consent: true,
      inn: '',
      ogrn: '',
      company_legal_name: '',
      privacy_policy_url: '',
      consent_text: 'Отправляя форму, я соглашаюсь на обработку персональных данных',
    },
    integrations: { yookassa_enabled: false, yandex_metrika_id: '', dgis_enabled: false, whatsapp_widget_phone: '' },
    analytics: {
      yandex_metrika_id: '',
      metrika_webvisor: true,
      yandex_verification: '',
      google_analytics_id: '',
      google_tag_manager_id: '',
      google_verification: '',
      vk_pixel_id: '',
      mailru_counter_id: '',
      custom_head_html: '',
      custom_body_html: '',
    },
    commerce: {
      cart_enabled: true,
      currency: '₽',
      checkout_mode: 'order',
      yookassa_shop_id: '',
      yookassa_secret_key: '',
      min_order_total: 0,
      success_text: 'Заказ принят! Мы свяжемся с вами для подтверждения.',
    },
    leads: {
      store_in_platform: true,
      webhook_url: '',
      telegram_bot_token: '',
      telegram_chat_id: '',
      whatsapp_button: false,
    },
  }
}
