<script setup lang="ts">
import type { CatalogItem } from '~/types/site'

const props = withDefaults(defineProps<{ product: CatalogItem; editable?: boolean; withLabel?: boolean }>(), {
  editable: false,
  withLabel: false,
})
const favorites = useFavorites()
const active = computed(() => favorites.has(props.product))

function toggle() {
  if (!props.editable) favorites.toggle(props.product)
}
</script>

<template>
  <button
    type="button"
    class="favorite-button"
    :class="{ 'is-active': active, 'has-label': withLabel }"
    :aria-label="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    :aria-pressed="active"
    @click.stop="toggle"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" :fill="active ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span v-if="withLabel">{{ active ? 'В избранном' : 'В избранное' }}</span>
  </button>
</template>

<style scoped>
.favorite-button { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); width: 42px; height: 42px; padding: 0; border: 1px solid var(--border-color); border-radius: var(--radius-control); background: color-mix(in srgb, var(--surface) 82%, transparent); color: var(--text-muted); backdrop-filter: blur(18px) saturate(150%); cursor: pointer; transition: color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast), background var(--transition-fast); }
.favorite-button:hover { color: #e11d48; border-color: color-mix(in srgb, #e11d48 55%, var(--border-color)); transform: translateY(-1px); }
.favorite-button.is-active { color: #e11d48; border-color: color-mix(in srgb, #e11d48 45%, var(--border-color)); background: color-mix(in srgb, #e11d48 10%, var(--surface)); }
.favorite-button.has-label { width: auto; padding: 0 var(--space-4); font-family: inherit; font-weight: 650; }
</style>
