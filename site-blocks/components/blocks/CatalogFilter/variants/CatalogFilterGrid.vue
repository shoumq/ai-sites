<script setup lang="ts">
import type { CatalogFilterSection, CatalogItem } from '~/types/site'

const props = defineProps<{
  section: CatalogFilterSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<CatalogFilterSection>]
  select: []
}>()

const items = toRef(props.section, 'items')
const categoriesProp = toRef(props.section, 'categories')
const { activeCategory, availableCategories, filtered, setCategory } = useCatalogFilter(items, categoriesProp)

function updateItem(index: number, patch: Partial<CatalogItem>) {
  const updated = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items: updated })
}
</script>

<template>
  <section class="catalog-filter">
    <div class="catalog-filter__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="catalog-filter__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок каталога"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div v-if="availableCategories.length" class="catalog-filter__chips" role="tablist">
        <button
          type="button"
          class="catalog-filter__chip"
          :class="{ 'is-active': activeCategory === 'all' }"
          role="tab"
          @click="setCategory('all')"
        >
          Все
        </button>
        <button
          v-for="category in availableCategories"
          :key="category"
          type="button"
          class="catalog-filter__chip"
          :class="{ 'is-active': activeCategory === category }"
          role="tab"
          @click="setCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <div class="catalog-filter__grid">
        <article
          v-for="{ item, index } in filtered"
          :key="index"
          class="catalog-card"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: (index % 6) * 70, ease: 'easeOut' } }"
        >
          <div class="catalog-card__media">
            <img v-if="item.image" :src="item.image" alt="" class="catalog-card__img" />
            <ImagePlaceholder v-else label="Товар" icon="🛍️" />
          </div>
          <EditableText
            tag="h3"
            class="catalog-card__name"
            :model-value="item.name"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updateItem(index, { name: v })"
          />
          <EditableText
            v-if="item.description || editable"
            tag="p"
            class="catalog-card__desc"
            :model-value="item.description"
            :editable="editable"
            multiline
            placeholder="Описание"
            @update:model-value="(v) => updateItem(index, { description: v })"
          />
          <EditableText
            v-if="item.price || editable"
            tag="span"
            class="catalog-card__price"
            :model-value="item.price"
            :editable="editable"
            placeholder="Цена"
            @update:model-value="(v) => updateItem(index, { price: v })"
          />
        </article>
        <p v-if="!filtered.length" class="catalog-filter__empty">Ничего не найдено в этой категории.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.catalog-filter {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.catalog-filter__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.catalog-filter__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.catalog-filter__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.catalog-filter__chip {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.catalog-filter__chip:hover {
  border-color: var(--primary);
  color: var(--text);
}

.catalog-filter__chip.is-active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.catalog-filter__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.catalog-filter__empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-6) 0;
}

.catalog-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
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
  aspect-ratio: 4 / 3;
}

.catalog-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.catalog-card__name {
  padding: 0 var(--space-4);
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.catalog-card__desc {
  padding: 0 var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.catalog-card__price {
  margin-top: auto;
  padding: 0 var(--space-4) var(--space-4);
  font-weight: 700;
  color: var(--primary);
  font-size: var(--fs-base);
}

@container (max-width: 900px) {
  .catalog-filter__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 600px) {
  .catalog-filter__grid {
    grid-template-columns: 1fr;
  }
}
</style>
