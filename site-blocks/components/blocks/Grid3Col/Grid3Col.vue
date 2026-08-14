<script setup lang="ts">
import type { Grid3ColSection } from '~/types/site'

const props = defineProps<{
  section: Grid3ColSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<Grid3ColSection>]
  select: []
}>()

function onUpdate(patch: Partial<Grid3ColSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <Grid3ColCards
    v-if="section.variant === 'cards'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <Grid3ColIconRows
    v-else-if="section.variant === 'icon_rows'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <Grid3ColMinimalList
    v-else-if="section.variant === 'minimal_list'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <Grid3ColIconTop
    v-else-if="section.variant === 'icon_top'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <Grid3ColCompactGrid
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
