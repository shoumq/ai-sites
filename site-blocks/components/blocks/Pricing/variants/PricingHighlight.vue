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
</script>

<template>
  <section class="pricing pricing--highlight">
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

      <div class="pricing__row">
        <article
          v-for="(plan, i) in section.plans"
          :key="i"
          class="plan-card"
          :class="{ 'plan-card--highlighted': plan.highlighted }"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <span v-if="plan.highlighted" class="plan-card__badge">Рекомендуем</span>
          <EditableText
            tag="h3"
            class="plan-card__name"
            :model-value="plan.name"
            :editable="editable"
            placeholder="Название плана"
            @update:model-value="(v) => updatePlan(i, { name: v })"
          />
          <div class="plan-card__price-row">
            <EditableText
              tag="span"
              class="plan-card__price"
              :model-value="plan.price"
              :editable="editable"
              placeholder="Цена"
              @update:model-value="(v) => updatePlan(i, { price: v })"
            />
            <span class="plan-card__period-slash">/</span>
            <EditableText
              tag="span"
              class="plan-card__period"
              :model-value="plan.period"
              :editable="editable"
              placeholder="период"
              @update:model-value="(v) => updatePlan(i, { period: v })"
            />
          </div>
          <ul v-if="plan.features.length" class="plan-card__features">
            <li v-for="(feature, fi) in plan.features" :key="fi">{{ feature }}</li>
          </ul>
          <span class="plan-card__cta">Выбрать план</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing--highlight {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.pricing__inner {
  max-width: 1100px;
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

.pricing__row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.plan-card {
  position: relative;
  flex: 1 1 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.plan-card--highlighted {
  flex-basis: 320px;
  max-width: 360px;
  transform: scale(1.08);
  border-color: var(--primary);
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 6%, white), var(--surface));
  box-shadow: var(--shadow-lg);
  z-index: 1;
}

.plan-card--highlighted:hover {
  transform: scale(1.08) translateY(-4px);
}

.plan-card__badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-1) var(--space-4);
  border-radius: 999px;
  background: var(--primary);
  color: white;
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
}

.plan-card__name {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.plan-card__price-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-1);
}

.plan-card__price {
  font-size: var(--fs-3xl);
  font-weight: 700;
  color: var(--primary);
}

.plan-card__period-slash,
.plan-card__period {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

.plan-card__features {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.plan-card__features li {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  padding-left: var(--space-4);
  position: relative;
}

.plan-card__features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: 700;
}

.plan-card__cta {
  text-align: center;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.plan-card__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@container (max-width: 860px) {
  .pricing__row {
    flex-direction: column;
    align-items: stretch;
  }
  .plan-card,
  .plan-card--highlighted {
    max-width: 420px;
    margin: 0 auto;
    transform: none;
  }
  .plan-card--highlighted:hover {
    transform: translateY(-4px);
  }
}
</style>
