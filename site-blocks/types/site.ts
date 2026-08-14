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

export interface HeaderSection {
  id: string
  type: 'header'
  variant: 'standard' | 'centered' | 'split' | 'minimal'
  logo_text: string
  nav_items: NavItem[]
  sticky: boolean
  cta_text: string
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
  // у этого блока нет variant — своя ось через image_position
  title: string
  text: string
  image: string
  image_position: 'left' | 'right'
  bg_color: string
}

export interface Grid3ColSection {
  id: string
  type: 'grid_3col'
  variant: 'cards' | 'icon_rows' | 'minimal_list' | 'icon_top' | 'compact_grid'
  title: string
  items: ServiceItem[]
  cta_text: string
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

// ---- тема / страницы / корень --------------------------------------------------

export interface Theme {
  style: 'business' | 'warm' | 'techno' | 'custom'
  primary_color: string
  font: 'Inter' | 'Roboto' | 'PT Sans' | 'Montserrat'
  logo_url: string
  custom_css: string
  bg_color: string
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
