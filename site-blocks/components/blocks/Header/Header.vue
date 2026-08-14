<script setup lang="ts">
import type { HeaderSection, Theme } from '~/types/site'

const props = defineProps<{
  section: HeaderSection
  editable?: boolean
  theme?: Theme
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<HeaderSection>]
  select: []
}>()

function onUpdate(patch: Partial<HeaderSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <HeaderStandard
    v-if="section.variant === 'standard'"
    :section="section"
    :editable="editable"
    :theme="theme"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeaderCentered
    v-else-if="section.variant === 'centered'"
    :section="section"
    :editable="editable"
    :theme="theme"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeaderSplit
    v-else-if="section.variant === 'split'"
    :section="section"
    :editable="editable"
    :theme="theme"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeaderMinimal
    v-else
    :section="section"
    :editable="editable"
    :theme="theme"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
