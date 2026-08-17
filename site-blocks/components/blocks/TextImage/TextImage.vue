<script setup lang="ts">
import type { TextImageSection } from '~/types/site'

defineProps<{
  section: TextImageSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<TextImageSection>]
  select: []
}>()
</script>

<template>
  <section class="text-image" :class="[`text-image--${section.image_position}`, `text-image--v-${section.variant || 'standard'}`]">
    <div class="text-image__grid">
      <div
        class="text-image__text"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
      >
        <EditableText
          tag="h2"
          class="text-image__title"
          :model-value="section.title"
          :editable="editable"
          placeholder="Заголовок"
          @update:model-value="(v) => emit('update:section', { title: v })"
        />
        <EditableText
          tag="p"
          class="text-image__body"
          :model-value="section.text"
          :editable="editable"
          multiline
          placeholder="Текст блока"
          @update:model-value="(v) => emit('update:section', { text: v })"
        />
      </div>

      <div
        class="text-image__media"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 450, delay: 120, ease: 'easeOut' } }"
      >
        <img v-if="section.image" :src="section.image" alt="" class="text-image__img" />
        <ImagePlaceholder v-else label="Изображение" icon="🖼️" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-image {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.text-image__grid {
  max-width: var(--container);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

/* Варианты вёрстки этого блока сделаны модификаторами-классами, а не
   отдельными файлами в variants/: разметка у всех трёх одна и та же (текст +
   картинка), различаются только пропорции и подложка. Три копии одного
   шаблона ради этого разъехались бы при первой же правке контента. */

/* overlap — картинка «наезжает» на цветную подложку с текстом */
.text-image--v-overlap .text-image__grid {
  grid-template-columns: 1.15fr 1fr;
  gap: 0;
  align-items: stretch;
}

.text-image--v-overlap .text-image__text {
  padding: var(--space-7);
  border-radius: var(--radius-block);
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
  justify-content: center;
}

.text-image--v-overlap .text-image__media {
  align-self: center;
  margin-inline-start: calc(var(--space-6) * -1);
  z-index: 1;
}

.text-image--v-overlap.text-image--left .text-image__media {
  margin-inline-start: 0;
  margin-inline-end: calc(var(--space-6) * -1);
}

/* card — текст и картинка в одной карточке с рамкой и тенью */
.text-image--v-card .text-image__grid {
  gap: 0;
  align-items: stretch;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.text-image--v-card .text-image__text {
  padding: var(--space-7);
  justify-content: center;
}

.text-image--v-card .text-image__media {
  border-radius: 0;
  box-shadow: none;
  aspect-ratio: auto;
}

.text-image--right .text-image__text {
  order: 1;
}
.text-image--right .text-image__media {
  order: 2;
}
.text-image--left .text-image__text {
  order: 2;
}
.text-image--left .text-image__media {
  order: 1;
}

.text-image__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.text-image__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.text-image__body {
  font-size: var(--fs-base);
  color: var(--text-muted);
  max-width: 56ch;
}

.text-image__media {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  aspect-ratio: 4 / 3;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.text-image__media:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-color);
}

.text-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@container (max-width: 860px) {
  .text-image__grid,
  .text-image--v-overlap .text-image__grid {
    grid-template-columns: 1fr;
  }

  /* Наезд картинки на текст на узком экране превращается в кашу — на мобильном
     все три варианта схлопываются в обычную вертикаль. */
  .text-image--v-overlap .text-image__media,
  .text-image--v-overlap.text-image--left .text-image__media {
    margin-inline: 0;
  }
  .text-image--right .text-image__text,
  .text-image--left .text-image__text {
    order: 2;
  }
  .text-image--right .text-image__media,
  .text-image--left .text-image__media {
    order: 1;
  }
}
</style>
