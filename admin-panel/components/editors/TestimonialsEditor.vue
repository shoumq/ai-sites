<script setup lang="ts">
import type { TestimonialsSection } from '~/types/site'

defineProps<{ section: TestimonialsSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('testimonials')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок секции" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <div class="field-label">Отзывы</div>
  <ListEditor
    :items="section.items"
    add-label="отзыв"
    :new-item="() => ({ author: 'Имя', text: '', avatar: '', rating: 5 })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Автор" :model-value="item.author" @update:model-value="update({ author: $event })" />
      <BaseTextarea placeholder="Текст отзыва" :model-value="item.text" @update:model-value="update({ text: $event })" />
    </template>
  </ListEditor>
</template>
