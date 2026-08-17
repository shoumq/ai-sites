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
  <section class="grid3col grid3col--icon-top">
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

      <div class="grid3col__grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="service-card service-card--icon-top"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <div class="service-card__icon-badge">
            <span aria-hidden="true">{{ item.icon || '⭐' }}</span>
          </div>
          <EditableText
            tag="h3"
            class="service-card__name"
            :model-value="item.name"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updateItem(i, { name: v })"
          />
          <EditableText
            v-if="item.description || editable"
            tag="p"
            class="service-card__desc"
            :model-value="item.description"
            :editable="editable"
            multiline
            placeholder="Описание"
            @update:model-value="(v) => updateItem(i, { description: v })"
          />
          <EditableText
            v-if="item.price || editable"
            tag="span"
            class="service-card__price"
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
.grid3col--icon-top {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.grid3col__inner {
  max-width: 1200px;
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

.grid3col__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.service-card--icon-top {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.service-card--icon-top:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.service-card__icon-badge {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, white), color-mix(in srgb, var(--primary) 8%, white));
  margin-bottom: var(--space-2);
}

.service-card__name {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.service-card__desc {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.service-card__price {
  margin-top: var(--space-1);
  font-weight: 700;
  color: var(--primary);
  font-size: var(--fs-base);
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

@container (max-width: 900px) {
  .grid3col__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 600px) {
  .grid3col__grid {
    grid-template-columns: 1fr;
  }
}
</style>
