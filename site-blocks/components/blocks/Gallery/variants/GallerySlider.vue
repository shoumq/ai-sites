<script setup lang="ts">
/**
 * Горизонтальная лента с прокруткой.
 *
 * Сделана на нативном scroll-snap, а не на карусельной библиотеке: сайты
 * собираются `nuxi generate` в статику, и тащить ради ленты рантайм-зависимость
 * (плюс её гидратацию и вес в бандле) незачем — прокрутка пальцем и колесом
 * работает и без JS, а кнопки лишь дополняют её.
 */
import { ref } from 'vue'
import type { GalleryItem, GallerySection } from '~/types/site'

const props = defineProps<{
  section: GallerySection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<GallerySection>]
  select: []
}>()

const track = ref<HTMLElement | null>(null)

function scrollBy(direction: 1 | -1) {
  if (!track.value) return
  track.value.scrollBy({ left: direction * track.value.clientWidth * 0.8, behavior: 'smooth' })
}

function updateItem(index: number, patch: Partial<GalleryItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="gallery-slider">
    <div class="gallery-slider__inner">
      <header class="gallery-slider__head">
        <EditableText
          v-if="section.title || editable"
          tag="h2"
          class="gallery-slider__title"
          :model-value="section.title"
          :editable="editable"
          placeholder="Заголовок галереи"
          @update:model-value="(v) => emit('update:section', { title: v })"
        />
        <div class="gallery-slider__nav">
          <button type="button" aria-label="Назад" @click="scrollBy(-1)">‹</button>
          <button type="button" aria-label="Вперёд" @click="scrollBy(1)">›</button>
        </div>
      </header>

      <div ref="track" class="gallery-slider__track">
        <figure v-for="(item, i) in section.items" :key="i" class="slide">
          <img v-if="item.image" :src="item.image" alt="" class="slide__img">
          <ImagePlaceholder v-else :label="item.caption || 'Фото'" icon="🖼️" :rounded="false" />
          <EditableText
            v-if="item.caption || editable"
            tag="figcaption"
            class="slide__caption"
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
.gallery-slider {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.gallery-slider__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.gallery-slider__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.gallery-slider__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.gallery-slider__nav {
  display: flex;
  gap: var(--space-2);
}

.gallery-slider__nav button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--surface);
  color: var(--text);
  font-size: var(--fs-xl);
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.gallery-slider__nav button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.gallery-slider__track {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  padding-bottom: var(--space-3);
}

.slide {
  flex: 0 0 clamp(240px, 32%, 380px);
  margin: 0;
  scroll-snap-align: start;
  border-radius: var(--radius-block);
  overflow: hidden;
  background: var(--surface-muted);
}

.slide__img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.slide__caption {
  padding: var(--space-3) var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
