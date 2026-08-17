import type { CatalogItem } from '~/types/site'

/**
 * Реактивная фильтрация каталога по категории и поиску — работает на клиенте
 * после гидратации статической Nuxt-сборки (как и v-motion в Grid3ColCards):
 * это не генерируется ИИ, а обычная client-side реактивность Vue, прибитая к
 * компоненту раз и навсегда.
 *
 * Состояние держится здесь, а не в каждом варианте вёрстки каталога, чтобы
 * grid/list/showcase фильтровались одинаково и не разъезжались.
 */
export function useCatalogFilter(items: Ref<CatalogItem[]>, categories: Ref<string[]>) {
  const activeCategory = ref('all')
  const query = ref('')

  const availableCategories = computed(() => {
    if (categories.value.length) return categories.value
    return [...new Set(items.value.map((item) => item.category).filter(Boolean))]
  })

  const filtered = computed(() => {
    const needle = query.value.trim().toLowerCase()
    return items.value
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => activeCategory.value === 'all' || item.category === activeCategory.value)
      .filter(({ item }) => {
        if (!needle) return true
        return `${item.name} ${item.description} ${item.sku ?? ''}`.toLowerCase().includes(needle)
      })
  })

  function setCategory(category: string) {
    activeCategory.value = category
  }

  return { activeCategory, query, availableCategories, filtered, setCategory }
}
