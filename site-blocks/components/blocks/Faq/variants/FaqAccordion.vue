<script setup lang="ts">
import type { FaqSection, FaqItem } from '~/types/site'

const props = defineProps<{
  section: FaqSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FaqSection>]
  select: []
}>()

// Открыт первый пункт по умолчанию — пустая страница вопросов выглядит
// незаконченной, а раскрытый первый ответ сразу даёт понять, как это работает.
const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

function updateItem(index: number, patch: Partial<FaqItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="faq">
    <div class="faq__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="faq__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="faq__list">
        <div v-for="(item, i) in section.items" :key="i" class="faq-item" :class="{ 'is-open': openIndex === i }">
          <button
            type="button"
            class="faq-item__question"
            :aria-expanded="openIndex === i"
            :aria-controls="`faq-answer-${section.id}-${i}`"
            @click="toggle(i)"
          >
            <EditableText
              tag="span"
              class="faq-item__question-text"
              :model-value="item.question"
              :editable="editable"
              placeholder="Вопрос"
              @update:model-value="(v) => updateItem(i, { question: v })"
              @click.stop
            />
            <span class="faq-item__icon" aria-hidden="true">{{ openIndex === i ? '−' : '+' }}</span>
          </button>
          <div v-if="openIndex === i || editable" :id="`faq-answer-${section.id}-${i}`" class="faq-item__answer">
            <EditableText
              tag="p"
              :model-value="item.answer"
              :editable="editable"
              multiline
              placeholder="Ответ"
              @update:model-value="(v) => updateItem(i, { answer: v })"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.faq__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.faq__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.faq__list {
  display: flex;
  flex-direction: column;
}

.faq-item {
  border-bottom: 1px solid var(--border-color);
}

.faq-item:first-child {
  border-top: 1px solid var(--border-color);
}

.faq-item__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.faq-item__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  color: var(--primary);
  font-size: 1.1rem;
  transition: transform var(--transition-fast);
}

.faq-item.is-open .faq-item__icon {
  transform: rotate(180deg);
}

.faq-item__answer {
  padding: 0 0 var(--space-4);
  color: var(--text-muted);
  font-size: var(--fs-base);
  max-width: 65ch;
}
</style>
