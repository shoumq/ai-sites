<script setup lang="ts">
import type { PricingSection } from '~/types/site'

defineProps<{ section: PricingSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('pricing')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок секции" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <div class="field-label">Тарифные планы</div>
  <ListEditor
    :items="section.plans"
    add-label="тариф"
    :new-item="() => ({ name: 'Тариф', price: '0', period: 'мес', features: [], highlighted: false })"
    @update:items="emit('patch', { plans: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
      <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
      <BaseInput placeholder="Период (мес/год)" :model-value="item.period" @update:model-value="update({ period: $event })" />
      <BaseTextarea
        placeholder="Опции — каждая с новой строки"
        :model-value="item.features.join('\n')"
        @update:model-value="update({ features: $event.split('\n') })"
      />
      <label class="checkbox-row">
        <input
          type="checkbox"
          :checked="item.highlighted"
          @change="update({ highlighted: ($event.target as HTMLInputElement).checked })"
        >
        Выделить тариф
      </label>
    </template>
  </ListEditor>
</template>
