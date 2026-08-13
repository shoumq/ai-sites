/**
 * Общее состояние бургер-меню для мобильной навигации header-блоков
 * (HeaderStandard/Split/Centered — у HeaderMinimal меню нет по дизайну).
 * Каждый вариант вызывает свой собственный инстанс — состояние НЕ шарится
 * между блоками, это просто вынесенный toggle/close, чтобы не дублировать
 * одну и ту же логику в 3 файлах.
 */
export function useMobileNav() {
  const isOpen = ref(false)

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function close() {
    isOpen.value = false
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return { isOpen, toggle, close }
}
