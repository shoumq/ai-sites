import { SECTION_VARIANTS, SECTION_VARIANT_LABELS } from '~/types/site'
import type { SectionType } from '~/types/site'

/** Список {value,label} вариантов оформления блока для BaseSelect в редакторах
 * вкладки «Конструктор» — text_image и custom_content сюда не входят (у первого
 * своя ось через image_position, у второго единственное значение variant, для
 * которого показывать выпадающий список незачем). */
export function useVariantOptions() {
  function variantOptions(type: Exclude<SectionType, 'text_image' | 'custom_content'>) {
    return SECTION_VARIANTS[type].map((v) => ({ value: v, label: SECTION_VARIANT_LABELS[v] ?? v }))
  }
  return { variantOptions }
}
