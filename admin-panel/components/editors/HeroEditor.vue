<script setup lang="ts">
import type { HeroSection } from '~/types/site'

defineProps<{ section: HeroSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('hero')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок (H1)" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseTextarea label="Подзаголовок" :model-value="section.subtitle" @update:model-value="emit('patch', { subtitle: $event })" />
  <BaseInput label="Текст кнопки" :model-value="section.cta_text" @update:model-value="emit('patch', { cta_text: $event })" />
  <BaseInput label="Ссылка кнопки" :model-value="section.cta_href" @update:model-value="emit('patch', { cta_href: $event })" />
</template>
