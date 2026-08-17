<script setup lang="ts">
// Компактная полоса: заголовок слева, поля в одну линию справа. Для быстрого
// «оставьте телефон — перезвоним», который не должен занимать целый экран.
import type { LeadFormSection } from '~/types/site'

defineProps<{
  section: LeadFormSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<LeadFormSection>]
  select: []
}>()
</script>

<template>
  <section class="lead-inline">
    <div class="lead-inline__inner">
      <div class="lead-inline__text">
        <EditableText
          v-if="section.title || editable"
          tag="h2"
          class="lead-inline__title"
          :model-value="section.title"
          :editable="editable"
          placeholder="Заголовок формы"
          @update:model-value="(v) => emit('update:section', { title: v })"
        />
        <EditableText
          v-if="section.subtitle || editable"
          tag="p"
          class="lead-inline__subtitle"
          :model-value="section.subtitle"
          :editable="editable"
          multiline
          placeholder="Подзаголовок"
          @update:model-value="(v) => emit('update:section', { subtitle: v })"
        />
      </div>

      <div class="lead-inline__form">
        <LeadFormFields
          :fields="section.fields"
          :submit-text="section.submit_text"
          :success-text="section.success_text"
          :consent-text="section.consent_text"
          :source-block="section.id"
          :editable="editable"
          inline
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.lead-inline {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.lead-inline__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(220px, 340px) 1fr;
  gap: var(--space-6);
  align-items: center;
  padding: var(--card-p);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  background: color-mix(in srgb, var(--primary) 6%, var(--surface));
}

.lead-inline__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lead-inline__title {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--text);
}

.lead-inline__subtitle {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

@container (max-width: 860px) {
  .lead-inline__inner {
    grid-template-columns: 1fr;
  }
}
</style>
