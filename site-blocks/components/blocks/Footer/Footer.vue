<script setup lang="ts">
import type { FooterSection } from '~/types/site'

const props = defineProps<{
  section: FooterSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FooterSection>]
  select: []
}>()

function onUpdate(patch: Partial<FooterSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <FooterSimple
    v-if="section.variant === 'simple'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <FooterColumns
    v-else-if="section.variant === 'columns'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <FooterMinimal
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
