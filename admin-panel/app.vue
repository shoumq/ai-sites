<script setup lang="ts">
// Корневой узел SPA. GradientBackground рисует анимированные закатные "блобы"
// один раз на весь апп (а не per-page), чтобы не было мигания фона между
// переходами страниц. ToastHost/ConfirmHost — синглтон-хосты для composables
// useToast()/useConfirm(), которые заменяют window.alert/window.confirm.
// IntroSplash — короткий сплэш-интро при первой загрузке вкладки (сам решает,
// показываться ли, через sessionStorage); рендерится поверх всего остального,
// но не блокирует параллельное монтирование NuxtPage под собой.
</script>

<template>
  <div class="app-root">
    <GradientBackground />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <ConfirmHost />
    <IntroSplash />
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}
</style>
