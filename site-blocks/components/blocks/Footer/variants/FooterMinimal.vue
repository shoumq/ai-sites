<script setup lang="ts">
import type { FooterSection } from '~/types/site'

defineProps<{
  section: FooterSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<FooterSection>]
  select: []
}>()
</script>

<template>
  <footer class="footer footer--minimal">
    <div class="footer__inner">
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
.footer--minimal {
  background: var(--surface-inverse);
  color: var(--text-inverse);
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-5);
  text-align: center;
}

.footer__copyright {
  font-size: var(--fs-sm);
  opacity: 0.6;
}
</style>
