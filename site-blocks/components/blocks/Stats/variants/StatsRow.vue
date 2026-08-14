<script setup lang="ts">
import type { StatsSection, StatItem } from '~/types/site'

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
  <section class="stats">
    <div class="stats__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="stats__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок (необязательно)"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />
      <div class="stats__row">
        <div
          v-for="(item, i) in section.items"
          :key="i"
          class="stat-item"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <EditableText
            tag="span"
            class="stat-item__value"
            :model-value="item.value"
            :editable="editable"
            placeholder="500+"
            @update:model-value="(v) => updateItem(i, { value: v })"
          />
          <EditableText
            tag="span"
            class="stat-item__label"
            :model-value="item.label"
            :editable="editable"
            placeholder="Подпись"
            @update:model-value="(v) => updateItem(i, { label: v })"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  padding: var(--space-7) var(--space-5);
  background: var(--surface);
}

.stats__inner {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.stats__title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.stats__row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-6);
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-item__value {
  font-size: var(--fs-4xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary);
}

.stat-item__label {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
