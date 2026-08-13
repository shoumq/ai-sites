<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'brand'
    size?: 'sm' | 'md'
  }>(),
  { variant: 'neutral', size: 'md' },
)
</script>

<template>
  <span class="base-badge" :class="[`is-${variant}`, `is-${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--a-space-1);
  padding: 3px var(--a-space-3);
  border-radius: var(--a-radius-full);
  font-size: var(--a-fs-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.6;
  white-space: nowrap;
}

.base-badge.is-sm {
  padding: 1px var(--a-space-2);
  font-size: 0.6875rem;
}

.base-badge.is-neutral {
  background: var(--a-surface);
  color: var(--a-text-muted);
  border: 1px solid var(--a-border);
}

.base-badge.is-success { background: var(--a-success-bg); color: var(--a-success); }
.base-badge.is-warning { background: var(--a-warning-bg); color: var(--a-warning); }
.base-badge.is-error { background: var(--a-error-bg); color: var(--a-error); }
.base-badge.is-info { background: var(--a-info-bg); color: var(--a-info); }

.base-badge.is-brand {
  background: var(--a-gradient-brand-soft);
  color: #fff;
}
</style>
