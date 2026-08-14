<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg'
    persistent?: boolean
  }>(),
  { title: undefined, size: 'md', persistent: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onBackdrop() {
  if (!props.persistent) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && !props.persistent) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="modelValue" class="base-modal-backdrop" @mousedown.self="onBackdrop">
        <Transition name="modal-panel" appear>
          <div class="base-modal glass-card" :class="`is-${size}`" role="dialog" aria-modal="true">
            <header v-if="title || $slots.header" class="base-modal__header">
              <slot name="header">
                <h3>{{ title }}</h3>
              </slot>
              <button type="button" class="base-modal__close" aria-label="Закрыть" @click="close">
                <Icon name="lucide:x" />
              </button>
            </header>
            <div class="base-modal__body">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="base-modal__footer">
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--a-z-modal-backdrop);
  background: rgba(4, 4, 10, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--a-space-5);
}

.base-modal {
  position: relative;
  z-index: var(--a-z-modal);
  width: 100%;
  max-width: 420px;
  max-height: min(85vh, 720px);
  display: flex;
  flex-direction: column;
  background: var(--a-glass-bg);
}

.base-modal.is-sm { max-width: 360px; }
.base-modal.is-md { max-width: 480px; }
.base-modal.is-lg { max-width: 720px; }

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
  padding: var(--a-space-5) var(--a-space-5) var(--a-space-3);
}

.base-modal__header h3 {
  font-size: var(--a-fs-lg);
}

.base-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--a-radius-full);
  background: transparent;
  border: none;
  color: var(--a-text-muted);
  cursor: pointer;
  transition: background var(--a-transition-fast), color var(--a-transition-fast);
  flex-shrink: 0;
}
.base-modal__close:hover {
  background: var(--a-surface-hover);
  color: var(--a-text);
}

.base-modal__body {
  padding: 0 var(--a-space-5) var(--a-space-5);
  overflow-y: auto;
}

.base-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--a-space-3);
  padding: var(--a-space-4) var(--a-space-5);
  border-top: 1px solid var(--a-border);
}

.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity var(--a-transition-base);
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-panel-enter-active {
  transition: transform var(--a-transition-slow) var(--a-ease-spring), opacity var(--a-transition-base);
}
.modal-panel-leave-active {
  transition: transform var(--a-transition-fast) var(--a-ease-out), opacity var(--a-transition-fast);
}
.modal-panel-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
