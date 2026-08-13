import { defineStore } from 'pinia'
import type { User } from '~/types/api'

/**
 * Токен хранится через useCookie — реактивный, CSR-safe, не требует ручной
 * synhronизации с localStorage (Nuxt сам читает/пишет document.cookie).
 * maxAge — 30 дней, sameSite: 'lax' (SPA живёт на своём origin, не нужен
 * cross-site cookie).
 */
export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const tariff = computed(() => user.value?.tariff ?? 'trial')

  async function fetchMe() {
    const api = useApi()
    const me = await api.get<User>('/auth/me')
    user.value = me
    return me
  }

  async function login(email: string, password: string) {
    const api = useApi()
    const result = await api.loginForm(email, password)
    token.value = result.access_token
    await fetchMe()
  }

  async function register(email: string, password: string) {
    const api = useApi()
    await api.post('/auth/register', { email, password })
    await login(email, password)
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, tariff, fetchMe, login, register, logout }
})
