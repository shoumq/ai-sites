<script setup lang="ts">
// Простой узкий список без рамок и подложек: вопрос — крупно, ответ — под ним.
// Вариант для строгих сайтов, где карточки и аккордеоны выглядят инородно.
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
  <section class="faq-plain">
    <div class="faq-plain__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="faq-plain__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <dl class="faq-plain__list">
        <div
          v-for="(item, i) in section.items"
          :key="i"
          class="faq-plain__item"
          v-motion
          :initial="{ opacity: 0, x: -12 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 340, delay: i * 60, ease: 'easeOut' } }"
        >
          <EditableText
            tag="dt"
            class="faq-plain__q"
            :model-value="item.question"
            :editable="editable"
            placeholder="Вопрос"
            @update:model-value="(v) => updateItem(i, { question: v })"
          />
          <EditableText
            tag="dd"
            class="faq-plain__a"
            :model-value="item.answer"
            :editable="editable"
            multiline
            placeholder="Ответ"
            @update:model-value="(v) => updateItem(i, { answer: v })"
          />
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.faq-plain {
  padding: var(--section-py) var(--space-5);
  background: var(--surface);
}

.faq-plain__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
}

.faq-plain__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.faq-plain__list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.faq-plain__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.faq-plain__q {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text);
}

.faq-plain__a {
  margin: 0;
  font-size: var(--fs-base);
  color: var(--text-muted);
  line-height: 1.65;
}
</style>
