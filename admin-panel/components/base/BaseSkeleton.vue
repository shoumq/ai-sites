<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
    circle?: boolean
  }>(),
  { width: '100%', height: '16px', radius: 'var(--a-radius-sm)', circle: false },
)
</script>

<template>
  <span
    class="base-skeleton"
    :style="{ width, height, borderRadius: circle ? '50%' : radius }"
  />
</template>

<style scoped>
.base-skeleton {
  display: block;
  background: linear-gradient(
    100deg,
    var(--a-surface) 30%,
    var(--a-surface-hover) 50%,
    var(--a-surface) 70%
  );
  background-size: 220% 100%;
  animation: base-skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes base-skeleton-shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -20% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .base-skeleton {
    animation: none;
    background: var(--a-surface);
  }
}
</style>
