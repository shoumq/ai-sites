<script setup lang="ts">
import type { CustomContentSection } from '~/types/site'

defineProps<{ section: CustomContentSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
</script>

<template>
  <BaseInput label="Заголовок" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseTextarea
    label="Текст"
    :rows="6"
    placeholder='Поддерживается **жирный**, *курсив* и списки через "- "'
    :model-value="section.body"
    @update:model-value="emit('patch', { body: $event })"
  />
  <div class="field-label">Дополнительные пункты (необязательно)</div>
  <ListEditor
    :items="section.items"
    add-label="пункт"
    :new-item="() => ({ label: 'Название', value: '' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.label" @update:model-value="update({ label: $event })" />
      <BaseInput placeholder="Значение" :model-value="item.value" @update:model-value="update({ value: $event })" />
    </template>
  </ListEditor>
</template>
