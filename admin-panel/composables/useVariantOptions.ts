import { SECTION_VARIANTS, SECTION_VARIANT_LABELS } from '~/types/site'
import type { SectionType } from '~/types/site'

/** Список {value,label} вариантов оформления блока для BaseSelect в редакторах
 * вкладки «Конструктор». Исключений больше нет: variant появился и у text_image
 * (ось image_position работает поверх варианта), и у custom_content стало три
 * реальных варианта вместо единственного 'standard'. */
export function useVariantOptions() {
  function variantOptions(type: SectionType) {
    return SECTION_VARIANTS[type].map((v) => ({ value: v, label: SECTION_VARIANT_LABELS[v] ?? v }))
  }
  return { variantOptions }
}
