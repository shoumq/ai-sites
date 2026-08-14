import { computed, isRef, ref, unref, type Ref } from 'vue'
import { useHead } from '#imports'
import type { Theme } from '~/types/site'

/** Font-стеки под каждый допустимый Theme.font — с системным фолбэком. */
const FONT_STACKS: Record<Theme['font'], string> = {
  Inter: `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`,
  Roboto: `'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
  'PT Sans': `'PT Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
  Montserrat: `'Montserrat', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
}

function isValidHexOrColor(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Вычисляет и выставляет CSS-переменные темы сайта (--primary/--primary-dark/
 * --primary-light/--font-family) на <html>. Принимает как Ref<Theme>, так и
 * простой Theme (полезно и для реактивного редактора, и для статической
 * генерации, где theme неизменна).
 *
 * useHead({ htmlAttrs: { style } }) выбран вместо прямого document.documentElement.style —
 * это SSR/prerender-safe: значение попадает в атрибут style тега <html> уже в
 * статическом HTML, без ожидания гидрации на клиенте.
 */
export function useSiteTheme(theme: Ref<Theme> | Theme) {
  const themeRef = isRef(theme) ? theme : ref(theme)

  const primaryColor = computed(() => {
    const t = unref(themeRef)
    return isValidHexOrColor(t.primary_color) ? t.primary_color : '#2563EB'
  })

  const fontFamily = computed(() => {
    const t = unref(themeRef)
    return FONT_STACKS[t.font] ?? FONT_STACKS.Inter
  })

  const cssVars = computed<Record<string, string>>(() => {
    const vars: Record<string, string> = {
      '--primary': primaryColor.value,
      '--primary-dark': `color-mix(in srgb, ${primaryColor.value} 80%, black)`,
      '--primary-light': `color-mix(in srgb, ${primaryColor.value} 85%, white)`,
      '--font-family': fontFamily.value,
    }
    // Пусто — не трогаем --surface, остаётся дефолтный белый из tokens.css
    // (и SectionRenderer.vue может по-прежнему переопределить его точечно
    // для отдельного блока через тот же механизм наследования переменной).
    const bg = unref(themeRef).bg_color
    if (bg) vars['--surface'] = bg
    return vars
  })

  const styleAttr = computed(() =>
    Object.entries(cssVars.value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; '),
  )

  useHead(() => ({
    htmlAttrs: {
      style: styleAttr.value,
    },
  }))

  return { cssVars, styleAttr, primaryColor, fontFamily }
}
