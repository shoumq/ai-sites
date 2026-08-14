<script setup lang="ts">
import type { HeaderSection } from '~/types/site'

defineProps<{ section: HeaderSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('header')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Логотип (текст)" :model-value="section.logo_text" @update:model-value="emit('patch', { logo_text: $event })" />
  <BaseInput label="Текст кнопки" :model-value="section.cta_text" @update:model-value="emit('patch', { cta_text: $event })" />
  <label class="checkbox-row">
    <input
      type="checkbox"
      :checked="section.sticky"
      @change="emit('patch', { sticky: ($event.target as HTMLInputElement).checked })"
    >
    Липкая шапка (position: sticky)
  </label>
  <div class="field-label">Пункты меню</div>
  <ListEditor
    :items="section.nav_items"
    add-label="пункт меню"
    :new-item="() => ({ label: 'Пункт', href: '#' })"
    @update:items="emit('patch', { nav_items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.label" @update:model-value="update({ label: $event })" />
      <BaseInput placeholder="Ссылка" :model-value="item.href" @update:model-value="update({ href: $event })" />
    </template>
  </ListEditor>
</template>
