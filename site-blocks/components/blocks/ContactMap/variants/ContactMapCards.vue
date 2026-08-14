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
  <section class="contact contact--cards">
    <div class="contact__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="contact__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок блока"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <div class="contact__cards">
        <div
          v-if="section.address || editable"
          class="contact-card"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: 0, ease: 'easeOut' } }"
        >
          <span class="contact-card__icon" aria-hidden="true">📍</span>
          <span class="contact-card__label">Адрес</span>
          <EditableText
            tag="span"
            class="contact-card__value"
            :model-value="section.address"
            :editable="editable"
            placeholder="Адрес"
            @update:model-value="(v) => emit('update:section', { address: v })"
          />
        </div>

        <div
          v-if="section.phone || editable"
          class="contact-card"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: 90, ease: 'easeOut' } }"
        >
          <span class="contact-card__icon" aria-hidden="true">📞</span>
          <span class="contact-card__label">Телефон</span>
          <EditableText
            tag="span"
            class="contact-card__value"
            :model-value="section.phone"
            :editable="editable"
            placeholder="Телефон"
            @update:model-value="(v) => emit('update:section', { phone: v })"
          />
        </div>

        <div
          v-if="section.email || editable"
          class="contact-card"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 380, delay: 180, ease: 'easeOut' } }"
        >
          <span class="contact-card__icon" aria-hidden="true">✉️</span>
          <span class="contact-card__label">Email</span>
          <EditableText
            tag="span"
            class="contact-card__value"
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
.contact--cards {
  padding: var(--space-8) var(--space-5);
  background: var(--surface-muted);
}

.contact__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.contact__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--text);
}

.contact__cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-6);
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.contact-card__icon {
  font-size: 1.75rem;
}

.contact-card__label {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.contact-card__value {
  font-weight: 600;
  font-size: var(--fs-base);
  color: var(--text);
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

@container (max-width: 860px) {
  .contact__cards {
    grid-template-columns: 1fr;
  }
}
</style>
