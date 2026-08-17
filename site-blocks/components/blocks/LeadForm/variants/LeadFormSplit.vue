<script setup lang="ts">
// Две колонки: смысл заявки и картинка слева, сама форма — справа.
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
  <section class="lead-split">
    <div class="lead-split__inner">
      <div class="lead-split__intro">
        <EditableText
          v-if="section.title || editable"
          tag="h2"
          class="lead-split__title"
          :model-value="section.title"
          :editable="editable"
          placeholder="Заголовок формы"
          @update:model-value="(v) => emit('update:section', { title: v })"
        />
        <EditableText
          v-if="section.subtitle || editable"
          tag="p"
          class="lead-split__subtitle"
          :model-value="section.subtitle"
          :editable="editable"
          multiline
          placeholder="Подзаголовок"
          @update:model-value="(v) => emit('update:section', { subtitle: v })"
        />
        <div class="lead-split__media">
          <img v-if="section.image" :src="section.image" alt="" class="lead-split__img">
          <ImagePlaceholder v-else label="Изображение формы" icon="✉️" />
        </div>
      </div>

      <div class="lead-split__form">
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
.lead-split {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.lead-split__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

.lead-split__intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.lead-split__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.lead-split__subtitle {
  font-size: var(--fs-lg);
  color: var(--text-muted);
}

.lead-split__media {
  border-radius: var(--radius-block);
  overflow: hidden;
  min-height: 220px;
}

.lead-split__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lead-split__form {
  padding: var(--card-p);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-block);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

@container (max-width: 860px) {
  .lead-split__inner {
    grid-template-columns: 1fr;
  }
  .lead-split__media {
    display: none;
  }
}
</style>
