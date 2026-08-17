<script setup lang="ts">
/**
 * Иконка корзины со счётчиком для шапки сайта.
 *
 * Рендерится, только если корзина реально включена: и в схеме сайта
 * (header.show_cart), и в настройках проекта (runtime.cartEnabled). Второе
 * условие важно — сайт-каталог с заявками не должен показывать корзину, даже
 * если флаг в шапке случайно остался включённым после смены типа блоков.
 */
withDefaults(defineProps<{ editable?: boolean }>(), { editable: false })

const runtime = useSiteRuntime()
const { count, open } = useCart()
</script>

<template>
  <button
    v-if="runtime.cartEnabled"
    class="cart-button"
    type="button"
    aria-label="Корзина"
    @click.stop="editable ? undefined : open()"
  >
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
    <span v-if="count" class="cart-button__badge">{{ count }}</span>
  </button>
</template>

<style scoped>
.cart-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.cart-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.cart-button__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}
</style>
