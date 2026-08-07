// Зеркало JSON-схемы сайта из backend/app/schemas/site.py — единый контракт
// между Orchestrator (бэкенд) и рендерером превью (фронтенд), ТЗ п.3-4.

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ServiceItem {
  name: string;
  description: string;
  price: string;
  icon: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
}

export interface Testimonial {
  author: string;
  text: string;
  avatar: string;
  rating: number;
}

export type HeaderVariant = "standard" | "centered" | "split" | "minimal";
export type HeroVariant = "centered" | "split" | "minimal" | "gradient" | "overlay";
export type Grid3ColVariant = "cards" | "icon_rows" | "minimal_list" | "icon_top" | "compact_grid";
export type PricingVariant = "cards" | "highlight" | "table" | "minimal";
export type TestimonialsVariant = "cards" | "quotes" | "avatars_row" | "single_featured";
export type ContactMapVariant = "centered" | "split" | "cards";
export type FooterVariant = "simple" | "columns" | "minimal";

export interface HeaderSection {
  id: string;
  type: "header";
  variant: HeaderVariant;
  logo_text: string;
  nav_items: NavItem[];
  sticky: boolean;
  cta_text: string;
}

export interface HeroSection {
  id: string;
  type: "hero";
  variant: HeroVariant;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_href: string;
  bg_image: string;
}

export interface TextImageSection {
  id: string;
  type: "text_image";
  title: string;
  text: string;
  image: string;
  image_position: "left" | "right";
}

export interface Grid3ColSection {
  id: string;
  type: "grid_3col";
  variant: Grid3ColVariant;
  title: string;
  items: ServiceItem[];
  cta_text: string;
}

export interface PricingSection {
  id: string;
  type: "pricing";
  variant: PricingVariant;
  title: string;
  plans: PricingPlan[];
}

export interface TestimonialsSection {
  id: string;
  type: "testimonials";
  variant: TestimonialsVariant;
  title: string;
  items: Testimonial[];
}

export interface ContactMapSection {
  id: string;
  type: "contact_map";
  variant: ContactMapVariant;
  title: string;
  address: string;
  phone: string;
  email: string;
  map_embed_url: string;
  show_map: boolean;
}

export interface FooterSection {
  id: string;
  type: "footer";
  variant: FooterVariant;
  company_name: string;
  copyright_text: string;
  links: NavItem[];
  socials: SocialLink[];
}

export type Section =
  | HeaderSection
  | HeroSection
  | TextImageSection
  | Grid3ColSection
  | PricingSection
  | TestimonialsSection
  | ContactMapSection
  | FooterSection;

export type SectionType = Section["type"];

export const BLOCK_LIBRARY: { type: SectionType; label: string }[] = [
  { type: "header", label: "Шапка" },
  { type: "hero", label: "Герой" },
  { type: "text_image", label: "Текст+Картинка" },
  { type: "grid_3col", label: "Услуги-сетка" },
  { type: "pricing", label: "Цены" },
  { type: "testimonials", label: "Отзывы" },
  { type: "contact_map", label: "Карта+Контакты" },
  { type: "footer", label: "Футер" },
];

export interface Theme {
  style: "business" | "warm" | "techno" | "custom";
  primary_color: string;
  font: "Inter" | "Roboto" | "PT Sans" | "Montserrat";
  logo_url: string;
  custom_css: string;
}

export interface Page {
  slug: string;
  title: string;
  sections: Section[];
}

export type SiteType = "landing" | "shop" | "multipage" | "crm";

export interface SiteSchema {
  project_id: string;
  type: SiteType;
  theme: Theme;
  pages: Page[];
}

export const COLOR_PRESETS: Record<Theme["style"], string> = {
  business: "#2563EB",
  warm: "#C17A4E",
  techno: "#7C3AED",
  custom: "#2563EB",
};

export const FONT_OPTIONS: Theme["font"][] = ["Inter", "Roboto", "PT Sans", "Montserrat"];

export const FONT_STACKS: Record<Theme["font"], string> = {
  Inter: "'Inter', system-ui, sans-serif",
  Roboto: "'Roboto', system-ui, sans-serif",
  "PT Sans": "'PT Sans', system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
};

// Зеркало SECTION_VARIANTS из backend/app/schemas/site.py — каждый тип блока
// имеет несколько визуальных вариантов, чтобы сгенерированные сайты не были
// одинаковыми по вёрстке. text_image сюда не входит — там своя ось
// вариативности через image_position (left/right).
export const SECTION_VARIANTS: Record<Exclude<SectionType, "text_image">, string[]> = {
  header: ["standard", "centered", "split", "minimal"],
  hero: ["centered", "split", "minimal", "gradient", "overlay"],
  grid_3col: ["cards", "icon_rows", "minimal_list", "icon_top", "compact_grid"],
  pricing: ["cards", "highlight", "table", "minimal"],
  testimonials: ["cards", "quotes", "avatars_row", "single_featured"],
  contact_map: ["centered", "split", "cards"],
  footer: ["simple", "columns", "minimal"],
};

export const SECTION_VARIANT_LABELS: Record<string, string> = {
  standard: "Стандартный",
  centered: "По центру",
  split: "Разделённый",
  minimal: "Минимальный",
  cards: "Карточки",
  icon_rows: "Строки",
  minimal_list: "Список",
  icon_top: "С иконкой",
  compact_grid: "Компактная сетка",
  highlight: "С акцентом",
  table: "Таблица",
  quotes: "Цитаты",
  avatars_row: "С аватарами",
  single_featured: "Один крупный",
  simple: "Простой",
  columns: "Колонки",
  gradient: "Градиент",
  overlay: "Фото с подложкой",
};
