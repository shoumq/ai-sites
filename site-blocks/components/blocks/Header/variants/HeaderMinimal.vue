<script setup lang="ts">
import type { HeaderSection, Theme } from '~/types/site'

defineProps<{
  section: HeaderSection
  editable?: boolean
  theme?: Theme
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<HeaderSection>]
  select: []
}>()
</script>

<template>
  <header class="header header--minimal" :class="{ 'header--sticky': section.sticky }">
    <div class="header__inner">
      <img v-if="theme?.logo_url" :src="theme.logo_url" :alt="section.logo_text || 'Логотип'" class="header__logo-img">
      <EditableText
        v-else
        tag="span"
        class="header__logo"
        :model-value="section.logo_text"
        :editable="editable"
        placeholder="Логотип"
        @update:model-value="(v) => emit('update:section', { logo_text: v })"
      />

      <EditableText
        v-if="section.cta_text || editable"
        tag="span"
        class="header__cta"
        :model-value="section.cta_text"
        :editable="editable"
        placeholder="Кнопка"
        @update:model-value="(v) => emit('update:section', { cta_text: v })"
      />
    </div>
  </header>
</template>

<style scoped>
.header--minimal {
  background: var(--surface);
}

.header--sticky {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  font-weight: 700;
  font-size: var(--fs-lg);
  letter-spacing: -0.01em;
}

.header__logo-img {
  height: 32px;
  max-width: 160px;
  width: auto;
  object-fit: contain;
}

.header__cta {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.header__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
