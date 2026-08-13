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

const { isOpen, toggle, close } = useMobileNav()
</script>

<template>
  <header class="header header--standard" :class="{ 'header--sticky': section.sticky }">
    <div class="header__inner">
      <EditableText
        tag="span"
        class="header__logo"
        :model-value="section.logo_text"
        :editable="editable"
        placeholder="Логотип"
        @update:model-value="(v) => emit('update:section', { logo_text: v })"
      />

      <nav v-if="section.nav_items.length" class="header__nav" :class="{ 'is-open': isOpen }">
        <EditableText
          v-for="(item, i) in section.nav_items"
          :key="i"
          tag="a"
          :href="item.href || '#'"
          class="header__nav-link"
          :model-value="item.label"
          :editable="editable"
          @update:model-value="(v) => updateNavItem(i, { label: v })"
          @click="close"
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

      <button
        v-if="section.nav_items.length"
        type="button"
        class="header__burger"
        :class="{ 'is-open': isOpen }"
        :aria-expanded="isOpen"
        aria-label="Меню"
        @click="toggle"
      >
        <span class="header__burger-line" />
        <span class="header__burger-line" />
        <span class="header__burger-line" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header--standard {
  position: relative;
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
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.header__logo {
  font-weight: 700;
  font-size: var(--fs-lg);
  letter-spacing: -0.01em;
  margin-right: auto;
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
  flex-shrink: 0;
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

.header__burger {
  display: none;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-direction: column;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0;
}

.header__burger-line {
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.header__burger.is-open .header__burger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.header__burger.is-open .header__burger-line:nth-child(2) {
  opacity: 0;
}
.header__burger.is-open .header__burger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Бургер-меню: до 720px ссылки уходят в выпадающую панель под шапкой,
   CTA остаётся видимой в строке рядом с кнопкой-бургером (не прячем
   основной призыв к действию за лишний клик). */
@container (max-width: 720px) {
  .header__burger {
    display: inline-flex;
  }

  .header__nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    transition: max-height var(--transition-base), opacity var(--transition-fast), visibility var(--transition-base);
  }

  .header__nav.is-open {
    max-height: 80vh;
    opacity: 1;
    visibility: visible;
  }

  .header__nav-link {
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--border-color);
  }
}
</style>
