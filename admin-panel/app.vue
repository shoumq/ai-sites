<script setup lang="ts">
// Корневой узел SPA. ToastHost/ConfirmHost — синглтон-хосты для composables
// useToast()/useConfirm(), которые заменяют window.alert/window.confirm.
// IntroSplash — короткий сплэш-интро при первой загрузке вкладки (сам решает,
// показываться ли, через sessionStorage); рендерится поверх всего остального,
// но не блокирует параллельное монтирование NuxtPage под собой. ThemeToggle —
// светлая/тёмная тема, доступна на всех экранах (см. stores/theme.ts).
</script>

<template>
  <div class="app-root">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <ConfirmHost />
    <IntroSplash />
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
