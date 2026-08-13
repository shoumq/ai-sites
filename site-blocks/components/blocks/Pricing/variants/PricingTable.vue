<script setup lang="ts">
import type { PricingPlan, PricingSection } from '~/types/site'

const props = defineProps<{
  section: PricingSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<PricingSection>]
  select: []
}>()

function updatePlan(index: number, patch: Partial<PricingPlan>) {
  const plans = props.section.plans.map((plan, i) => (i === index ? { ...plan, ...patch } : plan))
  emit('update:section', { plans })
}

// Для сетки-таблицы нужно общее число строк фич — берём максимум по всем планам,
// чтобы аккуратно выровнять строки (ряды без фичи на этом индексе остаются пустыми).
const maxFeatures = computed(() => Math.max(0, ...props.section.plans.map((p) => p.features.length)))
</script>

<template>
  <section class="pricing pricing--table">
    <div class="pricing__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="pricing__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div
        class="table"
        :style="{ '--plan-count': section.plans.length }"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
      >
        <div class="table__row table__row--head">
          <div class="table__cell table__cell--label" />
          <div v-for="(plan, i) in section.plans" :key="i" class="table__cell" :class="{ 'table__cell--highlighted': plan.highlighted }">
            <EditableText
              tag="span"
              class="table__plan-name"
              :model-value="plan.name"
              :editable="editable"
              placeholder="План"
              @update:model-value="(v) => updatePlan(i, { name: v })"
            />
            <div class="table__price-row">
              <EditableText
                tag="span"
                class="table__price"
                :model-value="plan.price"
                :editable="editable"
                placeholder="Цена"
                @update:model-value="(v) => updatePlan(i, { price: v })"
              />
              <span class="table__period-slash">/</span>
              <EditableText
                tag="span"
                class="table__period"
                :model-value="plan.period"
                :editable="editable"
                placeholder="период"
                @update:model-value="(v) => updatePlan(i, { period: v })"
              />
            </div>
          </div>
        </div>

        <div v-for="fi in maxFeatures" :key="fi" class="table__row">
          <div class="table__cell table__cell--label">Опция {{ fi }}</div>
          <div v-for="(plan, i) in section.plans" :key="i" class="table__cell" :class="{ 'table__cell--highlighted': plan.highlighted }">
            {{ plan.features[fi - 1] || '—' }}
          </div>
        </div>

        <div class="table__row table__row--cta">
          <div class="table__cell table__cell--label" />
          <div v-for="(plan, i) in section.plans" :key="i" class="table__cell" :class="{ 'table__cell--highlighted': plan.highlighted }">
            <span class="table__cta">Выбрать</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing--table {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.pricing__inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.pricing__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.table {
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table__row {
  display: grid;
  grid-template-columns: 1.2fr repeat(var(--plan-count), 1fr);
}

.table__row:nth-child(even) {
  background: var(--surface-muted);
}

.table__cell {
  padding: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.table__cell--label {
  text-align: left;
  align-items: flex-start;
  font-weight: 500;
  color: var(--text);
}

.table__cell--highlighted {
  background: color-mix(in srgb, var(--primary) 7%, transparent);
}

.table__row--head .table__cell {
  padding: var(--space-5) var(--space-4);
}

.table__plan-name {
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--text);
}

.table__price-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.table__price {
  font-weight: 700;
  font-size: var(--fs-xl);
  color: var(--primary);
}

.table__period-slash,
.table__period {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.table__cta {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.table__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.table__row--cta .table__cell {
  padding: var(--space-4);
}

@media (max-width: 640px) {
  .table {
    overflow-x: auto;
  }
  .table__row {
    min-width: 480px;
  }
}
</style>
