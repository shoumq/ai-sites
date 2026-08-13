<script setup lang="ts">
import type { HeroSection } from '~/types/site'

const props = defineProps<{
  section: HeroSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<HeroSection>]
  select: []
}>()

function onUpdate(patch: Partial<HeroSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <HeroCentered
    v-if="section.variant === 'centered'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeroSplit
    v-else-if="section.variant === 'split'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeroMinimal
    v-else-if="section.variant === 'minimal'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeroGradient
    v-else-if="section.variant === 'gradient'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <HeroOverlay
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
