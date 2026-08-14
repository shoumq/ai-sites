<script setup lang="ts">
import type { PricingSection } from '~/types/site'

const props = defineProps<{
  section: PricingSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<PricingSection>]
  select: []
}>()

function onUpdate(patch: Partial<PricingSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <PricingCards
    v-if="section.variant === 'cards'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <PricingHighlight
    v-else-if="section.variant === 'highlight'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <PricingTable
    v-else-if="section.variant === 'table'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <PricingMinimal
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
