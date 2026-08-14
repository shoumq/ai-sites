/**
 * Глобальный guard: без токена доступны только /login и /register.
 * С токеном — подтягиваем профиль (auth.user) один раз за сессию вкладки,
 * чтобы пережить обновление страницы (токен в cookie переживает reload,
 * user — нет, useAuthStore живёт в памяти). Если /auth/me падает
 * (истёкший/невалидный токен) — разлогиниваем и уводим на /login.
 */
const PUBLIC_ROUTES = new Set(['/login', '/register'])

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const isPublic = PUBLIC_ROUTES.has(to.path)

  if (!auth.isAuthenticated) {
    return isPublic ? undefined : navigateTo('/login')
  }

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
      return isPublic ? undefined : navigateTo('/login')
    }
  }

  if (isPublic) return navigateTo('/')
  return undefined
})
