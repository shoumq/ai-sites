<script setup lang="ts">
// «Кирпичная кладка»: колонки CSS columns, высота карточек чередуется по
// индексу. Живая альтернатива ровной сетке для портфолио и фотоотчётов.
import type { GalleryItem, GallerySection } from '~/types/site'

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
  <section class="gallery-masonry">
    <div class="gallery-masonry__inner is-centered">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="gallery-masonry__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок галереи"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="gallery-masonry__columns">
        <figure
          v-for="(item, i) in section.items"
          :key="i"
          class="masonry-item"
          :class="`masonry-item--h${i % 3}`"
        >
          <img v-if="item.image" :src="item.image" alt="" class="masonry-item__img">
          <ImagePlaceholder v-else :label="item.caption || 'Фото'" icon="🖼️" :rounded="false" />
          <EditableText
            v-if="item.caption || editable"
            tag="figcaption"
            class="masonry-item__caption"
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
.gallery-masonry {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.gallery-masonry__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.gallery-masonry__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.gallery-masonry__columns {
  columns: 3;
  column-gap: var(--space-4);
}

.masonry-item {
  break-inside: avoid;
  margin: 0 0 var(--space-4);
  border-radius: var(--radius-block);
  overflow: hidden;
  background: var(--surface-muted);
}

.masonry-item__img {
  width: 100%;
  display: block;
  object-fit: cover;
}

/* Разная высота по индексу — иначе при одинаковых пропорциях исходников
   «кладка» визуально не отличается от обычной сетки. */
.masonry-item--h0 .masonry-item__img {
  aspect-ratio: 3 / 4;
}
.masonry-item--h1 .masonry-item__img {
  aspect-ratio: 1 / 1;
}
.masonry-item--h2 .masonry-item__img {
  aspect-ratio: 4 / 3;
}

.masonry-item__caption {
  padding: var(--space-3) var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

@container (max-width: 900px) {
  .gallery-masonry__columns {
    columns: 2;
  }
}

@container (max-width: 600px) {
  .gallery-masonry__columns {
    columns: 1;
  }
}
</style>
