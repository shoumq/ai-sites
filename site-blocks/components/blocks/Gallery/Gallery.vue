<script setup lang="ts">
import type { GallerySection } from '~/types/site'

defineProps<{
  section: GallerySection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<GallerySection>]
  select: []
}>()

function onUpdate(patch: Partial<GallerySection>) {
  emit('update:section', patch)
}
</script>

<template>
  <GalleryMasonry
    v-if="section.variant === 'masonry'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <GallerySlider
    v-else-if="section.variant === 'slider'"
    :section="section"
    :editable="editable"
    @update:section="onUpdate"
    @select="emit('select')"
  />
  <GalleryGrid v-else :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
