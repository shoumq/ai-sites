import { defineStore } from 'pinia'

/**
 * Тёмная/светлая тема (data-theme на <html>, см. tokens.css). Выбор
 * персистится в localStorage; до первого осознанного выбора пользователя
 * берём системную настройку prefers-color-scheme. Инлайновый скрипт в
 * nuxt.config.ts (app.head.script) применяет тот же ключ ДО отрисовки —
 * этот стор лишь синхронизирует реактивное состояние UI с уже выставленным
 * атрибутом, чтобы не было мигания темы при загрузке.
 */
const STORAGE_KEY = 'ai-sites:theme'

export type ThemeMode = 'light' | 'dark'

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readPersisted(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'light' || raw === 'dark' ? raw : null
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readPersisted() ?? systemTheme())

  function apply(next: ThemeMode) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', next)
  }

  function setTheme(next: ThemeMode) {
    mode.value = next
    apply(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }

  function toggle() {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  // На случай расхождения с тем, что уже выставил инлайновый head-скрипт
  // (например, HMR стора в dev-режиме без перезагрузки страницы).
  apply(mode.value)

  return { mode, setTheme, toggle }
})
