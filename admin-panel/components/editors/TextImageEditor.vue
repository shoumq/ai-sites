<script setup lang="ts">
import type { TextImageSection } from '~/types/site'

defineProps<{ section: TextImageSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
</script>

<template>
  <BaseInput label="Заголовок" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseTextarea label="Текст" :model-value="section.text" @update:model-value="emit('patch', { text: $event })" />
  <BaseSelect
    label="Позиция картинки"
    :model-value="section.image_position"
    :options="[{ value: 'left', label: 'Слева' }, { value: 'right', label: 'Справа' }]"
    @update:model-value="emit('patch', { image_position: $event })"
  />
</template>
