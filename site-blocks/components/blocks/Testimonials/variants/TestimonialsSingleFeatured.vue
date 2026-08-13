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

// Вариант показывает один крупный отзыв — берём первый элемент массива.
const featured = computed<Testimonial | null>(() => props.section.items[0] ?? null)

function updateFeatured(patch: Partial<Testimonial>) {
  const items = props.section.items.length
    ? props.section.items.map((item, i) => (i === 0 ? { ...item, ...patch } : item))
    : [{ author: '', text: '', avatar: '', rating: 5, ...patch }]
  emit('update:section', { items })
}

function stars(rating: number) {
  const r = Math.max(0, Math.min(5, rating))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}
</script>

<template>
  <section class="testimonials testimonials--single-featured">
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

      <div
        v-if="featured || editable"
        class="featured"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 480, ease: 'easeOut' } }"
      >
        <img v-if="featured?.avatar" :src="featured.avatar" alt="" class="featured__avatar" />
        <div v-else class="featured__avatar featured__avatar--placeholder">{{ (featured?.author || '?').charAt(0) }}</div>

        <span class="featured__stars" aria-hidden="true">{{ stars(featured?.rating ?? 5) }}</span>

        <EditableText
          tag="p"
          class="featured__text"
          :model-value="featured?.text ?? ''"
          :editable="editable"
          multiline
          placeholder="Текст отзыва"
          @update:model-value="(v) => updateFeatured({ text: v })"
        />

        <EditableText
          tag="span"
          class="featured__author"
          :model-value="featured?.author ?? ''"
          :editable="editable"
          placeholder="Автор"
          @update:model-value="(v) => updateFeatured({ author: v })"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials--single-featured {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.testimonials__inner {
  max-width: 720px;
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

.featured {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: var(--space-7);
  border-radius: var(--radius-xl);
  background: var(--surface-muted);
  box-shadow: var(--shadow-md);
}

.featured__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}

.featured__avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xl);
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 25%, white), color-mix(in srgb, var(--primary) 10%, white));
  color: var(--primary);
  font-weight: 700;
}

.featured__stars {
  color: #f5b301;
  font-size: var(--fs-lg);
  letter-spacing: 3px;
}

.featured__text {
  font-size: var(--fs-2xl);
  font-weight: 500;
  line-height: 1.45;
  color: var(--text);
  letter-spacing: -0.01em;
}

.featured__author {
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
