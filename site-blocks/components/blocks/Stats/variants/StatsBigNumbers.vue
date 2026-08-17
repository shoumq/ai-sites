<script setup lang="ts">
// Очень крупные цифры на тёмной подложке, по две в ряд, с тонкими
// разделителями. Плакатный вариант — когда цифры и есть главный аргумент
// секции, а не сопровождение к тексту.
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
  <section class="stats-big">
    <div class="stats-big__inner is-centered">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="stats-big__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="stats-big__grid">
        <div
          v-for="(item, i) in section.items"
          :key="i"
          class="big-stat"
          v-motion
          :initial="{ opacity: 0, scale: 0.94 }"
          :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <EditableText
            tag="span"
            class="big-stat__value"
            :model-value="item.value"
            :editable="editable"
            placeholder="500+"
            @update:model-value="(v) => updateItem(i, { value: v })"
          />
          <EditableText
            tag="span"
            class="big-stat__label"
            :model-value="item.label"
            :editable="editable"
            placeholder="довольных клиентов"
            @update:model-value="(v) => updateItem(i, { label: v })"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-big {
  padding: var(--section-py) var(--space-5);
  background: var(--surface-inverse);
  color: var(--text-inverse);
}

.stats-big__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.stats-big__title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  text-align: center;
  color: var(--text-inverse);
}

.stats-big__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.big-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6) var(--card-p);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.big-stat:nth-child(odd) {
  border-right: 1px solid rgba(255, 255, 255, 0.14);
}

.big-stat__value {
  font-size: var(--fs-4xl);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--primary-light);
}

.big-stat__label {
  font-size: var(--fs-base);
  color: rgba(255, 255, 255, 0.7);
}

@container (max-width: 640px) {
  .stats-big__grid {
    grid-template-columns: 1fr;
  }
  .big-stat:nth-child(odd) {
    border-right: none;
  }
}
</style>
