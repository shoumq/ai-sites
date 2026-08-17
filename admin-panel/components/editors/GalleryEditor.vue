<script setup lang="ts">
import type { GallerySection } from '~/types/site'

defineProps<{ section: GallerySection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('gallery')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок галереи" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <div class="field-label">Фотографии</div>
  <ListEditor
    :items="section.items"
    add-label="фото"
    :new-item="() => ({ image: '', caption: '' })"
    @update:items="emit('patch', { items: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="URL картинки" :model-value="item.image" @update:model-value="update({ image: $event })" />
      <BaseInput placeholder="Подпись" :model-value="item.caption" @update:model-value="update({ caption: $event })" />
    </template>
  </ListEditor>
</template>
