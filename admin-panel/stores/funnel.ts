import { defineStore } from 'pinia'
import { emptyLayoutPreferences } from '~/types/api'
import type { BriefIn, LayoutPreferences, SiteGoal, SiteType, StylePreset } from '~/types/api'

/**
 * Данные воронки «Новый сайт» — раньше терялись при рефреше страницы
 * (React-версия держала их только в router state). Персистим в
 * sessionStorage (переживает reload одной вкладки, не расползается по
 * другим вкладкам/сессиям как localStorage) и гидрируем синхронно при
 * создании стора.
 *
 * Экран 4 («Структура») необязательный: layout.mode='auto' означает, что
 * состав блоков и оси вёрстки подбирает ИИ — ровно как было до его появления.
 */
const STORAGE_KEY = 'ai-sites:funnel-brief'

interface PersistedFunnel {
  siteType: SiteType | null
  style: StylePreset | null
  customHex: string
  brandName: string
  description: string
  goal: SiteGoal
  extraRequirements: string
  layout: LayoutPreferences
}

function readPersisted(): Partial<PersistedFunnel> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<PersistedFunnel>) : {}
  } catch {
    return {}
  }
}

export const useFunnelStore = defineStore('funnel', () => {
  const initial = readPersisted()

  const siteType = ref<SiteType | null>(initial.siteType ?? null)
  const style = ref<StylePreset | null>(initial.style ?? null)
  const customHex = ref(initial.customHex ?? '#2563EB')
  const brandName = ref(initial.brandName ?? '')
  const description = ref(initial.description ?? '')
  const goal = ref<SiteGoal>(initial.goal ?? 'sales')
  const extraRequirements = ref(initial.extraRequirements ?? '')
  // Спред поверх дефолта, а не прямое присваивание: у сохранённого в прошлой
  // версии брифа может не быть части осей, и они должны стать пустыми
  // («на усмотрение ИИ»), а не undefined в теле запроса.
  const layout = ref<LayoutPreferences>({ ...emptyLayoutPreferences(), ...(initial.layout ?? {}) })

  function persist() {
    if (typeof window === 'undefined') return
    const snapshot: PersistedFunnel = {
      siteType: siteType.value,
      style: style.value,
      customHex: customHex.value,
      brandName: brandName.value,
      description: description.value,
      goal: goal.value,
      extraRequirements: extraRequirements.value,
      layout: layout.value,
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  watch([siteType, style, customHex, brandName, description, goal, extraRequirements, layout], persist, { deep: true })

  const isBriefComplete = computed(
    () => !!siteType.value && !!style.value && brandName.value.trim().length > 0 && description.value.trim().length > 0,
  )

  function toBrief(): BriefIn | null {
    if (!siteType.value || !style.value || !brandName.value.trim() || !description.value.trim()) return null
    return {
      site_type: siteType.value,
      style: style.value,
      custom_hex_color: style.value === 'custom' ? customHex.value : null,
      brand_name: brandName.value.trim(),
      description: description.value.trim(),
      goal: goal.value,
      extra_requirements: extraRequirements.value.trim() || null,
      layout: layout.value,
    }
  }

  function reset() {
    siteType.value = null
    style.value = null
    customHex.value = '#2563EB'
    brandName.value = ''
    description.value = ''
    goal.value = 'sales'
    extraRequirements.value = ''
    layout.value = emptyLayoutPreferences()
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(STORAGE_KEY)
  }

  return {
    siteType,
    style,
    customHex,
    brandName,
    description,
    goal,
    extraRequirements,
    layout,
    isBriefComplete,
    toBrief,
    reset,
  }
})
