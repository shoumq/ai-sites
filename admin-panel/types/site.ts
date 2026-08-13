/**
 * TypeScript-контракт сайта — зеркало site-blocks/types/site.ts (который сам
 * зеркалит backend/app/schemas/site.py). Дублируется здесь физическим файлом,
 * а не импортируется из layer'а, по той же причине, что описана в
 * site-blocks/nuxt.config.ts: alias `~` внутри Nuxt-слоя резолвится
 * относительно srcDir ПОТРЕБЛЯЮЩЕГО приложения (проверено генерируемым
 * .nuxt/tsconfig.json — "~/*" маппится на корень admin-panel, а не
 * site-blocks), поэтому `~/types/site`, на который ссылаются компоненты
 * site-blocks (SectionRenderer.vue и т.д.), обязан существовать здесь.
 * Поля snake_case НЕ переименовывать без синхронной правки
 * backend/app/schemas/site.py + site-blocks/types/site.ts.
 */

// ---- общие блоки -----------------------------------------------------------

export interface NavItem {
  label: string
  href: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface ServiceItem {
  name: string
  description: string
  price: string
  icon: string
}

export interface PricingPlan {
  name: string
  price: string
  period: string
  features: string[]
  highlighted: boolean
}

export interface Testimonial {
  author: string
  text: string
  avatar: string
  rating: number
}

// ---- секции ------------------------------------------------------------------

export type HeaderVariant = 'standard' | 'centered' | 'split' | 'minimal'
export type HeroVariant = 'centered' | 'split' | 'minimal' | 'gradient' | 'overlay'
export type Grid3ColVariant = 'cards' | 'icon_rows' | 'minimal_list' | 'icon_top' | 'compact_grid'
export type PricingVariant = 'cards' | 'highlight' | 'table' | 'minimal'
export type TestimonialsVariant = 'cards' | 'quotes' | 'avatars_row' | 'single_featured'
export type ContactMapVariant = 'centered' | 'split' | 'cards'
export type FooterVariant = 'simple' | 'columns' | 'minimal'

export interface HeaderSection {
  id: string
  type: 'header'
  variant: HeaderVariant
  logo_text: string
  nav_items: NavItem[]
  sticky: boolean
  cta_text: string
}

export interface HeroSection {
  id: string
  type: 'hero'
  variant: HeroVariant
  title: string
  subtitle: string
  cta_text: string
  cta_href: string
  bg_image: string
}

export interface TextImageSection {
  id: string
  type: 'text_image'
  // у этого блока нет variant — своя ось через image_position
  title: string
  text: string
  image: string
  image_position: 'left' | 'right'
}

export interface Grid3ColSection {
  id: string
  type: 'grid_3col'
  variant: Grid3ColVariant
  title: string
  items: ServiceItem[]
  cta_text: string
}

export interface PricingSection {
  id: string
  type: 'pricing'
  variant: PricingVariant
  title: string
  plans: PricingPlan[]
}

export interface TestimonialsSection {
  id: string
  type: 'testimonials'
  variant: TestimonialsVariant
  title: string
  items: Testimonial[]
}

export interface ContactMapSection {
  id: string
  type: 'contact_map'
  variant: ContactMapVariant
  title: string
  address: string
  phone: string
  email: string
  map_embed_url: string
  show_map: boolean
}

export interface FooterSection {
  id: string
  type: 'footer'
  variant: FooterVariant
  company_name: string
  copyright_text: string
  links: NavItem[]
  socials: SocialLink[]
}

export type Section =
  | HeaderSection
  | HeroSection
  | TextImageSection
  | Grid3ColSection
  | PricingSection
  | TestimonialsSection
  | ContactMapSection
  | FooterSection

export type SectionType = Section['type']

export const BLOCK_LIBRARY: { type: SectionType; label: string; icon: string }[] = [
  { type: 'header', label: 'Шапка', icon: 'lucide:panel-top' },
  { type: 'hero', label: 'Герой', icon: 'lucide:layout-template' },
  { type: 'text_image', label: 'Текст + Картинка', icon: 'lucide:image' },
  { type: 'grid_3col', label: 'Услуги — сетка', icon: 'lucide:layout-grid' },
  { type: 'pricing', label: 'Цены', icon: 'lucide:tags' },
  { type: 'testimonials', label: 'Отзывы', icon: 'lucide:quote' },
  { type: 'contact_map', label: 'Карта + Контакты', icon: 'lucide:map-pin' },
  { type: 'footer', label: 'Футер', icon: 'lucide:panel-bottom' },
]

// ---- тема / страницы / корень --------------------------------------------------

export interface Theme {
  style: 'business' | 'warm' | 'techno' | 'custom'
  primary_color: string
  font: 'Inter' | 'Roboto' | 'PT Sans' | 'Montserrat'
  logo_url: string
  custom_css: string
}

export interface Page {
  slug: string
  title: string
  sections: Section[]
}

export type SiteType = 'landing' | 'shop' | 'multipage' | 'crm'

export interface SiteSchema {
  project_id: string
  type: SiteType
  theme: Theme
  pages: Page[]
}

export const COLOR_PRESETS: Record<Theme['style'], string> = {
  business: '#2563EB',
  warm: '#C17A4E',
  techno: '#7C3AED',
  custom: '#2563EB',
}

export const FONT_OPTIONS: Theme['font'][] = ['Inter', 'Roboto', 'PT Sans', 'Montserrat']

// Зеркало SECTION_VARIANTS из backend/app/schemas/site.py — каждый тип блока
// имеет несколько визуальных вариантов. text_image сюда не входит — у него
// своя ось вариативности через image_position (left/right).
export const SECTION_VARIANTS: Record<Exclude<SectionType, 'text_image'>, string[]> = {
  header: ['standard', 'centered', 'split', 'minimal'],
  hero: ['centered', 'split', 'minimal', 'gradient', 'overlay'],
  grid_3col: ['cards', 'icon_rows', 'minimal_list', 'icon_top', 'compact_grid'],
  pricing: ['cards', 'highlight', 'table', 'minimal'],
  testimonials: ['cards', 'quotes', 'avatars_row', 'single_featured'],
  contact_map: ['centered', 'split', 'cards'],
  footer: ['simple', 'columns', 'minimal'],
}

export const SECTION_VARIANT_LABELS: Record<string, string> = {
  standard: 'Стандартный',
  centered: 'По центру',
  split: 'Разделённый',
  minimal: 'Минимальный',
  cards: 'Карточки',
  icon_rows: 'Строки',
  minimal_list: 'Список',
  icon_top: 'С иконкой',
  compact_grid: 'Компактная сетка',
  highlight: 'С акцентом',
  table: 'Таблица',
  quotes: 'Цитаты',
  avatars_row: 'С аватарами',
  single_featured: 'Один крупный',
  simple: 'Простой',
  columns: 'Колонки',
  gradient: 'Градиент',
  overlay: 'Фото с подложкой',
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  header: 'Шапка',
  hero: 'Герой',
  text_image: 'Текст + Картинка',
  grid_3col: 'Услуги — сетка',
  pricing: 'Цены',
  testimonials: 'Отзывы',
  contact_map: 'Карта + Контакты',
  footer: 'Футер',
}

/** Значения по умолчанию для блока, вставляемого через DnD из вкладки «Блоки». */
export function createDefaultSection(type: SectionType): Section {
  const id = `${type}-${Math.random().toString(36).slice(2, 9)}`
  switch (type) {
    case 'header':
      return { id, type, variant: 'standard', logo_text: 'Логотип', nav_items: [], sticky: false, cta_text: '' }
    case 'hero':
      return {
        id,
        type,
        variant: 'centered',
        title: 'Заголовок',
        subtitle: 'Подзаголовок',
        cta_text: 'Узнать больше',
        cta_href: '#',
        bg_image: '',
      }
    case 'text_image':
      return { id, type, title: 'О нас', text: 'Расскажите о своей компании', image: '', image_position: 'right' }
    case 'grid_3col':
      return { id, type, variant: 'cards', title: 'Наши услуги', items: [], cta_text: '' }
    case 'pricing':
      return { id, type, variant: 'cards', title: 'Тарифы', plans: [] }
    case 'testimonials':
      return { id, type, variant: 'cards', title: 'Отзывы клиентов', items: [] }
    case 'contact_map':
      return {
        id,
        type,
        variant: 'centered',
        title: 'Контакты',
        address: '',
        phone: '',
        email: '',
        map_embed_url: '',
        show_map: true,
      }
    case 'footer':
      return { id, type, variant: 'simple', company_name: '', copyright_text: '', links: [], socials: [] }
  }
}
