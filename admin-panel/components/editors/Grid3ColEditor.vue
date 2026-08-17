<script setup lang="ts">
import { ITEM_ACTION_LABELS } from '~/types/site'
import type { Grid3ColSection } from '~/types/site'

defineProps<{ section: Grid3ColSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()

const ACTION_OPTIONS = Object.entries(ITEM_ACTION_LABELS).map(([value, label]) => ({ value, label }))
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('grid_3col')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок секции" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseInput
    label="Текст кнопки под сеткой (необязательно)"
    :model-value="section.cta_text"
    @update:model-value="emit('patch', { cta_text: $event })"
  />
  <BaseSelect
    label="Кнопка на карточке"
    :model-value="section.action"
    :options="ACTION_OPTIONS"
    @update:model-value="emit('patch', { action: $event })"
  />
  <BaseInput
    v-if="section.action !== 'none'"
    label="Текст кнопки на карточке (пусто — по умолчанию)"
    :model-value="section.action_text"
    @update:model-value="emit('patch', { action_text: $event })"
  />
  <div class="field-label">Список услуг</div>
  <ListEditor
    :items="section.items"
    add-label="услугу"
    :new-item="() => ({ name: 'Услуга', description: '', price: '', icon: '', image: '' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
      <BaseInput placeholder="Описание" :model-value="item.description" @update:model-value="update({ description: $event })" />
      <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
      <BaseInput
        placeholder="Иконка-эмодзи (для варианта «С иконкой»)"
        :model-value="item.icon"
        @update:model-value="update({ icon: $event })"
      />
      <BaseInput
        placeholder="Ссылка на фото (для варианта «С фото»)"
        :model-value="item.image"
        @update:model-value="update({ image: $event })"
      />
    </template>
  </ListEditor>
</template>
