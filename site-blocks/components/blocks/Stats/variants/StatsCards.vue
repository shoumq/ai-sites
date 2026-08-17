<script setup lang="ts">
// Каждая цифра — отдельной карточкой с рамкой. Держит форму, когда показателей
// много (в ряд они бы сжались в нечитаемую строку).
import type { StatItem, StatsSection } from '~/types/site'

const props = defineProps<{
  section: StatsSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<StatsSection>]
  select: []
}>()

function updateItem(index: number, patch: Partial<StatItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="stats-cards">
    <div class="stats-cards__inner is-centered">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="stats-cards__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="stats-cards__grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="stat-card"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: i * 80, ease: 'easeOut' } }"
        >
          <EditableText
            tag="span"
            class="stat-card__value"
            :model-value="item.value"
            :editable="editable"
            placeholder="500+"
            @update:model-value="(v) => updateItem(i, { value: v })"
          />
          <EditableText
            tag="span"
            class="stat-card__label"
            :model-value="item.label"
            :editable="editable"
            placeholder="довольных клиентов"
            @update:model-value="(v) => updateItem(i, { label: v })"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-cards {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.stats-cards__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.stats-cards__title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  text-align: center;
  color: var(--text);
}

.stats-cards__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--card-p);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  background: var(--surface);
  text-align: center;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-card__value {
  font-size: var(--fs-3xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--primary);
}

.stat-card__label {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
