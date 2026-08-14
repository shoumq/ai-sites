<script setup lang="ts">
import type { ContactMapSection } from '~/types/site'

defineProps<{ section: ContactMapSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('contact_map')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Адрес" :model-value="section.address" @update:model-value="emit('patch', { address: $event })" />
  <BaseInput label="Телефон" :model-value="section.phone" @update:model-value="emit('patch', { phone: $event })" />
  <BaseInput label="Email" :model-value="section.email" @update:model-value="emit('patch', { email: $event })" />
  <BaseInput
    label="2ГИС / карта — embed URL"
    :model-value="section.map_embed_url"
    @update:model-value="emit('patch', { map_embed_url: $event })"
  />
</template>
