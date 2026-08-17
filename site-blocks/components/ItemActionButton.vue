<script setup lang="ts">
/**
 * Кнопка на карточке товара/услуги: «Оставить заявку» или «В корзину».
 *
 * Одна кнопка на оба сценария, потому что разница между каталогом с заявками
 * и магазином с корзиной — это ОДНО поле схемы (action), а не два разных типа
 * блока: вёрстка карточки, её отступы и место кнопки одинаковы. При action="none"
 * не рендерится ничего.
 */
import { computed, ref } from 'vue'
import type { ItemAction } from '~/types/site'

const props = withDefaults(
  defineProps<{
    action: ItemAction
    label?: string
    name: string
    price?: string
    image?: string
    sku?: string
    /** В редакторе кнопка не должна ни класть в корзину, ни открывать модалку. */
    editable?: boolean
    block?: boolean
  }>(),
  { label: '', price: '', image: '', sku: '', editable: false, block: false },
)

const cart = useCart()
const { openLeadModal } = useLeadModal()

const justAdded = ref(false)

const text = computed(() => {
  if (props.label) return props.label
  return props.action === 'cart' ? 'В корзину' : 'Оставить заявку'
})

function onClick() {
  if (props.editable) return

  if (props.action === 'cart') {
    cart.add({ name: props.name, price: props.price, image: props.image, sku: props.sku })
    // Короткое подтверждение прямо на кнопке вместо открытия корзины: при
    // покупке нескольких товаров подряд выезжающая панель только мешает.
    justAdded.value = true
    setTimeout(() => (justAdded.value = false), 1400)
    return
  }

  openLeadModal({ title: 'Оставить заявку', subject: props.name, sku: props.sku })
}
</script>

<template>
  <button
    v-if="action !== 'none'"
    class="item-action btn-primary"
    :class="{ 'is-block': block, 'is-done': justAdded }"
    type="button"
    @click.stop="onClick"
  >
    {{ justAdded ? 'Добавлено ✓' : text }}
  </button>
</template>

<style scoped>
.item-action {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--primary);
  color: #fff;
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.item-action:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.item-action.is-block {
  width: 100%;
}

.item-action.is-done {
  background: #16a34a;
}
</style>
