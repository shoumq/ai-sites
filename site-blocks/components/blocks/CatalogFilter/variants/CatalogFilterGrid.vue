<script setup lang="ts">
// Сетка карточек — базовый вид каталога. Фильтрация/поиск/заголовок живут в
// CatalogFilter.vue (общая обвязка), сюда приходит уже отфильтрованный список.
import type { CatalogFilterSection, CatalogItem } from '~/types/site'

defineProps<{
  section: CatalogFilterSection
  entries: { item: CatalogItem; index: number }[]
  editable?: boolean
}>()

const emit = defineEmits<{ updateItem: [index: number, patch: Partial<CatalogItem>] }>()
</script>

<template>
  <div class="catalog-grid">
    <article
      v-for="{ item, index } in entries"
      :key="index"
      class="catalog-card"
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: (index % 6) * 70, ease: 'easeOut' } }"
    >
      <div class="catalog-card__media">
        <img v-if="item.image" :src="item.image" alt="" class="catalog-card__img">
        <ImagePlaceholder v-else label="Товар" icon="🛍️" :rounded="false" />
        <span v-if="item.badge" class="catalog-card__badge">{{ item.badge }}</span>
      </div>

      <div class="catalog-card__body">
        <EditableText
          tag="h3"
          class="catalog-card__name"
          :model-value="item.name"
          :editable="editable"
          placeholder="Название"
          @update:model-value="(v) => emit('updateItem', index, { name: v })"
        />
        <EditableText
          v-if="item.description || editable"
          tag="p"
          class="catalog-card__desc"
          :model-value="item.description"
          :editable="editable"
          multiline
          placeholder="Описание"
          @update:model-value="(v) => emit('updateItem', index, { description: v })"
        />

        <div class="catalog-card__foot">
          <span class="catalog-card__prices">
            <EditableText
              v-if="item.price || editable"
              tag="span"
              class="catalog-card__price"
              :model-value="item.price"
              :editable="editable"
              placeholder="Цена"
              @update:model-value="(v) => emit('updateItem', index, { price: v })"
            />
            <s v-if="item.old_price" class="catalog-card__old-price">{{ item.old_price }}</s>
          </span>

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
.catalog-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--stack-gap);
}

.catalog-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  background: var(--surface);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.catalog-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border-color));
}

.catalog-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
}

.catalog-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.catalog-card__badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 4px var(--space-3);
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 700;
}

.catalog-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--card-p);
  flex: 1;
}

.catalog-card__name {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.catalog-card__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.catalog-card__foot {
  margin-top: auto;
  padding-top: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.catalog-card__prices {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.catalog-card__price {
  font-weight: 700;
  color: var(--primary);
  font-size: var(--fs-base);
}

.catalog-card__old-price {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

@container (max-width: 900px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 600px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
