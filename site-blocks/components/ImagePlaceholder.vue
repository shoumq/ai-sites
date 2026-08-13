<script setup lang="ts">
// Красивая заглушка вместо пустого <img src="">, когда bg_image/image/avatar
// ещё не заполнены. Мягкий градиент по --primary + иконка.
withDefaults(
  defineProps<{
    label?: string
    rounded?: boolean
    icon?: string
  }>(),
  {
    label: 'Изображение',
    rounded: true,
    icon: '🖼️',
  },
)
</script>

<template>
  <div class="image-placeholder" :class="{ 'is-rounded': rounded }">
    <span class="image-placeholder__icon" aria-hidden="true">{{ icon }}</span>
    <span class="image-placeholder__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  height: 100%;
  min-height: 220px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 16%, white) 0%, color-mix(in srgb, var(--primary) 6%, white) 100%);
  border: 1px dashed color-mix(in srgb, var(--primary) 35%, white);
  color: color-mix(in srgb, var(--primary) 60%, black);
}

.image-placeholder.is-rounded {
  border-radius: var(--radius-lg);
}

.image-placeholder__icon {
  font-size: 2.25rem;
  line-height: 1;
  opacity: 0.85;
}

.image-placeholder__label {
  font-size: var(--fs-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.75;
}
</style>
