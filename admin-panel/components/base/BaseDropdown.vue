<script setup lang="ts">
// Лёгкий dropdown: слот #trigger — то, по чему кликают; слот default — меню.
// Закрывается по клику снаружи (onClickOutside из @vueuse/core) и по Escape.
// Импортируем явно: в проекте подключён только @vueuse/motion/nuxt
// (автоимпорт v-motion), а не @vueuse/nuxt — автоимпорта для @vueuse/core нет.
import { onClickOutside } from '@vueuse/core'

const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => { open.value = false })

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
</script>

<template>
  <div ref="root" class="base-dropdown" @keydown="onKeydown">
    <div class="base-dropdown__trigger" @click="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <Transition name="dropdown-menu">
      <div v-if="open" class="base-dropdown__menu glass-card" @click="close">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.base-dropdown {
  position: relative;
  display: inline-flex;
}

.base-dropdown__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: var(--a-z-dropdown);
  min-width: 180px;
  padding: var(--a-space-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-menu-enter-active,
.dropdown-menu-leave-active {
  transition: transform var(--a-transition-fast) var(--a-ease-out), opacity var(--a-transition-fast);
}
.dropdown-menu-enter-from,
.dropdown-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
