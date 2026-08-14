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
  <section class="testimonials testimonials--quotes">
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

      <div class="quote-list">
        <blockquote
          v-for="(item, i) in section.items"
          :key="i"
          class="quote"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 100, ease: 'easeOut' } }"
        >
          <span class="quote__mark" aria-hidden="true">&ldquo;</span>
          <EditableText
            tag="p"
            class="quote__text"
            :model-value="item.text"
            :editable="editable"
            multiline
            placeholder="Текст отзыва"
            @update:model-value="(v) => updateItem(i, { text: v })"
          />
          <footer class="quote__footer">
            <img v-if="item.avatar" :src="item.avatar" alt="" class="quote__avatar" />
            <div v-else class="quote__avatar quote__avatar--placeholder">{{ (item.author || '?').charAt(0) }}</div>
            <EditableText
              tag="cite"
              class="quote__author"
              :model-value="item.author"
              :editable="editable"
              placeholder="Автор"
              @update:model-value="(v) => updateItem(i, { author: v })"
            />
          </footer>
        </blockquote>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials--quotes {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.testimonials__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-7);
}

.testimonials__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.quote-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}

.quote {
  margin: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.quote__mark {
  font-size: 3.5rem;
  line-height: 1;
  color: var(--primary-light);
  font-family: Georgia, serif;
}

.quote__text {
  font-size: var(--fs-2xl);
  font-weight: 500;
  line-height: 1.4;
  color: var(--text);
  letter-spacing: -0.01em;
}

.quote__footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.quote__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.quote__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 25%, white), color-mix(in srgb, var(--primary) 10%, white));
  color: var(--primary);
  font-weight: 700;
}

.quote__author {
  font-style: normal;
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
