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
  <header class="header header--split" :class="{ 'header--sticky': section.sticky }">
    <div class="header__inner">
      <div class="header__col header__col--start">
        <EditableText
          tag="span"
          class="header__logo"
          :model-value="section.logo_text"
          :editable="editable"
          placeholder="Логотип"
          @update:model-value="(v) => emit('update:section', { logo_text: v })"
        />
      </div>

      <nav v-if="section.nav_items.length" class="header__col header__col--center header__nav">
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
      <div v-else class="header__col header__col--center" />

      <div class="header__col header__col--end">
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
    </div>
  </header>
</template>

<style scoped>
.header--split {
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
  padding: var(--space-4) var(--space-5);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-4);
}

.header__col--start {
  justify-self: start;
}

.header__col--center {
  justify-self: center;
}

.header__col--end {
  justify-self: end;
}

.header__logo {
  font-weight: 700;
  font-size: var(--fs-lg);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.header__nav {
  display: flex;
  align-items: center;
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

@media (max-width: 720px) {
  .header__inner {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .header__col--start,
  .header__col--center,
  .header__col--end {
    justify-self: center;
  }
}
</style>
