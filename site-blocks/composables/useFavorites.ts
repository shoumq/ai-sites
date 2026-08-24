import { computed, onMounted, watch } from 'vue'
import { useState } from '#imports'
import type { CatalogItem } from '~/types/site'

const STORAGE_KEY = 'ai-sites-favorites-v1'

export interface FavoriteItem extends CatalogItem {
  key: string
}

function productKey(product: Pick<CatalogItem, 'name' | 'sku'>) {
  return product.sku || product.name
}

export function initFavorites() {
  const items = useState<FavoriteItem[]>('site-favorites', () => [])

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (Array.isArray(parsed)) items.value = parsed.filter((item) => item && typeof item.key === 'string')
    } catch {
      // Недоступный или повреждённый localStorage не должен ломать сайт.
    }

    watch(items, (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* см. выше */
      }
    }, { deep: true })
  })
}

export function useFavorites() {
  const items = useState<FavoriteItem[]>('site-favorites', () => [])
  const isOpen = useState<boolean>('site-favorites-open', () => false)
  const count = computed(() => items.value.length)

  function has(product: Pick<CatalogItem, 'name' | 'sku'>) {
    const key = productKey(product)
    return items.value.some((item) => item.key === key)
  }

  function toggle(product: CatalogItem) {
    const key = productKey(product)
    if (has(product)) {
      items.value = items.value.filter((item) => item.key !== key)
      return false
    }
    items.value = [...items.value, { ...product, key }]
    return true
  }

  function remove(key: string) {
    items.value = items.value.filter((item) => item.key !== key)
  }

  function clear() {
    items.value = []
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { items, isOpen, count, has, toggle, remove, clear, open, close }
}
