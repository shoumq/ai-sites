/**
 * TypeScript-контракт сайта — буквальное зеркало backend/app/schemas/site.py (Pydantic).
 * Поля snake_case НЕ переименовываются: это provider-agnostic JSON, которым бэкенд
 * обменивается с фронтом (site-renderer, admin-panel). Не меняй имена полей здесь
 * без синхронной правки backend/app/schemas/site.py.
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
  image: string
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

export interface CatalogItem {
  name: string
  description: string
  price: string
  old_price: string
  category: string
  image: string
  badge: string
  sku: string
  in_stock: boolean
}

export interface FaqItem {
  question: string
  answer: string
}

export interface GalleryItem {
  image: string
  caption: string
}

export interface StatItem {
  value: string
  label: string
}

export interface CustomContentItem {
  label: string
  value: string
}

export interface LeadFormField {
  name: string
  label: string
  type: 'text' | 'tel' | 'email' | 'textarea' | 'select'
  required: boolean
  placeholder: string
  options: string[]
}

/**
 * Что делает кнопка на карточке товара/услуги:
 *  none — витрина без кнопки;
 *  lead — «Оставить заявку», открывает модальную форму с контекстом товара;
 *  cart — «В корзину» (см. composables/useCart.ts).
 * Ровно эта ось отличает каталог автомобилей (заявки, без корзины) от
 * интернет-магазина (корзина и оформление заказа).
 */
export type ItemAction = 'none' | 'lead' | 'cart'

// ---- секции ------------------------------------------------------------------

export interface HeaderSection {
  id: string
  type: 'header'
  variant: 'standard' | 'centered' | 'split' | 'minimal'
  logo_text: string
  nav_items: NavItem[]
  sticky: boolean
  cta_text: string
  show_cart: boolean
  bg_color: string
}

export interface HeroSection {
  id: string
  type: 'hero'
  variant: 'centered' | 'split' | 'minimal' | 'gradient' | 'overlay'
  title: string
  subtitle: string
  cta_text: string
  cta_href: string
  bg_image: string
  bg_color: string
}

export interface TextImageSection {
  id: string
  type: 'text_image'
  // Ось image_position (left/right) работает поверх любого варианта.
  variant: 'standard' | 'overlap' | 'card'
  title: string
  text: string
  image: string
  image_position: 'left' | 'right'
  bg_color: string
}

export interface Grid3ColSection {
  id: string
  type: 'grid_3col'
  variant: 'cards' | 'icon_rows' | 'minimal_list' | 'icon_top' | 'compact_grid' | 'photo_cards'
  title: string
  items: ServiceItem[]
  cta_text: string
  action: ItemAction
  action_text: string
  bg_color: string
}

export interface PricingSection {
  id: string
  type: 'pricing'
  variant: 'cards' | 'highlight' | 'table' | 'minimal'
  title: string
  plans: PricingPlan[]
  bg_color: string
}

export interface TestimonialsSection {
  id: string
  type: 'testimonials'
  variant: 'cards' | 'quotes' | 'avatars_row' | 'single_featured'
  title: string
  items: Testimonial[]
  bg_color: string
}

export interface ContactMapSection {
  id: string
  type: 'contact_map'
  variant: 'centered' | 'split' | 'cards'
  title: string
  address: string
  phone: string
  email: string
  map_embed_url: string
  show_map: boolean
  bg_color: string
}

export interface FooterSection {
  id: string
  type: 'footer'
  variant: 'simple' | 'columns' | 'minimal'
  company_name: string
  copyright_text: string
  links: NavItem[]
  socials: SocialLink[]
  bg_color: string
}

export interface CatalogFilterSection {
  id: string
  type: 'catalog_filter'
  variant: 'grid' | 'list' | 'showcase'
  title: string
  categories: string[]
  items: CatalogItem[]
  action: ItemAction
  action_text: string
  show_search: boolean
  bg_color: string
}

export interface FaqSection {
  id: string
  type: 'faq'
  variant: 'accordion' | 'two_columns' | 'plain'
  title: string
  items: FaqItem[]
  bg_color: string
}

export interface GallerySection {
  id: string
  type: 'gallery'
  variant: 'grid' | 'masonry' | 'slider'
  title: string
  items: GalleryItem[]
  bg_color: string
}

export interface StatsSection {
  id: string
  type: 'stats'
  variant: 'row' | 'cards' | 'big_numbers'
  title: string
  items: StatItem[]
  bg_color: string
}

export interface LeadFormSection {
  id: string
  type: 'lead_form'
  variant: 'split' | 'card' | 'inline'
  title: string
  subtitle: string
  fields: LeadFormField[]
  submit_text: string
  success_text: string
  consent_text: string
  image: string
  bg_color: string
}

export interface CustomContentSection {
  id: string
  type: 'custom_content'
  variant: 'standard' | 'callout' | 'columns'
  title: string
  body: string
  items: CustomContentItem[]
  bg_color: string
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
  | CatalogFilterSection
  | FaqSection
  | GallerySection
  | StatsSection
  | LeadFormSection
  | CustomContentSection

export type SectionType = Section['type']

// ---- тема / страницы / корень --------------------------------------------------

/**
 * Оси вёрстки темы — сквозные параметры, меняющие пропорции и характер ВСЕХ
 * блоков сразу. Реализованы CSS-переменными и классами на <html>
 * (composables/useSiteTheme.ts + assets/tokens.css), новых компонентов не
 * требуют — именно они дают разным сайтам разный характер при совпадающем
 * наборе блоков.
 */
export interface Theme {
  style: 'business' | 'warm' | 'techno' | 'custom'
  primary_color: string
  font: 'Inter' | 'Roboto' | 'PT Sans' | 'Montserrat'
  logo_url: string
  custom_css: string
  bg_color: string
  radius: 'sharp' | 'soft' | 'round'
  density: 'compact' | 'cozy' | 'airy'
  container_width: 'narrow' | 'normal' | 'wide'
  heading_style: 'plain' | 'eyebrow' | 'underline' | 'gradient'
  button_style: 'solid' | 'outline' | 'pill' | 'ghost'
  section_divider: 'none' | 'line' | 'tilt' | 'wave'
}

export interface Page {
  slug: string
  title: string
  sections: Section[]
}

export interface SiteSchema {
  project_id: string
  type: 'landing' | 'shop' | 'multipage' | 'crm'
  theme: Theme
  pages: Page[]
}

/** Есть ли на сайте блок, кладущий товар в корзину. Зеркало site_uses_cart()
 *  из backend/app/schemas/site.py. */
export function siteUsesCart(site: SiteSchema): boolean {
  return site.pages.some((page) =>
    page.sections.some(
      (section) =>
        ('action' in section && section.action === 'cart') || ('show_cart' in section && section.show_cart),
    ),
  )
}
