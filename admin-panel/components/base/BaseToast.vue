<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const props = defineProps<{
  type: ToastType
  message: string
}>()

const emit = defineEmits<{ close: [] }>()

const ICONS: Record<ToastType, string> = {
  success: 'lucide:check-circle-2',
  error: 'lucide:alert-circle',
  info: 'lucide:info',
  warning: 'lucide:alert-triangle',
}

const icon = computed(() => ICONS[props.type])
</script>

<template>
  <div class="base-toast glass-card" :class="`is-${type}`" role="status">
    <Icon :name="icon" class="base-toast__icon" />
    <p class="base-toast__message">{{ message }}</p>
    <button type="button" class="base-toast__close" aria-label="Закрыть уведомление" @click="emit('close')">
      <Icon name="lucide:x" />
    </button>
  </div>
</template>

<style scoped>
.base-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--a-space-3);
  min-width: 280px;
  max-width: 380px;
  padding: var(--a-space-4);
  border-color: var(--a-glass-border);
}

.base-toast.is-success { box-shadow: inset 3px 0 0 var(--a-success), var(--a-shadow-md); }
.base-toast.is-error { box-shadow: inset 3px 0 0 var(--a-error), var(--a-shadow-md); }
.base-toast.is-info { box-shadow: inset 3px 0 0 var(--a-info), var(--a-shadow-md); }
.base-toast.is-warning { box-shadow: inset 3px 0 0 var(--a-warning), var(--a-shadow-md); }

.base-toast__icon {
  flex-shrink: 0;
  font-size: 1.2rem;
  margin-top: 1px;
}
.is-success .base-toast__icon { color: var(--a-success); }
.is-error .base-toast__icon { color: var(--a-error); }
.is-info .base-toast__icon { color: var(--a-info); }
.is-warning .base-toast__icon { color: var(--a-warning); }

.base-toast__message {
  flex: 1;
  font-size: var(--a-fs-sm);
  line-height: 1.45;
  color: var(--a-text);
}

.base-toast__close {
  flex-shrink: 0;
  display: inline-flex;
  background: transparent;
  border: none;
  color: var(--a-text-faint);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--a-radius-sm);
  transition: color var(--a-transition-fast);
}
.base-toast__close:hover {
  color: var(--a-text);
}
</style>
