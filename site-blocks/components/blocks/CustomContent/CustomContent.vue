<script setup lang="ts">
import type { CustomContentSection } from '~/types/site'

defineProps<{
  section: CustomContentSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<CustomContentSection>]
  select: []
}>()

function onUpdate(patch: Partial<CustomContentSection>) {
  emit('update:section', patch)
}
</script>

<template>
  <CustomContentStandard :section="section" :editable="editable" @update:section="onUpdate" @select="emit('select')" />
</template>
