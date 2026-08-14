<script setup lang="ts">
import type { FooterSection, NavItem, Theme } from '~/types/site'

const props = defineProps<{
  section: FooterSection
  editable?: boolean
  theme?: Theme
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FooterSection>]
  select: []
}>()

function updateLink(index: number, patch: Partial<NavItem>) {
  const links = props.section.links.map((link, i) => (i === index ? { ...link, ...patch } : link))
  emit('update:section', { links })
}
</script>

<template>
  <footer class="footer footer--simple">
    <div class="footer__inner">
      <img v-if="theme?.logo_url" :src="theme.logo_url" :alt="section.company_name || 'Логотип'" class="footer__logo-img">
      <EditableText
        v-else
        tag="span"
        class="footer__brand"
        :model-value="section.company_name"
        :editable="editable"
        placeholder="Компания"
        @update:model-value="(v) => emit('update:section', { company_name: v })"
      />

      <nav v-if="section.links.length" class="footer__links">
        <EditableText
          v-for="(link, i) in section.links"
          :key="i"
          tag="a"
          :href="link.href || '#'"
          class="footer__link"
          :model-value="link.label"
          :editable="editable"
          @update:model-value="(v) => updateLink(i, { label: v })"
        />
      </nav>

      <EditableText
        tag="span"
        class="footer__copyright"
        :model-value="section.copyright_text"
        :editable="editable"
        placeholder="© Все права защищены"
        @update:model-value="(v) => emit('update:section', { copyright_text: v })"
      />
    </div>
  </footer>
</template>

<style scoped>
.footer--simple {
  background: var(--surface-inverse);
  color: var(--text-inverse);
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-5);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.footer__brand {
  font-weight: 700;
  font-size: var(--fs-base);
  margin-right: auto;
}

.footer__logo-img {
  height: 28px;
  max-width: 150px;
  width: auto;
  object-fit: contain;
  margin-right: auto;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-sm);
}

.footer__links {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.footer__link {
  font-size: var(--fs-sm);
  opacity: 0.75;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.footer__link:hover {
  opacity: 1;
}

.footer__copyright {
  font-size: var(--fs-sm);
  opacity: 0.6;
  white-space: nowrap;
}

@container (max-width: 640px) {
  .footer__inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .footer__brand,
  .footer__logo-img {
    margin-right: 0;
  }
}
</style>
