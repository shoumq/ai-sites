<script setup lang="ts">
import type { FooterSection, Theme } from '~/types/site'

const props = defineProps<{
  section: FooterSection
  editable?: boolean
  theme?: Theme
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
    :theme="theme"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <FooterColumns
    v-else-if="section.variant === 'columns'"
    :section="section"
    :editable="editable"
    :theme="theme"
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
