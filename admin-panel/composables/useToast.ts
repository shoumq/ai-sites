/**
 * Стек тостов — заменяет window.alert() везде в приложении. Состояние —
 * модульный singleton (не useState/pinia): admin-panel работает только как
 * SPA (ssr:false), поэтому нет риска утечки состояния между запросами —
 * ref на верхнем уровне модуля просто живёт всю жизнь вкладки браузера.
 * Рендерится компонентом <ToastHost /> (см. app.vue), которого нужно
 * смонтировать один раз на всё приложение.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  duration: number
}

const toasts = ref<ToastItem[]>([])
let counter = 0

function remove(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function push(type: ToastType, message: string, duration = 4500) {
  const id = ++counter
  toasts.value.push({ id, type, message, duration })
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  return id
}

export function useToast() {
  return {
    toasts,
    remove,
    success: (message: string, duration?: number) => push('success', message, duration),
    error: (message: string, duration?: number) => push('error', message, duration),
    info: (message: string, duration?: number) => push('info', message, duration),
    warning: (message: string, duration?: number) => push('warning', message, duration),
  }
}
