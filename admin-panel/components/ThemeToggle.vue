<script setup lang="ts">
// Плавающая кнопка переключения темы — смонтирована один раз в app.vue (а не
// per-page), чтобы быть доступной на всех экранах, включая login/register.
// Левый нижний угол: ToastHost занимает правый нижний, BaseModal-бэкдроп
// (z-index 50+) перекрывает эту кнопку своим слоем, пока открыто модальное окно.
const theme = useThemeStore()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme.mode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :title="theme.mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
    @click="theme.toggle()"
  >
    <Icon :name="theme.mode === 'dark' ? 'lucide:sun' : 'lucide:moon'" />
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  left: var(--a-space-5);
  bottom: var(--a-space-5);
  z-index: var(--a-z-sticky);
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--a-radius-full);
  border: 1px solid var(--a-border);
  background: var(--a-glass-bg);
  backdrop-filter: blur(var(--a-glass-blur));
  -webkit-backdrop-filter: blur(var(--a-glass-blur));
  color: var(--a-text);
  cursor: pointer;
  box-shadow: var(--a-shadow-md);
  transition: transform var(--a-transition-fast), background var(--a-transition-fast),
    border-color var(--a-transition-fast);
}

.theme-toggle:hover {
  background: var(--a-surface-hover);
  border-color: var(--a-border-strong);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.96);
}

.theme-toggle :deep(svg) {
  width: 19px;
  height: 19px;
}
</style>
