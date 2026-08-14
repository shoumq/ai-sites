<script setup lang="ts">
import type { TestimonialsSection } from '~/types/site'

const props = defineProps<{
  section: TestimonialsSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<TestimonialsSection>]
  select: []
}>()

function onUpdate(patch: Partial<TestimonialsSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <TestimonialsCards
    v-if="section.variant === 'cards'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <TestimonialsQuotes
    v-else-if="section.variant === 'quotes'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <TestimonialsAvatarsRow
    v-else-if="section.variant === 'avatars_row'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <TestimonialsSingleFeatured
    v-else
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
</template>
