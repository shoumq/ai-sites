<script setup lang="ts">
// Два столбца сразу раскрытых пар «вопрос — ответ». Без кликов: когда вопросов
// немного и ответы короткие, аккордеон только добавляет посетителю работы.
import type { FaqItem, FaqSection } from '~/types/site'

const props = defineProps<{
  section: FaqSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FaqSection>]
  select: []
}>()

function updateItem(index: number, patch: Partial<FaqItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="faq-cols">
    <div class="faq-cols__inner is-centered">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="faq-cols__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="faq-cols__grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="faq-cell"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 360, delay: (i % 4) * 70, ease: 'easeOut' } }"
        >
          <EditableText
            tag="h3"
            class="faq-cell__q"
            :model-value="item.question"
            :editable="editable"
            placeholder="Вопрос"
            @update:model-value="(v) => updateItem(i, { question: v })"
          />
          <EditableText
            tag="p"
            class="faq-cell__a"
            :model-value="item.answer"
            :editable="editable"
            multiline
            placeholder="Ответ"
            @update:model-value="(v) => updateItem(i, { answer: v })"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-cols {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.faq-cols__inner {
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.faq-cols__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.faq-cols__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--stack-gap);
}

.faq-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--card-p);
  border-radius: var(--radius-block);
  background: var(--surface-muted);
  border-left: 3px solid var(--primary);
}

.faq-cell__q {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text);
}

.faq-cell__a {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

@container (max-width: 720px) {
  .faq-cols__grid {
    grid-template-columns: 1fr;
  }
}
</style>
