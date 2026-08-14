<script setup lang="ts">
import type { FaqSection } from '~/types/site'

defineProps<{
  section: FaqSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FaqSection>]
  select: []
}>()

function onUpdate(patch: Partial<FaqSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <FaqAccordion :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
