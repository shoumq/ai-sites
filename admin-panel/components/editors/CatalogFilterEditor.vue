<script setup lang="ts">
import type { CatalogFilterSection } from '~/types/site'

defineProps<{ section: CatalogFilterSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
</script>

<template>
  <BaseInput label="Заголовок каталога" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseTextarea
    label="Категории для фильтра — каждая с новой строки"
    :model-value="section.categories.join('\n')"
    @update:model-value="emit('patch', { categories: $event.split('\n').map((c) => c.trim()).filter(Boolean) })"
  />
  <p class="field-hint">Пусто — категории соберутся автоматически из поля «Категория» товаров ниже.</p>
  <div class="field-label">Товары</div>
  <ListEditor
    :items="section.items"
    add-label="товар"
    :new-item="() => ({ name: 'Товар', description: '', price: '', category: '', image: '' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
      <BaseInput placeholder="Описание" :model-value="item.description" @update:model-value="update({ description: $event })" />
      <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
      <BaseInput placeholder="Категория" :model-value="item.category" @update:model-value="update({ category: $event })" />
    </template>
  </ListEditor>
</template>

<style scoped>
.field-hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  margin: calc(var(--a-space-2) * -1) 0 0;
}
</style>
