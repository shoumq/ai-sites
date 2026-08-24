import { defineStore } from 'pinia'

/** Theme preference with a live system mode and an early head-script twin. */
const STORAGE_KEY = 'ai-sites:theme'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readPersisted(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
}

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readPersisted())
  const mode = ref<ThemeMode>(preference.value === 'system' ? systemTheme() : preference.value)

  function apply(next: ThemeMode) {
    mode.value = next
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.setAttribute('data-theme-preference', preference.value)
  }

  function setTheme(next: ThemePreference) {
    preference.value = next
    apply(next === 'system' ? systemTheme() : next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }

  function toggle() {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  if (typeof window !== 'undefined') {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', () => {
      if (preference.value === 'system') apply(media.matches ? 'light' : 'dark')
    })
  }

  // На случай расхождения с тем, что уже выставил инлайновый head-скрипт
  // (например, HMR стора в dev-режиме без перезагрузки страницы).
  apply(mode.value)

  return { mode, preference, setTheme, toggle }
})
