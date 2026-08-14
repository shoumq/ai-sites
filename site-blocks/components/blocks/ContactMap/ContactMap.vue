<script setup lang="ts">
import type { ContactMapSection } from '~/types/site'

const props = defineProps<{
  section: ContactMapSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<ContactMapSection>]
  select: []
}>()

function onUpdate(patch: Partial<ContactMapSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <ContactMapCentered
    v-if="section.variant === 'centered'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <ContactMapSplit
    v-else-if="section.variant === 'split'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <ContactMapCards
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
