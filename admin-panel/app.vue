<script setup lang="ts">
// Корневой узел SPA. ToastHost/ConfirmHost — синглтон-хосты для composables
// useToast()/useConfirm(), которые заменяют window.alert/window.confirm.
// ThemeToggle встроен в рабочее пространство и доступен отдельно в редакторе.
const route = useRoute()
const hasWorkspace = computed(() => ['/', '/new', '/generating'].includes(route.path))
</script>

<template>
  <div class="app-root" :class="{ 'has-workspace': hasWorkspace }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <ConfirmHost />
    <ThemeToggle />
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}

@media (min-width: 761px) { .app-root.has-workspace > .theme-switcher { display: none; } }
</style>
