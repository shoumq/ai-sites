<script setup lang="ts">
// Корневой узел SPA. ToastHost/ConfirmHost — синглтон-хосты для composables
// useToast()/useConfirm(), которые заменяют window.alert/window.confirm.
// ThemeToggle встроен в рабочее пространство и доступен отдельно в редакторе.
</script>

<template>
  <div class="app-root">
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
</style>
