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
  <section class="hero hero--minimal">
    <div
      class="hero__content"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
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
.hero--minimal {
  background: var(--primary);
  padding: var(--space-8) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(320px, 44vw, 480px);
}

.hero__content {
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
  opacity: 0.9;
  max-width: 52ch;
}

.hero__cta {
  margin-top: var(--space-2);
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  background: white;
  color: var(--primary);
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
