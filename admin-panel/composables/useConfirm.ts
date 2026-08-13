/**
 * Промис-based подтверждение опасных действий — замена window.confirm().
 * Использование: `if (await useConfirm().confirm({ message: '...' })) { ... }`.
 * Рендерится компонентом <ConfirmHost /> (см. app.vue), смонтированным один
 * раз на всё приложение; состояние — модульный singleton по той же причине,
 * что и в useToast.ts (SPA, ssr:false).
 */

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState extends Required<Omit<ConfirmOptions, 'title'>> {
  open: boolean
  title: string
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена',
  danger: false,
})

let resolver: ((value: boolean) => void) | null = null

function settle(value: boolean) {
  state.open = false
  resolver?.(value)
  resolver = null
}

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.title = options.title ?? 'Подтвердите действие'
    state.message = options.message
    state.confirmLabel = options.confirmLabel ?? 'Подтвердить'
    state.cancelLabel = options.cancelLabel ?? 'Отмена'
    state.danger = options.danger ?? false
    state.open = true
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  return {
    state,
    confirm,
    accept: () => settle(true),
    dismiss: () => settle(false),
  }
}
