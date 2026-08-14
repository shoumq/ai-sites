<script setup lang="ts">
import type { FooterSection } from '~/types/site'

defineProps<{ section: FooterSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('footer')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Название компании" :model-value="section.company_name" @update:model-value="emit('patch', { company_name: $event })" />
  <BaseInput label="Копирайт" :model-value="section.copyright_text" @update:model-value="emit('patch', { copyright_text: $event })" />
  <div class="field-label">Ссылки в футере</div>
  <ListEditor
    :items="section.links"
    add-label="ссылку"
    :new-item="() => ({ label: 'Ссылка', href: '#' })"
    @update:items="emit('patch', { links: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Название" :model-value="item.label" @update:model-value="update({ label: $event })" />
      <BaseInput placeholder="URL" :model-value="item.href" @update:model-value="update({ href: $event })" />
    </template>
  </ListEditor>
</template>
