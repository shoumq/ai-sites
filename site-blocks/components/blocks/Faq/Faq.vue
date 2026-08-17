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
  <FaqTwoColumns
    v-if="section.variant === 'two_columns'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <FaqPlain
    v-else-if="section.variant === 'plain'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <FaqAccordion v-else :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
