<script setup lang="ts">
import type { HeaderSection, NavItem } from '~/types/site'

const props = defineProps<{
  section: HeaderSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<HeaderSection>]
  select: []
}>()

function updateNavItem(index: number, patch: Partial<NavItem>) {
  const nav_items = props.section.nav_items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { nav_items })
}
</script>

<template>
  <header class="header header--centered" :class="{ 'header--sticky': section.sticky }">
    <div class="header__inner">
      <EditableText
        tag="span"
        class="header__logo"
        :model-value="section.logo_text"
        :editable="editable"
        placeholder="Логотип"
        @update:model-value="(v) => emit('update:section', { logo_text: v })"
      />

      <nav v-if="section.nav_items.length" class="header__nav">
        <EditableText
          v-for="(item, i) in section.nav_items"
          :key="i"
          tag="a"
          :href="item.href || '#'"
          class="header__nav-link"
          :model-value="item.label"
          :editable="editable"
          @update:model-value="(v) => updateNavItem(i, { label: v })"
        />
      </nav>

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
.header--centered {
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
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
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.header__logo {
  font-weight: 700;
  font-size: var(--fs-xl);
  letter-spacing: -0.01em;
}

.header__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.header__nav-link {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.header__nav-link:hover {
  color: var(--primary);
}

.header__cta {
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: white;
  font-size: var(--fs-sm);
  font-weight: 600;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.header__cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
