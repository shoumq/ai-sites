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
  <section
    class="hero hero--overlay"
    :style="section.bg_image ? { backgroundImage: `url(${section.bg_image})` } : undefined"
  >
    <ImagePlaceholder v-if="!section.bg_image" class="hero__placeholder" label="Фоновое изображение" icon="🌆" :rounded="false" />
    <div class="hero__scrim" aria-hidden="true" />

    <div
      class="hero__content"
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
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
  </section>
</template>

<style scoped>
.hero--overlay {
  position: relative;
  min-height: clamp(420px, 62vw, 680px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-inverse);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  padding: var(--space-6) var(--space-5);
}

.hero__placeholder {
  position: absolute;
  inset: 0;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 12, 24, 0.55) 0%, rgba(8, 12, 24, 0.75) 100%);
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 760px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  color: white;
}

.hero__title {
  font-size: var(--fs-4xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
}

.hero__subtitle {
  font-size: var(--fs-lg);
  opacity: 0.95;
  max-width: 56ch;
}

.hero__cta {
  margin-top: var(--space-3);
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
</style>
