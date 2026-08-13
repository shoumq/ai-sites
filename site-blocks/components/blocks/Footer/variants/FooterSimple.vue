<script setup lang="ts">
import type { FooterSection, NavItem } from '~/types/site'

const props = defineProps<{
  section: FooterSection
  editable?: boolean
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
      <EditableText
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
  .footer__brand {
    margin-right: 0;
  }
}
</style>
