import type { Component } from 'vue'
import type { SectionType } from '~/types/site'

import HeaderEditor from './HeaderEditor.vue'
import HeroEditor from './HeroEditor.vue'
import TextImageEditor from './TextImageEditor.vue'
import Grid3ColEditor from './Grid3ColEditor.vue'
import PricingEditor from './PricingEditor.vue'
import TestimonialsEditor from './TestimonialsEditor.vue'
import ContactMapEditor from './ContactMapEditor.vue'
import FooterEditor from './FooterEditor.vue'
import CatalogFilterEditor from './CatalogFilterEditor.vue'
import FaqEditor from './FaqEditor.vue'
import GalleryEditor from './GalleryEditor.vue'
import StatsEditor from './StatsEditor.vue'
import CustomContentEditor from './CustomContentEditor.vue'

/** type -> компонент формы полей в ConstructorPanel.vue. Явная статическая
 * карта — тот же принцип, что и site-blocks/components/blockRegistry.ts. */
export const EDITOR_COMPONENT_MAP: Record<SectionType, Component> = {
  header: HeaderEditor,
  hero: HeroEditor,
  text_image: TextImageEditor,
  grid_3col: Grid3ColEditor,
  pricing: PricingEditor,
  testimonials: TestimonialsEditor,
  contact_map: ContactMapEditor,
  footer: FooterEditor,
  catalog_filter: CatalogFilterEditor,
  faq: FaqEditor,
  gallery: GalleryEditor,
  stats: StatsEditor,
  custom_content: CustomContentEditor,
}
