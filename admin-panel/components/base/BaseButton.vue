<script setup lang="ts">
/**
 * Базовая кнопка кита. Если передан `to`, рендерится как <NuxtLink> (тот же
 * визуал, что и кнопка) — удобно для «+ Новый сайт» и подобных переходов.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    to?: string
    type?: 'button' | 'submit'
    icon?: string
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    loading: false,
    disabled: false,
    block: false,
    to: undefined,
    type: 'button',
    icon: undefined,
  },
)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="base-btn"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
  >
    <Icon v-if="icon" :name="icon" class="base-btn__icon" />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="base-btn"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="base-btn__spinner" aria-hidden="true" />
    <Icon v-else-if="icon" :name="icon" class="base-btn__icon" />
    <span class="base-btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.base-btn {
  --_h: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  height: var(--_h);
  padding: 0 var(--a-space-5);
  border-radius: var(--a-radius-md);
  border: 1px solid transparent;
  font-family: inherit;
  font-size: var(--a-fs-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  color: var(--a-text);
  transition: transform var(--a-transition-fast), box-shadow var(--a-transition-fast),
    background var(--a-transition-fast), border-color var(--a-transition-fast), opacity var(--a-transition-fast);
  user-select: none;
}

.base-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
}

.base-btn.is-sm { --_h: 34px; padding: 0 var(--a-space-4); font-size: var(--a-fs-xs); }
.base-btn.is-lg { --_h: 50px; padding: 0 var(--a-space-6); font-size: var(--a-fs-md); }
.base-btn.is-block { width: 100%; }

.base-btn.is-primary {
  background: var(--a-gradient-brand);
  color: #fff;
  box-shadow: var(--a-shadow-glow);
}
.base-btn.is-primary:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 48px -10px color-mix(in srgb, var(--a-accent) 60%, transparent);
}

.base-btn.is-secondary {
  background: var(--a-surface);
  border-color: var(--a-border);
}
.base-btn.is-secondary:hover:not(:disabled) {
  background: var(--a-surface-hover);
  border-color: var(--a-border-strong);
}

.base-btn.is-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--a-text-muted);
}
.base-btn.is-ghost:hover:not(:disabled) {
  background: var(--a-surface);
  color: var(--a-text);
}

.base-btn.is-danger {
  background: var(--a-error-bg);
  border-color: color-mix(in srgb, var(--a-error) 35%, transparent);
  color: var(--a-error);
}
.base-btn.is-danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--a-error) 22%, transparent);
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.base-btn__icon {
  font-size: 1.05em;
  flex-shrink: 0;
}

.base-btn__spinner {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  opacity: 0.85;
  animation: base-btn-spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes base-btn-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .base-btn__spinner { animation-duration: 1.4s; }
}
</style>
