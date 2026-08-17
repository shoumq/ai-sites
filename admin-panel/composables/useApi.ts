/**
 * Единая обёртка над ofetch ($fetch) для похода в FastAPI-бэкенд:
 * - базовый URL из runtimeConfig.public.apiBase,
 * - авто-инжект Authorization: Bearer <token> из auth-стора,
 * - все ошибки нормализуются в ApiError с человекочитаемым message,
 *   собранным из FastAPI `detail` (строка ИЛИ массив pydantic-ошибок) —
 *   вызывающий код просто делает toast.error(e.message).
 */

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const detail = (data as Record<string, unknown>).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) return String((item as Record<string, unknown>).msg)
        return String(item)
      })
      .join('; ')
  }
  return null
}

function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  const anyErr = err as {
    response?: { status?: number; _data?: unknown }
    data?: unknown
    status?: number
    statusCode?: number
    message?: string
  }
  const status = anyErr?.response?.status ?? anyErr?.status ?? anyErr?.statusCode ?? 0
  const data = anyErr?.data ?? anyErr?.response?._data
  const detail = extractDetail(data) ?? anyErr?.message ?? 'Не удалось выполнить запрос. Проверьте соединение.'
  return new ApiError(detail, status)
}

export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const client = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (auth.token) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${auth.token}`)
        options.headers = headers
      }
    },
  })

  async function request<T>(url: string, opts?: Record<string, unknown>): Promise<T> {
    try {
      return await client<T>(url, opts as Parameters<typeof client>[1])
    } catch (err) {
      throw normalizeError(err)
    }
  }

  return {
    get<T>(url: string, opts?: Record<string, unknown>) {
      return request<T>(url, { method: 'GET', ...opts })
    },
    post<T>(url: string, body?: unknown, opts?: Record<string, unknown>) {
      return request<T>(url, { method: 'POST', body, ...opts })
    },
    put<T>(url: string, body?: unknown, opts?: Record<string, unknown>) {
      return request<T>(url, { method: 'PUT', body, ...opts })
    },
    patch<T>(url: string, body?: unknown, opts?: Record<string, unknown>) {
      return request<T>(url, { method: 'PATCH', body, ...opts })
    },
    del<T>(url: string, opts?: Record<string, unknown>) {
      return request<T>(url, { method: 'DELETE', ...opts })
    },

    /** POST /auth/login ждёт application/x-www-form-urlencoded (OAuth2PasswordRequestForm), не JSON. */
    loginForm(email: string, password: string) {
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)
      return request<{ access_token: string; token_type: string }>('/auth/login', {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    },

    /**
     * GET /projects/{id}/export отдаёт бинарный zip (Content-Disposition:
     * attachment), а не JSON — качаем как blob и триггерим браузерное
     * скачивание через временную <a download>, вместо парсинга ответа.
     */
    async download(url: string, filename: string) {
      const res = await fetch(`${config.public.apiBase}${url}`, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      })
      if (!res.ok) {
        let message = res.statusText || 'Не удалось скачать файл'
        try {
          const data = await res.clone().json()
          message = extractDetail(data) ?? message
        } catch {
          // тело не JSON (например, ошибка отдана без detail) — оставляем statusText
        }
        throw new ApiError(message, res.status)
      }
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    },

    /** Базовый URL для нативного WebSocket (без токена — его добавляет вызывающий код в query). */
    wsBase() {
      return config.public.wsBase as string
    },
  }
}
