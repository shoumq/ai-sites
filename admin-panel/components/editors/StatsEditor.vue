<script setup lang="ts">
import type { StatsSection } from '~/types/site'

defineProps<{ section: StatsSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
</script>

<template>
  <BaseInput label="Заголовок (необязательно)" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <div class="field-label">Показатели</div>
  <ListEditor
    :items="section.items"
    add-label="показатель"
    :new-item="() => ({ value: '100+', label: 'Подпись' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Значение (например 500+)" :model-value="item.value" @update:model-value="update({ value: $event })" />
      <BaseInput placeholder="Подпись" :model-value="item.label" @update:model-value="update({ label: $event })" />
    </template>
  </ListEditor>
</template>
