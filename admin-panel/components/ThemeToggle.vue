<script setup lang="ts">
import type { ThemePreference } from '~/stores/theme'

const props = withDefaults(defineProps<{ inline?: boolean }>(), { inline: false })
const theme = useThemeStore()
const route = useRoute()
const visible = computed(() => props.inline || route.path !== '/')

const options: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'system', label: 'Как в системе', icon: 'lucide:monitor' },
  { value: 'light', label: 'Светлая', icon: 'lucide:sun' },
  { value: 'dark', label: 'Тёмная', icon: 'lucide:moon' },
]

const currentIcon = computed(() => {
  if (theme.preference === 'system') return 'lucide:monitor'
  return theme.preference === 'dark' ? 'lucide:moon' : 'lucide:sun'
})
</script>

<template>
  <BaseDropdown v-if="visible" class="theme-switcher" :class="{ 'is-inline': inline }">
    <template #trigger>
      <button type="button" class="theme-switcher__trigger" aria-label="Выбрать тему" title="Оформление">
        <Icon :name="currentIcon" />
      </button>
    </template>
    <div class="theme-menu" role="menu" aria-label="Оформление">
      <p class="theme-menu__title">Оформление</p>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="theme-menu__option"
        :class="{ 'is-active': theme.preference === option.value }"
        role="menuitemradio"
        :aria-checked="theme.preference === option.value"
        @click="theme.setTheme(option.value)"
      >
        <span class="theme-menu__icon"><Icon :name="option.icon" /></span>
        <span>{{ option.label }}</span>
        <Icon v-if="theme.preference === option.value" name="lucide:check" class="theme-menu__check" />
      </button>
    </div>
  </BaseDropdown>
</template>

<style scoped>
.theme-switcher {
  position: fixed;
  left: var(--a-space-5);
  bottom: var(--a-space-5);
  z-index: var(--a-z-sticky);
}
.theme-switcher.is-inline { position: relative; left: auto; bottom: auto; z-index: auto; }
.theme-switcher.is-inline .theme-switcher__trigger { width: 44px; height: 44px; }
.theme-switcher.is-inline :deep(.base-dropdown__menu) { top: calc(100% + 10px); bottom: auto; right: 0; left: auto; transform-origin: top right; }

.theme-switcher__trigger {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--a-radius-full);
  border: 1px solid var(--a-glass-border);
  background: var(--a-glass-bg);
  backdrop-filter: blur(var(--a-glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--a-glass-blur)) saturate(160%);
  color: var(--a-text);
  cursor: pointer;
  box-shadow: var(--a-shadow-md), inset 0 1px 0 rgba(255,255,255,.12);
  transition: transform var(--a-transition-fast), background var(--a-transition-fast), border-color var(--a-transition-fast);
}

.theme-switcher__trigger:hover { background: var(--a-surface-hover); border-color: var(--a-border-strong); transform: scale(1.05); }
.theme-switcher__trigger:active { transform: scale(.94); }
.theme-switcher__trigger :deep(svg) { width: 19px; height: 19px; }

.theme-switcher :deep(.base-dropdown__menu) { right: auto; left: 0; bottom: calc(100% + 10px); top: auto; width: 220px; padding: 8px; transform-origin: bottom left; }
.theme-menu { display: flex; flex-direction: column; gap: 2px; }
.theme-menu__title { padding: 8px 10px 6px; color: var(--a-text-faint); font-size: var(--a-fs-xs); font-weight: 650; }
.theme-menu__option { width: 100%; display: grid; grid-template-columns: 28px 1fr 18px; align-items: center; gap: 8px; min-height: 42px; padding: 5px 9px; border: 0; border-radius: var(--a-radius-md); background: transparent; color: var(--a-text); text-align: left; cursor: pointer; transition: background var(--a-transition-fast), transform var(--a-transition-fast); }
.theme-menu__option:hover { background: var(--a-surface-hover); }
.theme-menu__option:active { transform: scale(.98); }
.theme-menu__icon { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9px; background: var(--a-surface); color: var(--a-text-muted); }
.theme-menu__option.is-active .theme-menu__icon { background: var(--a-gradient-brand); color: #fff; }
.theme-menu__check { color: var(--a-accent); justify-self: end; }

@media (max-width: 640px) { .theme-switcher:not(.is-inline) { left: var(--a-space-3); bottom: var(--a-space-3); } }
</style>
