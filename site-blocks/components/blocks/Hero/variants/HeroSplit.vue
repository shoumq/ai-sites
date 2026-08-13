<script setup lang="ts">
import type { HeroSection } from '~/types/site'

defineProps<{
  section: HeroSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<HeroSection>]
  select: []
}>()
</script>

<template>
  <section class="hero hero--split">
    <div class="hero__grid">
      <div
        class="hero__content"
        v-motion
        :initial="{ opacity: 0, x: -24 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 500, ease: 'easeOut' } }"
      >
        <EditableText
          tag="h1"
          class="hero__title"
          :model-value="section.title"
          :editable="editable"
          placeholder="Заголовок"
          @update:model-value="(v) => emit('update:section', { title: v })"
        />
        <EditableText
          tag="p"
          class="hero__subtitle"
          :model-value="section.subtitle"
          :editable="editable"
          multiline
          placeholder="Подзаголовок"
          @update:model-value="(v) => emit('update:section', { subtitle: v })"
        />
        <a v-if="section.cta_text || editable" class="hero__cta" :href="section.cta_href || '#'">
          <EditableText
            tag="span"
            :model-value="section.cta_text"
            :editable="editable"
            placeholder="Кнопка"
            @update:model-value="(v) => emit('update:section', { cta_text: v })"
          />
        </a>
      </div>

      <div
        class="hero__media"
        v-motion
        :initial="{ opacity: 0, x: 24 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 500, delay: 120, ease: 'easeOut' } }"
      >
        <img v-if="section.bg_image" :src="section.bg_image" alt="" class="hero__image" />
        <ImagePlaceholder v-else label="Изображение" icon="🖼️" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero--split {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.hero__grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero__title {
  font-size: var(--fs-4xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
}

.hero__subtitle {
  font-size: var(--fs-lg);
  color: var(--text-muted);
  max-width: 48ch;
}

.hero__cta {
  margin-top: var(--space-2);
  align-self: flex-start;
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: var(--fs-base);
  text-decoration: none;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.hero__cta:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hero__media {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  aspect-ratio: 4 / 3;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 860px) {
  .hero__grid {
    grid-template-columns: 1fr;
  }
  .hero__cta {
    align-self: stretch;
    text-align: center;
  }
}
</style>
