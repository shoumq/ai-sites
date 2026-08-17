<script setup lang="ts">
import type { LeadFormSection } from '~/types/site'

const props = defineProps<{
  section: LeadFormSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<LeadFormSection>]
  select: []
}>()

function onUpdate(patch: Partial<LeadFormSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <LeadFormCard
    v-if="section.variant === 'card'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <LeadFormInline
    v-else-if="section.variant === 'inline'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <LeadFormSplit v-else :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
