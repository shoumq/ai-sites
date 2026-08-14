/**
 * TypeScript-контракт сайта — реэкспорт из site-blocks/types/site.ts (который
 * сам зеркалит backend/app/schemas/site.py), единственный канонический источник
 * интерфейсов. Файл физически существует здесь (а не просто импортируется в
 * компонентах), потому что alias `~` внутри Nuxt-слоя резолвится относительно
 * srcDir ПОТРЕБЛЯЮЩЕГО приложения (проверено генерируемым .nuxt/tsconfig.json —
 * "~/*" маппится на корень admin-panel, а не site-blocks), поэтому
 * `~/types/site`, на который ссылаются компоненты site-blocks (SectionRenderer.vue
 * и т.д.), обязан существовать здесь физически. Обычный относительный импорт
 * ниже с этой Nuxt-особенностью не конфликтует — это просто чтение соседнего
 * .ts файла, а не alias-резолюция.
 *
 * Ниже — только admin-only довески (лейблы для UI, BLOCK_LIBRARY для панели
 * вставки блока, createDefaultSection). Сами поля/типы секций не дублируются:
 * правь их в site-blocks/types/site.ts + backend/app/schemas/site.py.
 */
export * from '../../site-blocks/types/site'

import type { Section, SectionType, Theme } from '../../site-blocks/types/site'

export type SiteType = 'landing' | 'shop' | 'multipage' | 'crm'

export const BLOCK_LIBRARY: { type: SectionType; label: string; icon: string }[] = [
  { type: 'header', label: 'Шапка', icon: 'lucide:panel-top' },
  { type: 'hero', label: 'Герой', icon: 'lucide:layout-template' },
  { type: 'text_image', label: 'Текст + Картинка', icon: 'lucide:image' },
  { type: 'grid_3col', label: 'Услуги — сетка', icon: 'lucide:layout-grid' },
  { type: 'pricing', label: 'Цены', icon: 'lucide:tags' },
  { type: 'testimonials', label: 'Отзывы', icon: 'lucide:quote' },
  { type: 'contact_map', label: 'Карта + Контакты', icon: 'lucide:map-pin' },
  { type: 'footer', label: 'Футер', icon: 'lucide:panel-bottom' },
  { type: 'catalog_filter', label: 'Каталог с фильтром', icon: 'lucide:filter' },
  { type: 'faq', label: 'Вопросы (FAQ)', icon: 'lucide:help-circle' },
  { type: 'gallery', label: 'Галерея', icon: 'lucide:images' },
  { type: 'stats', label: 'Статистика', icon: 'lucide:bar-chart-3' },
  { type: 'custom_content', label: 'Произвольный блок', icon: 'lucide:file-text' },
]

export const COLOR_PRESETS: Record<Theme['style'], string> = {
  business: '#2563EB',
  warm: '#C17A4E',
  techno: '#7C3AED',
  custom: '#2563EB',
}

export const FONT_OPTIONS: Theme['font'][] = ['Inter', 'Roboto', 'PT Sans', 'Montserrat']

// Зеркало SECTION_VARIANTS из backend/app/schemas/site.py — каждый тип блока
// имеет несколько визуальных вариантов. text_image сюда не входит — у него
// своя ось вариативности через image_position (left/right). custom_content
// формально имеет variant, но с единственным значением 'standard' — сюда всё
// равно включён для единообразия UI (выбирать там нечего, но поле есть).
export const SECTION_VARIANTS: Record<Exclude<SectionType, 'text_image'>, string[]> = {
  header: ['standard', 'centered', 'split', 'minimal'],
  hero: ['centered', 'split', 'minimal', 'gradient', 'overlay'],
  grid_3col: ['cards', 'icon_rows', 'minimal_list', 'icon_top', 'compact_grid'],
  pricing: ['cards', 'highlight', 'table', 'minimal'],
  testimonials: ['cards', 'quotes', 'avatars_row', 'single_featured'],
  contact_map: ['centered', 'split', 'cards'],
  footer: ['simple', 'columns', 'minimal'],
  catalog_filter: ['grid'],
  faq: ['accordion'],
  gallery: ['grid'],
  stats: ['row'],
  custom_content: ['standard'],
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
  grid: 'Сетка',
  accordion: 'Аккордеон',
  row: 'Строка',
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
  catalog_filter: 'Каталог с фильтром',
  faq: 'Вопросы (FAQ)',
  gallery: 'Галерея',
  stats: 'Статистика',
  custom_content: 'Произвольный блок',
}

/** Значения по умолчанию для блока, вставляемого через DnD из вкладки «Блоки». */
export function createDefaultSection(type: SectionType): Section {
  const id = `${type}-${Math.random().toString(36).slice(2, 9)}`
  switch (type) {
    case 'header':
      return {
        id,
        type,
        variant: 'standard',
        logo_text: 'Логотип',
        nav_items: [],
        sticky: false,
        cta_text: '',
        bg_color: '',
      }
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
        bg_color: '',
      }
    case 'text_image':
      return {
        id,
        type,
        title: 'О нас',
        text: 'Расскажите о своей компании',
        image: '',
        image_position: 'right',
        bg_color: '',
      }
    case 'grid_3col':
      return { id, type, variant: 'cards', title: 'Наши услуги', items: [], cta_text: '', bg_color: '' }
    case 'pricing':
      return { id, type, variant: 'cards', title: 'Тарифы', plans: [], bg_color: '' }
    case 'testimonials':
      return { id, type, variant: 'cards', title: 'Отзывы клиентов', items: [], bg_color: '' }
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
        bg_color: '',
      }
    case 'footer':
      return {
        id,
        type,
        variant: 'simple',
        company_name: '',
        copyright_text: '',
        links: [],
        socials: [],
        bg_color: '',
      }
    case 'catalog_filter':
      return { id, type, variant: 'grid', title: 'Каталог', categories: [], items: [], bg_color: '' }
    case 'faq':
      return { id, type, variant: 'accordion', title: 'Частые вопросы', items: [], bg_color: '' }
    case 'gallery':
      return { id, type, variant: 'grid', title: 'Галерея', items: [], bg_color: '' }
    case 'stats':
      return { id, type, variant: 'row', title: '', items: [], bg_color: '' }
    case 'custom_content':
      return { id, type, variant: 'standard', title: '', body: '', items: [], bg_color: '' }
  }
}
