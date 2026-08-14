<script setup lang="ts">
import type { Testimonial, TestimonialsSection } from '~/types/site'

const props = defineProps<{
  section: TestimonialsSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<TestimonialsSection>]
  select: []
}>()

function updateItem(index: number, patch: Partial<Testimonial>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="testimonials testimonials--avatars-row">
    <div class="testimonials__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="testimonials__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="avatar-list">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="avatar-row"
          v-motion
          :initial="{ opacity: 0, x: -16 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 380, delay: i * 70, ease: 'easeOut' } }"
        >
          <img v-if="item.avatar" :src="item.avatar" alt="" class="avatar-row__avatar" />
          <div v-else class="avatar-row__avatar avatar-row__avatar--placeholder">{{ (item.author || '?').charAt(0) }}</div>
          <div class="avatar-row__body">
            <EditableText
              tag="p"
              class="avatar-row__text"
              :model-value="item.text"
              :editable="editable"
              multiline
              placeholder="Текст отзыва"
              @update:model-value="(v) => updateItem(i, { text: v })"
            />
            <EditableText
              tag="span"
              class="avatar-row__author"
              :model-value="item.author"
              :editable="editable"
              placeholder="Автор"
              @update:model-value="(v) => updateItem(i, { author: v })"
            />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials--avatars-row {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.testimonials__inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.testimonials__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.avatar-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.avatar-row:hover {
  background: var(--surface-muted);
  transform: translateX(4px);
}

.avatar-row__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-row__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 25%, white), color-mix(in srgb, var(--primary) 10%, white));
  color: var(--primary);
  font-weight: 700;
}

.avatar-row__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.avatar-row__text {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.avatar-row__author {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--text);
}
</style>
