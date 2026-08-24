<script setup lang="ts">
import type { CatalogItem } from '~/types/site'

const props = withDefaults(defineProps<{ product: CatalogItem; editable?: boolean; compact?: boolean }>(), {
  editable: false,
  compact: false,
})
const { openProductDetails } = useProductDetails()

function open() {
  if (!props.editable) openProductDetails(props.product)
}
</script>

<template>
  <button type="button" class="details-button" :class="{ 'is-compact': compact }" @click.stop="open">
    Подробнее
  </button>
</template>

<style scoped>
.details-button { min-height: 40px; padding: var(--space-2) var(--space-4); border: 1px solid var(--border-color); border-radius: var(--btn-radius); background: transparent; color: var(--text); font: inherit; font-size: var(--fs-sm); font-weight: 650; cursor: pointer; transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast); }
.details-button:hover { border-color: var(--primary); color: var(--primary); background: color-mix(in srgb, var(--primary) 7%, transparent); }
.details-button.is-compact { min-height: 34px; padding: 5px var(--space-3); }
</style>
