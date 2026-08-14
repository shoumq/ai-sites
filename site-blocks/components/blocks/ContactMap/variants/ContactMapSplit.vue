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
  <section class="contact contact--split">
    <div class="contact__grid">
      <div
        v-if="section.show_map"
        class="contact__map"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 450, ease: 'easeOut' } }"
      >
        <iframe v-if="section.map_embed_url" :src="section.map_embed_url" class="contact__map-frame" loading="lazy" title="Карта" />
        <ImagePlaceholder v-else label="Карта" icon="🗺️" />
      </div>

      <div
        class="contact__info"
        v-motion
        :initial="{ opacity: 0, x: 20 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 450, delay: 100, ease: 'easeOut' } }"
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
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact--split {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.contact__grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

.contact__map {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.contact__map-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.contact__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.contact__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.contact__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.contact__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--fs-base);
  color: var(--text);
}

.contact__icon {
  font-size: 1.15rem;
}

@container (max-width: 860px) {
  .contact__grid {
    grid-template-columns: 1fr;
  }
}
</style>
