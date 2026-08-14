<script setup lang="ts">
import type { StatsSection } from '~/types/site'

defineProps<{
  section: StatsSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<StatsSection>]
  select: []
}>()

function onUpdate(patch: Partial<StatsSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <StatsRow :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
