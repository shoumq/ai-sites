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

/**
 * Оси вёрстки -> CSS-переменные. Держать их таблицей (а не набором if'ов)
 * важно по той же причине, что и SECTION_VARIANTS на бэке: добавить новое
 * значение оси = дописать одну строку, а не править условия в компонентах.
 */
const RADIUS_VARS: Record<Theme['radius'], Record<string, string>> = {
  sharp: { '--radius-block': '2px', '--radius-control': '2px', '--btn-radius': '2px' },
  soft: { '--radius-block': '22px', '--radius-control': '14px', '--btn-radius': '14px' },
  round: { '--radius-block': '32px', '--radius-control': '999px', '--btn-radius': '999px' },
}

const DENSITY_VARS: Record<Theme['density'], Record<string, string>> = {
  compact: { '--section-py': '40px', '--card-p': '16px', '--stack-gap': '16px' },
  cozy: { '--section-py': '64px', '--card-p': '24px', '--stack-gap': '24px' },
  airy: { '--section-py': '104px', '--card-p': '36px', '--stack-gap': '36px' },
}

const CONTAINER_VARS: Record<Theme['container_width'], Record<string, string>> = {
  narrow: { '--container': '900px' },
  normal: { '--container': '1200px' },
  wide: { '--container': '1440px' },
}

/** Оси, которые нельзя выразить переменной (нужны селекторы) — классы на <html>.
 *  Соответствующие правила живут в assets/tokens.css. */
function axisClasses(theme: Theme): string {
  const classes: string[] = []
  if (theme.heading_style && theme.heading_style !== 'plain') classes.push(`heading-${theme.heading_style}`)
  if (theme.button_style && theme.button_style !== 'solid') classes.push(`buttons-${theme.button_style}`)
  if (theme.section_divider && theme.section_divider !== 'none') classes.push(`divider-${theme.section_divider}`)
  return classes.join(' ')
}

function isValidHexOrColor(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Вычисляет и выставляет CSS-переменные темы сайта на <html>: цвет/шрифт/фон
 * и оси вёрстки (скругления, плотность, ширина контента), плюс классы для
 * осей, которым нужны селекторы (заголовки/кнопки/разделители секций).
 *
 * Принимает как Ref<Theme>, так и простой Theme (полезно и для реактивного
 * редактора, и для статической генерации, где theme неизменна).
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
    const t = unref(themeRef)
    const vars: Record<string, string> = {
      '--primary': primaryColor.value,
      '--primary-dark': `color-mix(in srgb, ${primaryColor.value} 80%, black)`,
      '--primary-light': `color-mix(in srgb, ${primaryColor.value} 85%, white)`,
      '--font-family': fontFamily.value,
      // Оси со старых проектов могут отсутствовать в JSON (схема расширялась
      // после их создания) — тогда берём тот же дефолт, что и Pydantic.
      ...(RADIUS_VARS[t.radius] ?? RADIUS_VARS.soft),
      ...(DENSITY_VARS[t.density] ?? DENSITY_VARS.cozy),
      ...(CONTAINER_VARS[t.container_width] ?? CONTAINER_VARS.normal),
    }
    // Пусто — не трогаем --surface, остаётся дефолтный белый из tokens.css
    // (и SectionRenderer.vue может по-прежнему переопределить его точечно
    // для отдельного блока через тот же механизм наследования переменной).
    if (t.bg_color) vars['--surface'] = t.bg_color
    return vars
  })

  const styleAttr = computed(() =>
    Object.entries(cssVars.value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; '),
  )

  const htmlClass = computed(() => axisClasses(unref(themeRef)))

  useHead(() => ({
    htmlAttrs: {
      style: styleAttr.value,
      class: htmlClass.value,
    },
    // theme.custom_css — точечные правки от ИИ-чата. Раньше поле существовало
    // в схеме, но никуда не доезжало: ни в превью, ни в статическую сборку.
    style: unref(themeRef).custom_css ? [{ children: unref(themeRef).custom_css }] : [],
  }))

  return { cssVars, styleAttr, htmlClass, primaryColor, fontFamily }
}
