import { computed, onMounted, watch } from 'vue'
import { useState } from '#imports'

/**
 * Корзина интернет-магазина на статическом сайте.
 *
 * Состояние живёт целиком в браузере (localStorage) — у сгенерированного сайта
 * нет своего бэкенда, а серверу платформы корзина не нужна до момента, когда
 * посетитель оформляет заказ (тогда её состав уезжает заявкой типа `order`,
 * см. useSiteForms.ts).
 *
 * SSR/prerender: `nuxi generate` исполняет этот код в Node, где localStorage
 * нет — поэтому чтение вынесено в onMounted, а не в инициализатор состояния.
 * Иначе сборка падала бы на `localStorage is not defined`, а если бы и не
 * упала — состав корзины «запёкся» бы в статический HTML на этапе сборки.
 */

const STORAGE_KEY = 'ai-sites-cart-v1'

export interface CartItem {
  /** Стабильный ключ позиции: sku, если он есть, иначе название. */
  key: string
  name: string
  /** Исходная строка цены («от 1 500 ₽») — показывается как есть. */
  price: string
  /** Разобранное числовое значение цены; 0, если цену не удалось разобрать. */
  priceValue: number
  image: string
  sku: string
  qty: number
}

/** «от 1 500 ₽» -> 1500. Возвращает 0, если чисел в строке нет. */
export function parsePrice(price: string): number {
  if (!price) return 0
  // Пробелы (в т.ч. неразрывные) — разделители разрядов, запятая — дробная часть.
  const normalized = price.replace(/[\s  ]/g, '').replace(',', '.')
  const match = normalized.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}

export function formatMoney(value: number, currency: string): string {
  return `${value.toLocaleString('ru-RU')} ${currency}`.trim()
}

/**
 * Поднимает корзину из localStorage и включает её сохранение.
 *
 * Вызывается РОВНО ОДИН раз из SiteOverlays.vue — компонента, который живёт всё
 * время жизни страницы. Если бы watcher создавался внутри useCart(), он бы
 * принадлежал области видимости первого попавшегося компонента (например,
 * кнопки «В корзину» в карточке товара) и умирал вместе с ним — при
 * перерисовке каталога корзина переставала бы сохраняться.
 */
export function initCart() {
  const items = useState<CartItem[]>('site-cart', () => [])

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (Array.isArray(parsed)) {
        items.value = parsed.filter((item) => item && typeof item.key === 'string' && typeof item.qty === 'number')
      }
    } catch {
      // Битый/недоступный localStorage (приватный режим, квота) — корзина
      // просто стартует пустой, ронять сайт из-за этого нельзя.
    }

    watch(
      items,
      (value) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          /* см. выше */
        }
      },
      { deep: true },
    )
  })
}

export function useCart() {
  const items = useState<CartItem[]>('site-cart', () => [])
  const isOpen = useState<boolean>('site-cart-open', () => false)

  const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))
  const total = computed(() => items.value.reduce((sum, item) => sum + item.priceValue * item.qty, 0))
  /** Цену удалось разобрать хотя бы у одной позиции — иначе «Итого» бессмысленно. */
  const hasTotal = computed(() => items.value.some((item) => item.priceValue > 0))

  function add(product: { name: string; price?: string; image?: string; sku?: string }, qty = 1) {
    const key = product.sku || product.name
    const existing = items.value.find((item) => item.key === key)
    if (existing) {
      existing.qty += qty
    } else {
      items.value = [
        ...items.value,
        {
          key,
          name: product.name,
          price: product.price ?? '',
          priceValue: parsePrice(product.price ?? ''),
          image: product.image ?? '',
          sku: product.sku ?? '',
          qty,
        },
      ]
    }
  }

  function setQty(key: string, qty: number) {
    if (qty <= 0) {
      remove(key)
      return
    }
    items.value = items.value.map((item) => (item.key === key ? { ...item, qty } : item))
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

  return { items, isOpen, count, total, hasTotal, add, setQty, remove, clear, open, close }
}
