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

function stars(rating: number) {
  const r = Math.max(0, Math.min(5, rating))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}
</script>

<template>
  <section class="testimonials testimonials--cards">
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

      <div class="testimonials__grid">
        <article
          v-for="(item, i) in section.items"
          :key="i"
          class="testimonial-card"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 420, delay: i * 90, ease: 'easeOut' } }"
        >
          <span class="testimonial-card__stars" aria-hidden="true">{{ stars(item.rating) }}</span>
          <EditableText
            tag="p"
            class="testimonial-card__text"
            :model-value="item.text"
            :editable="editable"
            multiline
            placeholder="Текст отзыва"
            @update:model-value="(v) => updateItem(i, { text: v })"
          />
          <div class="testimonial-card__author-row">
            <img v-if="item.avatar" :src="item.avatar" alt="" class="testimonial-card__avatar" />
            <div v-else class="testimonial-card__avatar testimonial-card__avatar--placeholder">{{ (item.author || '?').charAt(0) }}</div>
            <EditableText
              tag="span"
              class="testimonial-card__author"
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
.testimonials--cards {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.testimonials__inner {
  max-width: 1200px;
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

.testimonials__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.testimonial-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--surface);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.testimonial-card__stars {
  color: #f5b301;
  font-size: var(--fs-base);
  letter-spacing: 2px;
}

.testimonial-card__text {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  line-height: 1.65;
}

.testimonial-card__author-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.testimonial-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.testimonial-card__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 25%, white), color-mix(in srgb, var(--primary) 10%, white));
  color: var(--primary);
  font-weight: 700;
}

.testimonial-card__author {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--text);
}

@media (max-width: 900px) {
  .testimonials__grid {
    grid-template-columns: 1fr;
  }
}
</style>
