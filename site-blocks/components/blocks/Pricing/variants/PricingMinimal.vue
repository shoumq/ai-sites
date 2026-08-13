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
  <section class="pricing pricing--minimal">
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
          class="plan-mini"
          :class="{ 'plan-mini--highlighted': plan.highlighted }"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: i * 80, ease: 'easeOut' } }"
        >
          <EditableText
            tag="h3"
            class="plan-mini__name"
            :model-value="plan.name"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updatePlan(i, { name: v })"
          />
          <div class="plan-mini__price-row">
            <EditableText
              tag="span"
              class="plan-mini__price"
              :model-value="plan.price"
              :editable="editable"
              placeholder="Цена"
              @update:model-value="(v) => updatePlan(i, { price: v })"
            />
            <span class="plan-mini__period-slash">/</span>
            <EditableText
              tag="span"
              class="plan-mini__period"
              :model-value="plan.period"
              :editable="editable"
              placeholder="период"
              @update:model-value="(v) => updatePlan(i, { period: v })"
            />
          </div>
          <span class="plan-mini__cta">Выбрать</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing--minimal {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.pricing__inner {
  max-width: 900px;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.plan-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.plan-mini:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
}

.plan-mini--highlighted {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, white);
}

.plan-mini__name {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--text);
}

.plan-mini__price-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.plan-mini__price {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--primary);
}

.plan-mini__period-slash,
.plan-mini__period {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.plan-mini__cta {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.plan-mini__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 720px) {
  .pricing__row {
    grid-template-columns: 1fr;
  }
}
</style>
