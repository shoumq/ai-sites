import type { CatalogItem } from '~/types/site'

/**
 * Реактивная фильтрация каталога по категории — работает на клиенте после
 * гидратации статической Nuxt-сборки (как и v-motion в Grid3ColCards) — это
 * не генерируется ИИ, а обычная client-side реактивность Vue, прибитая к
 * компоненту раз и навсегда.
 */
export function useCatalogFilter(items: Ref<CatalogItem[]>, categories: Ref<string[]>) {
  const activeCategory = ref('all')

  const availableCategories = computed(() => {
    if (categories.value.length) return categories.value
    return [...new Set(items.value.map((item) => item.category).filter(Boolean))]
  })

  const filtered = computed(() =>
    items.value
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => activeCategory.value === 'all' || item.category === activeCategory.value),
  )

  function setCategory(category: string) {
    activeCategory.value = category
  }

  return { activeCategory, availableCategories, filtered, setCategory }
}
