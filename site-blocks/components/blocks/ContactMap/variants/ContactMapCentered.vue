<script setup lang="ts">
import type { ContactMapSection } from '~/types/site'

defineProps<{
  section: ContactMapSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<ContactMapSection>]
  select: []
}>()
</script>

<template>
  <section class="contact contact--centered">
    <div
      class="contact__inner"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
    >
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="contact__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="contact__details">
        <div v-if="section.address || editable" class="contact__item">
          <span class="contact__icon" aria-hidden="true">📍</span>
          <EditableText
            tag="span"
            :model-value="section.address"
            :editable="editable"
            placeholder="Адрес"
            @update:model-value="(v) => emit('update:section', { address: v })"
          />
        </div>
        <div v-if="section.phone || editable" class="contact__item">
          <span class="contact__icon" aria-hidden="true">📞</span>
          <EditableText
            tag="span"
            :model-value="section.phone"
            :editable="editable"
            placeholder="Телефон"
            @update:model-value="(v) => emit('update:section', { phone: v })"
          />
        </div>
        <div v-if="section.email || editable" class="contact__item">
          <span class="contact__icon" aria-hidden="true">✉️</span>
          <EditableText
            tag="span"
            :model-value="section.email"
            :editable="editable"
            placeholder="Email"
            @update:model-value="(v) => emit('update:section', { email: v })"
          />
        </div>
      </div>

      <div v-if="section.show_map" class="contact__map">
        <iframe v-if="section.map_embed_url" :src="section.map_embed_url" class="contact__map-frame" loading="lazy" title="Карта" />
        <ImagePlaceholder v-else label="Карта" icon="🗺️" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact--centered {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.contact__inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  text-align: center;
}

.contact__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.contact__details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-6);
}

.contact__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-base);
  color: var(--text);
}

.contact__icon {
  font-size: 1.15rem;
}

.contact__map {
  width: 100%;
  aspect-ratio: 16 / 7;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.contact__map-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
