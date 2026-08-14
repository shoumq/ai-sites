<script setup lang="ts">
import type { GallerySection, GalleryItem } from '~/types/site'

const props = defineProps<{
  section: GallerySection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<GallerySection>]
  select: []
}>()

function updateItem(index: number, patch: Partial<GalleryItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="gallery">
    <div class="gallery__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="gallery__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок галереи"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />
      <div class="gallery__grid">
        <figure
          v-for="(item, i) in section.items"
          :key="i"
          class="gallery-item"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: (i % 8) * 60, ease: 'easeOut' } }"
        >
          <div class="gallery-item__media">
            <img v-if="item.image" :src="item.image" alt="" class="gallery-item__img" />
            <ImagePlaceholder v-else label="Фото" icon="🖼️" />
          </div>
          <EditableText
            v-if="item.caption || editable"
            tag="figcaption"
            class="gallery-item__caption"
            :model-value="item.caption"
            :editable="editable"
            placeholder="Подпись"
            @update:model-value="(v) => updateItem(i, { caption: v })"
          />
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.gallery__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.gallery__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.gallery__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.gallery-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.gallery-item__media {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.gallery-item__media:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.gallery-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-item__caption {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  text-align: center;
}

@container (max-width: 900px) {
  .gallery__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (max-width: 600px) {
  .gallery__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
