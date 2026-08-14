<script setup lang="ts">
// Синглтон-хост стека тостов — монтируется один раз в app.vue. Сам список
// живёт в composables/useToast.ts.
const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-host">
      <TransitionGroup name="toast-item" tag="div" class="toast-host__list">
        <BaseToast
          v-for="t in toasts"
          :key="t.id"
          :type="t.type"
          :message="t.message"
          @close="remove(t.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  z-index: var(--a-z-toast);
  bottom: var(--a-space-5);
  right: var(--a-space-5);
  pointer-events: none;
}

.toast-host__list {
  display: flex;
  flex-direction: column-reverse;
  gap: var(--a-space-3);
}

.toast-host__list > * {
  pointer-events: auto;
}

.toast-item-enter-active,
.toast-item-leave-active {
  transition: transform var(--a-transition-base) var(--a-ease-spring), opacity var(--a-transition-base);
}
.toast-item-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.toast-item-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}
.toast-item-leave-active {
  position: absolute;
}
</style>
