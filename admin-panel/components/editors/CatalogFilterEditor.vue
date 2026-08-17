<script setup lang="ts">
import { ITEM_ACTION_LABELS } from '~/types/site'
import type { CatalogFilterSection } from '~/types/site'

defineProps<{ section: CatalogFilterSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()

const ACTION_OPTIONS = Object.entries(ITEM_ACTION_LABELS).map(([value, label]) => ({ value, label }))
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('catalog_filter')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок каталога" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />

  <BaseSelect
    label="Кнопка на карточке товара"
    :model-value="section.action"
    :options="ACTION_OPTIONS"
    @update:model-value="emit('patch', { action: $event })"
  />
  <p class="field-hint">
    «Оставить заявку» — открывается форма с названием товара (каталог авто, недвижимость, услуги).
    «В корзину» — товар копится в корзине и уходит заказом (интернет-магазин).
  </p>
  <BaseInput
    v-if="section.action !== 'none'"
    label="Текст кнопки (пусто — по умолчанию)"
    :model-value="section.action_text"
    @update:model-value="emit('patch', { action_text: $event })"
  />
  <label class="checkbox-row">
    <input
      type="checkbox"
      :checked="section.show_search"
      @change="emit('patch', { show_search: ($event.target as HTMLInputElement).checked })"
    >
    Поиск по каталогу
  </label>
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
    :new-item="() => ({ name: 'Товар', description: '', price: '', old_price: '', category: '', image: '', badge: '', sku: '', in_stock: true })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
      <BaseInput placeholder="Описание" :model-value="item.description" @update:model-value="update({ description: $event })" />
      <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
      <BaseInput placeholder="Старая цена (зачёркнутая)" :model-value="item.old_price" @update:model-value="update({ old_price: $event })" />
      <BaseInput placeholder="Категория" :model-value="item.category" @update:model-value="update({ category: $event })" />
      <BaseInput placeholder="Плашка («Хит», «-20%»)" :model-value="item.badge" @update:model-value="update({ badge: $event })" />
      <BaseInput placeholder="Артикул / VIN" :model-value="item.sku" @update:model-value="update({ sku: $event })" />
      <BaseInput placeholder="Ссылка на изображение" :model-value="item.image" @update:model-value="update({ image: $event })" />
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
