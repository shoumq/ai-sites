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
        data-reveal
        :initial="{ opacity: editable ? 1 : 0, x: editable ? 0 : -24 }"
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
        data-reveal
        :initial="{ opacity: editable ? 1 : 0, x: editable ? 0 : 24 }"
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
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero__title {
  font-size: clamp(2.5rem, 5.8cqi, 5.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.055em;
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
  box-shadow: none;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.hero__cta:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hero__media {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: none;
  aspect-ratio: 4 / 5;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@container (max-width: 860px) {
  .hero__grid {
    grid-template-columns: 1fr;
  }
  .hero__cta {
    align-self: stretch;
    text-align: center;
  }
}

.hero__content { min-width: 0; padding-block: 24px; }
.hero__title { overflow-wrap: anywhere; max-width: 13ch; }
.hero__subtitle { line-height: 1.75; margin-top: 12px; }
.hero__cta { display: inline-flex; align-items: center; gap: 32px; min-height: 48px; margin-top: 20px; }
.hero__cta::after { content: '↗'; font-size: 1.2em; }
.hero__media { min-width: 0; }
@container (max-width: 860px) { .hero__media { aspect-ratio: 4 / 3; } .hero__title { max-width: 18ch; } .hero__grid { gap: 28px; } }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1 !important; transform: none !important; } }
</style>
