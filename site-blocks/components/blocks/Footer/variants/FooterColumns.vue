<script setup lang="ts">
import type { FooterSection, NavItem, SocialLink } from '~/types/site'

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

function updateSocial(index: number, patch: Partial<SocialLink>) {
  const socials = props.section.socials.map((s, i) => (i === index ? { ...s, ...patch } : s))
  emit('update:section', { socials })
}
</script>

<template>
  <footer class="footer footer--columns">
    <div class="footer__inner">
      <div class="footer__col footer__col--brand">
        <EditableText
          tag="span"
          class="footer__brand"
          :model-value="section.company_name"
          :editable="editable"
          placeholder="Компания"
          @update:model-value="(v) => emit('update:section', { company_name: v })"
        />
        <div v-if="section.socials.length" class="footer__socials">
          <a v-for="(s, i) in section.socials" :key="i" :href="s.url" class="footer__social" target="_blank" rel="noopener noreferrer">
            <EditableText
              tag="span"
              :model-value="s.platform"
              :editable="editable"
              @update:model-value="(v) => updateSocial(i, { platform: v })"
            />
          </a>
        </div>
      </div>

      <div v-if="section.links.length" class="footer__col">
        <span class="footer__col-title">Навигация</span>
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
      </div>
    </div>

    <div class="footer__bottom">
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
.footer--columns {
  background: var(--surface-inverse);
  color: var(--text-inverse);
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-5) var(--space-5);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-7);
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer__col-title {
  font-size: var(--fs-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
  margin-bottom: var(--space-1);
}

.footer__brand {
  font-weight: 700;
  font-size: var(--fs-xl);
}

.footer__socials {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.footer__social {
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: var(--fs-sm);
  color: inherit;
  text-decoration: none;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.footer__social:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
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

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: var(--space-4) var(--space-5);
  text-align: center;
}

.footer__copyright {
  font-size: var(--fs-sm);
  opacity: 0.55;
}

@container (max-width: 640px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
