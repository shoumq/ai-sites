<script setup lang="ts">
// Карточки с фотографией во всю ширину сверху. Единственный вариант grid_3col,
// использующий поле item.image — нужен там, где услугу/товар продаёт снимок, а
// не иконка: еда, мебель, бьюти, ремонт, туры.
import type { Grid3ColSection, ServiceItem } from '~/types/site'

const props = defineProps<{
  section: Grid3ColSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<Grid3ColSection>]
  select: []
}>()

function updateItem(index: number, patch: Partial<ServiceItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="grid3col grid3col--photo">
    <div class="grid3col__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="grid3col__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="photo-grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="photo-card"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <div class="photo-card__media">
            <img v-if="item.image" :src="item.image" alt="" class="photo-card__img">
            <ImagePlaceholder v-else :label="item.name || 'Фото'" icon="📸" :rounded="false" />
          </div>
          <div class="photo-card__body">
            <EditableText
              tag="h3"
              class="photo-card__name"
              :model-value="item.name"
              :editable="editable"
              placeholder="Название"
              @update:model-value="(v) => updateItem(i, { name: v })"
            />
            <EditableText
              v-if="item.description || editable"
              tag="p"
              class="photo-card__desc"
              :model-value="item.description"
              :editable="editable"
              multiline
              placeholder="Описание"
              @update:model-value="(v) => updateItem(i, { description: v })"
            />
            <div class="photo-card__foot">
              <EditableText
                v-if="item.price || editable"
                tag="span"
                class="photo-card__price"
                :model-value="item.price"
                :editable="editable"
                placeholder="Цена"
                @update:model-value="(v) => updateItem(i, { price: v })"
              />
              <ItemActionButton
                :action="section.action"
                :label="section.action_text"
                :name="item.name"
                :price="item.price"
                :image="item.image"
                :editable="editable"
              />
            </div>
          </div>
        </article>
      </div>

      <EditableText
        v-if="section.cta_text || editable"
        tag="span"
        class="grid3col__cta"
        :model-value="section.cta_text"
        :editable="editable"
        placeholder="Кнопка"
        @update:model-value="(v) => emit('update:section', { cta_text: v })"
      />
    </div>
  </section>
</template>

<style scoped>
.grid3col--photo {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.grid3col__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--stack-gap);
}

.grid3col__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.photo-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--stack-gap);
}

.photo-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-block);
  background: var(--surface);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.photo-card__media {
  aspect-ratio: 3 / 2;
}

.photo-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--card-p);
}

.photo-card__name {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.photo-card__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.photo-card__foot {
  margin-top: auto;
  padding-top: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.photo-card__price {
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--primary);
}

.grid3col__cta {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-radius);
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

@container (max-width: 900px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 600px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
