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
  <section class="grid3col grid3col--icon-rows">
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

      <div class="row-list">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="service-row"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 400, delay: i * 80, ease: 'easeOut' } }"
        >
          <span class="service-row__index">{{ String(i + 1).padStart(2, '0') }}</span>
          <span v-if="item.icon" class="service-row__icon" aria-hidden="true">{{ item.icon }}</span>
          <div class="service-row__body">
            <EditableText
              tag="h3"
              class="service-row__name"
              :model-value="item.name"
              :editable="editable"
              placeholder="Название"
              @update:model-value="(v) => updateItem(i, { name: v })"
            />
            <EditableText
              v-if="item.description || editable"
              tag="p"
              class="service-row__desc"
              :model-value="item.description"
              :editable="editable"
              multiline
              placeholder="Описание"
              @update:model-value="(v) => updateItem(i, { description: v })"
            />
          </div>
          <EditableText
            v-if="item.price || editable"
            tag="span"
            class="service-row__price"
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
.grid3col--icon-rows {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.grid3col__inner {
  max-width: 900px;
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

.row-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.service-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.service-row:hover {
  background: var(--surface);
  transform: translateX(4px);
}

.service-row:last-child {
  border-bottom: none;
}

.service-row__index {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--primary);
  min-width: 2.2ch;
}

.service-row__icon {
  font-size: 1.5rem;
}

.service-row__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.service-row__name {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.service-row__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.service-row__price {
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

@container (max-width: 600px) {
  .service-row {
    flex-wrap: wrap;
  }
  .service-row__price {
    margin-left: calc(2.2ch + var(--space-4));
  }
}
</style>
