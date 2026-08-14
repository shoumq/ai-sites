<script setup lang="ts">
import type { CatalogFilterSection } from '~/types/site'

defineProps<{
  section: CatalogFilterSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<CatalogFilterSection>]
  select: []
}>()

function onUpdate(patch: Partial<CatalogFilterSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <CatalogFilterGrid :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
