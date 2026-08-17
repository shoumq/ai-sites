<script setup lang="ts">
// Витрина: две крупные карточки в ряд, фото во всю ширину, текст поверх
// затемнения. Для каталогов, где продаёт именно фотография — интерьеры,
// одежда, туры, премиальные товары.
import type { CatalogFilterSection, CatalogItem } from '~/types/site'

defineProps<{
  section: CatalogFilterSection
  entries: { item: CatalogItem; index: number }[]
  editable?: boolean
}>()

const emit = defineEmits<{ updateItem: [index: number, patch: Partial<CatalogItem>] }>()
</script>

<template>
  <div class="catalog-showcase">
    <article
      v-for="{ item, index } in entries"
      :key="index"
      class="showcase-card"
      v-motion
      :initial="{ opacity: 0, scale: 0.97 }"
      :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 420, delay: (index % 4) * 80, ease: 'easeOut' } }"
    >
      <div class="showcase-card__media">
        <img v-if="item.image" :src="item.image" alt="" class="showcase-card__img">
        <ImagePlaceholder v-else label="Фото" icon="✨" :rounded="false" />
      </div>

      <div class="showcase-card__overlay">
        <span v-if="item.badge" class="showcase-card__badge">{{ item.badge }}</span>
        <EditableText
          tag="h3"
          class="showcase-card__name"
          :model-value="item.name"
          :editable="editable"
          placeholder="Название"
          @update:model-value="(v) => emit('updateItem', index, { name: v })"
        />
        <EditableText
          v-if="item.description || editable"
          tag="p"
          class="showcase-card__desc"
          :model-value="item.description"
          :editable="editable"
          multiline
          placeholder="Описание"
          @update:model-value="(v) => emit('updateItem', index, { description: v })"
        />
        <div class="showcase-card__foot">
          <EditableText
            v-if="item.price || editable"
            tag="span"
            class="showcase-card__price"
            :model-value="item.price"
            :editable="editable"
            placeholder="Цена"
            @update:model-value="(v) => emit('updateItem', index, { price: v })"
          />
          <ItemActionButton
            :action="section.action"
            :label="section.action_text"
            :name="item.name"
            :price="item.price"
            :image="item.image"
            :sku="item.sku"
            :editable="editable"
          />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.catalog-showcase {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--stack-gap);
}

.showcase-card {
  position: relative;
  min-height: 380px;
  border-radius: var(--radius-block);
  overflow: hidden;
  isolation: isolate;
}

.showcase-card__media {
  position: absolute;
  inset: 0;
}

.showcase-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-base);
}

.showcase-card:hover .showcase-card__img {
  transform: scale(1.04);
}

.showcase-card__overlay {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--card-p);
  background: linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0) 75%);
  color: #fff;
}

.showcase-card__badge {
  align-self: flex-start;
  padding: 4px var(--space-3);
  border-radius: 999px;
  background: var(--primary);
  font-size: var(--fs-sm);
  font-weight: 700;
}

.showcase-card__name {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: #fff;
}

.showcase-card__desc {
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.85);
}

.showcase-card__foot {
  margin-top: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.showcase-card__price {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: #fff;
}

@container (max-width: 760px) {
  .catalog-showcase {
    grid-template-columns: 1fr;
  }
}
</style>
