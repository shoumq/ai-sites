<script setup lang="ts">
// Форма карточкой по центру на акцентной подложке — самостоятельный
// «экран-призыв», когда картинка не нужна и всё внимание должно быть на форме.
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
  <section class="lead-card">
    <div class="lead-card__inner is-centered">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="lead-card__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок формы"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />
      <EditableText
        v-if="section.subtitle || editable"
        tag="p"
        class="lead-card__subtitle"
        :model-value="section.subtitle"
        :editable="editable"
        multiline
        placeholder="Подзаголовок"
        @update:model-value="(v) => emit('update:section', { subtitle: v })"
      />

      <div class="lead-card__box">
        <LeadFormFields
          :fields="section.fields"
          :submit-text="section.submit_text"
          :success-text="section.success_text"
          :consent-text="section.consent_text"
          :source-block="section.id"
          :editable="editable"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.lead-card {
  padding: var(--section-py) var(--space-5);
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--primary) 12%, var(--surface)) 0%,
    var(--surface) 65%
  );
}

.lead-card__inner {
  max-width: 620px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.lead-card__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.lead-card__subtitle {
  font-size: var(--fs-lg);
  color: var(--text-muted);
}

.lead-card__box {
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--card-p);
  border-radius: var(--radius-block);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  text-align: left;
}
</style>
