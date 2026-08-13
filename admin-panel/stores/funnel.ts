import { defineStore } from 'pinia'
import type { BriefIn, SiteGoal, SiteType, StylePreset } from '~/types/api'

/**
 * Данные 3-шаговой воронки «Новый сайт» — раньше терялись при рефреше
 * страницы (React-версия держала их только в router state). Персистим в
 * sessionStorage (переживает reload одной вкладки, не расползается по
 * другим вкладкам/сессиям как localStorage) и гидрируем синхронно при
 * создании стора.
 */
const STORAGE_KEY = 'ai-sites:funnel-brief'

interface PersistedFunnel {
  siteType: SiteType | null
  style: StylePreset | null
  customHex: string
  brandName: string
  description: string
  goal: SiteGoal
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

  function persist() {
    if (typeof window === 'undefined') return
    const snapshot: PersistedFunnel = {
      siteType: siteType.value,
      style: style.value,
      customHex: customHex.value,
      brandName: brandName.value,
      description: description.value,
      goal: goal.value,
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  watch([siteType, style, customHex, brandName, description, goal], persist)

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
    }
  }

  function reset() {
    siteType.value = null
    style.value = null
    customHex.value = '#2563EB'
    brandName.value = ''
    description.value = ''
    goal.value = 'sales'
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(STORAGE_KEY)
  }

  return { siteType, style, customHex, brandName, description, goal, isBriefComplete, toBrief, reset }
})
