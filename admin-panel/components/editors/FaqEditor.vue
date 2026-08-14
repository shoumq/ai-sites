<script setup lang="ts">
import type { FaqSection } from '~/types/site'

defineProps<{ section: FaqSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
</script>

<template>
  <BaseInput label="Заголовок блока" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <div class="field-label">Вопросы и ответы</div>
  <ListEditor
    :items="section.items"
    add-label="вопрос"
    :new-item="() => ({ question: 'Вопрос', answer: '' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Вопрос" :model-value="item.question" @update:model-value="update({ question: $event })" />
      <BaseTextarea placeholder="Ответ" :model-value="item.answer" @update:model-value="update({ answer: $event })" />
    </template>
  </ListEditor>
</template>
