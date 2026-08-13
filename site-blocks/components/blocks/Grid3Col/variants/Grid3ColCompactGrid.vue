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
  <section class="grid3col grid3col--compact">
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

      <div class="compact-grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="compact-card"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 350, delay: i * 60, ease: 'easeOut' } }"
        >
          <span v-if="item.icon" class="compact-card__icon" aria-hidden="true">{{ item.icon }}</span>
          <EditableText
            tag="h3"
            class="compact-card__name"
            :model-value="item.name"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updateItem(i, { name: v })"
          />
          <EditableText
            tag="span"
            class="compact-card__price"
            :model-value="item.price"
            :editable="editable"
            placeholder="Цена"
            @update:model-value="(v) => updateItem(i, { price: v })"
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
.grid3col--compact {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.grid3col__inner {
  max-width: 860px;
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

.compact-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.compact-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.compact-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.compact-card__icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.compact-card__name {
  flex: 1;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
}

.compact-card__price {
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  font-size: var(--fs-sm);
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

@container (max-width: 560px) {
  .compact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
