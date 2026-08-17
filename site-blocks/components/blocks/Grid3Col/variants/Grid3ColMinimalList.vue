<script setup lang="ts">
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
  <section class="grid3col grid3col--minimal-list">
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

      <ul class="minimal-list">
        <li
          v-for="(item, i) in section.items"
          :key="i"
          class="minimal-list__row"
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 350, delay: i * 60, ease: 'easeOut' } }"
        >
          <EditableText
            tag="span"
            class="minimal-list__name"
            :model-value="item.name"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updateItem(i, { name: v })"
          />
          <span class="minimal-list__dots" aria-hidden="true" />
          <EditableText
            tag="span"
            class="minimal-list__price"
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
            :sku="item.sku"
            :editable="editable"
          />
        </li>
      </ul>

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
.grid3col--minimal-list {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.grid3col__inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.grid3col__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.minimal-list {
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.minimal-list__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-1);
  transition: transform var(--transition-fast);
}

.minimal-list__row:hover {
  transform: translateX(4px);
}

.minimal-list__name {
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
}

.minimal-list__dots {
  flex: 1;
  border-bottom: 1px dotted var(--border-color);
  margin-bottom: 0.3em;
}

.minimal-list__price {
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

.grid3col__cta {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.grid3col__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
