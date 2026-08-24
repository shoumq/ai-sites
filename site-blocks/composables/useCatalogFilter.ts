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
    const declared = categories.value.map((category) => category.trim()).filter(Boolean)
    const fromItems = items.value.map((item) => item.category.trim()).filter(Boolean)
    const seen = new Set<string>()
    return [...declared, ...fromItems].filter((category) => {
      const key = normalize(category)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })

  const filtered = computed(() => {
    const needle = query.value.trim().toLowerCase()
    return items.value
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => activeCategory.value === 'all' || normalize(item.category) === normalize(activeCategory.value))
      .filter(({ item }) => {
        if (!needle) return true
        return `${item.name} ${item.description} ${item.sku ?? ''}`.toLowerCase().includes(needle)
      })
  })

  function setCategory(category: string) {
    activeCategory.value = category
  }

  function reset() {
    activeCategory.value = 'all'
    query.value = ''
  }

  watch(availableCategories, (next) => {
    if (activeCategory.value !== 'all' && !next.some((category) => normalize(category) === normalize(activeCategory.value))) {
      activeCategory.value = 'all'
    }
  })

  return { activeCategory, query, availableCategories, filtered, setCategory, reset }
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU')
}
