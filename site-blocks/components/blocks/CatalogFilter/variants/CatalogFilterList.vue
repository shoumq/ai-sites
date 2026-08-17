<script setup lang="ts">
// Широкие строки: фото слева, характеристики и цена справа. Вид, привычный
// для автосалонов и недвижимости — где у позиции есть артикул/VIN и описание
// длиннее одной строки, и им нужно место.
import type { CatalogFilterSection, CatalogItem } from '~/types/site'

defineProps<{
  section: CatalogFilterSection
  entries: { item: CatalogItem; index: number }[]
  editable?: boolean
}>()

const emit = defineEmits<{ updateItem: [index: number, patch: Partial<CatalogItem>] }>()
</script>

<template>
  <div class="catalog-list">
    <article
      v-for="{ item, index } in entries"
      :key="index"
      class="catalog-row"
      v-motion
      :initial="{ opacity: 0, y: 18 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 340, delay: (index % 6) * 60, ease: 'easeOut' } }"
    >
      <div class="catalog-row__media">
        <img v-if="item.image" :src="item.image" alt="" class="catalog-row__img">
        <ImagePlaceholder v-else label="Фото" icon="📷" :rounded="false" />
        <span v-if="item.badge" class="catalog-row__badge">{{ item.badge }}</span>
      </div>

      <div class="catalog-row__main">
        <EditableText
          tag="h3"
          class="catalog-row__name"
          :model-value="item.name"
          :editable="editable"
          placeholder="Название"
          @update:model-value="(v) => emit('updateItem', index, { name: v })"
        />
        <EditableText
          v-if="item.description || editable"
          tag="p"
          class="catalog-row__desc"
          :model-value="item.description"
          :editable="editable"
          multiline
          placeholder="Характеристики"
          @update:model-value="(v) => emit('updateItem', index, { description: v })"
        />
        <div class="catalog-row__meta">
          <span v-if="item.category" class="catalog-row__tag">{{ item.category }}</span>
          <span v-if="item.sku" class="catalog-row__sku">Артикул: {{ item.sku }}</span>
          <span v-if="!item.in_stock" class="catalog-row__out">Нет в наличии</span>
        </div>
      </div>

      <div class="catalog-row__side">
        <EditableText
          v-if="item.price || editable"
          tag="span"
          class="catalog-row__price"
          :model-value="item.price"
          :editable="editable"
          placeholder="Цена"
          @update:model-value="(v) => emit('updateItem', index, { price: v })"
        />
        <s v-if="item.old_price" class="catalog-row__old-price">{{ item.old_price }}</s>
        <ItemActionButton
          :action="section.action"
          :label="section.action_text"
          :name="item.name"
          :price="item.price"
          :image="item.image"
          :sku="item.sku"
          :editable="editable"
          block
        />
      </div>
    </article>
  </div>
</template>

<style scoped>
.catalog-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.catalog-row {
  display: grid;
  grid-template-columns: 260px 1fr 200px;
  gap: var(--card-p);
  align-items: stretch;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  background: var(--surface);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}

.catalog-row:hover {
  box-shadow: var(--shadow-md);
  border-color: color-mix(in srgb, var(--primary) 30%, var(--border-color));
}

.catalog-row__media {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-control);
  overflow: hidden;
}

.catalog-row__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.catalog-row__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  padding: 3px var(--space-2);
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 700;
}

.catalog-row__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.catalog-row__name {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--text);
}

.catalog-row__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.catalog-row__meta {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.catalog-row__tag {
  padding: 2px var(--space-3);
  border-radius: 999px;
  background: var(--surface-muted);
}

.catalog-row__out {
  color: #b45309;
  font-weight: 600;
}

.catalog-row__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-left: 1px solid var(--border-color);
}

.catalog-row__price {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--primary);
}

.catalog-row__old-price {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

@container (max-width: 900px) {
  .catalog-row {
    grid-template-columns: 200px 1fr;
  }
  .catalog-row__side {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
}

@container (max-width: 600px) {
  .catalog-row {
    grid-template-columns: 1fr;
  }
}
</style>
