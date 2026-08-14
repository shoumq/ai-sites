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
  <section class="hero hero--gradient">
    <div class="hero__glow" aria-hidden="true" />
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
.hero--gradient {
  position: relative;
  overflow: hidden;
  min-height: clamp(360px, 52vw, 580px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-5);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, var(--primary-light) 130%);
}

.hero__glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.22), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.14), transparent 50%);
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 780px;
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
}

.hero__subtitle {
  font-size: var(--fs-lg);
  opacity: 0.92;
  max-width: 52ch;
}

.hero__cta {
  margin-top: var(--space-2);
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  background: white;
  color: var(--primary-dark);
  font-weight: 700;
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
