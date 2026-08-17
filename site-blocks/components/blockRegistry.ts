import type { Component } from 'vue'
import type { SectionType } from '~/types/site'

import Header from './blocks/Header/Header.vue'
import Hero from './blocks/Hero/Hero.vue'
import TextImage from './blocks/TextImage/TextImage.vue'
import Grid3Col from './blocks/Grid3Col/Grid3Col.vue'
import Pricing from './blocks/Pricing/Pricing.vue'
import Testimonials from './blocks/Testimonials/Testimonials.vue'
import ContactMap from './blocks/ContactMap/ContactMap.vue'
import Footer from './blocks/Footer/Footer.vue'
import CatalogFilter from './blocks/CatalogFilter/CatalogFilter.vue'
import Faq from './blocks/Faq/Faq.vue'
import Gallery from './blocks/Gallery/Gallery.vue'
import Stats from './blocks/Stats/Stats.vue'
import LeadForm from './blocks/LeadForm/LeadForm.vue'
import CustomContent from './blocks/CustomContent/CustomContent.vue'

/**
 * type -> компонент-диспетчер блока. Явная статическая карта вместо строкового
 * resolveComponent()/global:true — components/ этого слоя зарегистрированы БЕЗ
 * global:true (см. nuxt.config.ts), а строка section.type не мапится на имя
 * компонента механически (grid_3col -> Grid3Col, contact_map -> ContactMap),
 * так что явная карта надёжнее и проще, чем полагаться на поведение автоимпорта.
 * Новый тип блока — это одна новая запись здесь (плюс сама Section.vue-пара).
 */
export const SECTION_COMPONENT_MAP: Record<SectionType, Component> = {
  header: Header,
  hero: Hero,
  text_image: TextImage,
  grid_3col: Grid3Col,
  pricing: Pricing,
  testimonials: Testimonials,
  contact_map: ContactMap,
  footer: Footer,
  catalog_filter: CatalogFilter,
  faq: Faq,
  gallery: Gallery,
  stats: Stats,
  lead_form: LeadForm,
  custom_content: CustomContent,
}
