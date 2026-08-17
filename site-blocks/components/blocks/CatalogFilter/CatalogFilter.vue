<script setup lang="ts">
/**
 * Каталог товаров/услуг.
 *
 * В отличие от остальных диспетчеров блоков, этот не только выбирает вариант
 * вёрстки, но и держит общую «обвязку»: заголовок, чипсы категорий, поиск и
 * само состояние фильтра. Причина — фильтрация обязана работать одинаково во
 * всех трёх вариантах (grid/list/showcase); если бы каждый вариант заводил
 * свой useCatalogFilter и свои чипсы, они бы неизбежно разъехались, а смена
 * варианта сбрасывала бы выбранную категорию.
 *
 * Варианты получают уже отфильтрованный список и рисуют только карточки.
 */
import { toRef } from 'vue'
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
const { activeCategory, query, availableCategories, filtered, setCategory } = useCatalogFilter(items, categoriesProp)

function updateItem(index: number, patch: Partial<CatalogItem>) {
  const updated = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items: updated })
}
</script>

<template>
  <section class="catalog">
    <div class="catalog__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="catalog__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок каталога"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div v-if="section.show_search" class="catalog__search">
        <input v-model="query" type="search" placeholder="Поиск по каталогу" aria-label="Поиск по каталогу">
      </div>

      <div v-if="availableCategories.length" class="catalog__chips" role="tablist">
        <button
          type="button"
          class="catalog__chip"
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
          class="catalog__chip"
          :class="{ 'is-active': activeCategory === category }"
          role="tab"
          @click="setCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <CatalogFilterList
        v-if="section.variant === 'list'"
        :section="section"
        :entries="filtered"
        :editable="editable"
        @update-item="updateItem"
      />
      <CatalogFilterShowcase
        v-else-if="section.variant === 'showcase'"
        :section="section"
        :entries="filtered"
        :editable="editable"
        @update-item="updateItem"
      />
      <CatalogFilterGrid v-else :section="section" :entries="filtered" :editable="editable" @update-item="updateItem" />

      <p v-if="!filtered.length" class="catalog__empty">Ничего не найдено. Попробуйте изменить фильтр.</p>
    </div>
  </section>
</template>

<style scoped>
.catalog {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.catalog__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--stack-gap);
}

.catalog__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.catalog__search {
  width: min(460px, 100%);
}

.catalog__search input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-control);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: var(--fs-base);
}

.catalog__search input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
}

.catalog__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.catalog__chip {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-control);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.catalog__chip:hover {
  border-color: var(--primary);
  color: var(--text);
}

.catalog__chip.is-active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.catalog__empty {
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-6) 0;
}
</style>
