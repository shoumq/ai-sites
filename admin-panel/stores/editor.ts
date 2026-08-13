import { defineStore } from 'pinia'
import type { ProjectOut } from '~/types/api'
import type { Page, Section, SiteSchema, Theme } from '~/types/site'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const UNDO_LIMIT = 20
const SAVE_DEBOUNCE_MS = 800

function cloneSite(site: SiteSchema): SiteSchema {
  return structuredClone(site)
}

/**
 * Единый источник правды для холста редактора: текущий проект, JSON-схема
 * сайта, выбор блока/страницы, стек undo-снапшотов и статус автосейва.
 * Централизовано здесь (а не в локальном ref страницы), потому что
 * ConstructorPanel/BlockLibrary/ChatPanel/PageCanvas — разные компоненты, и
 * без единого стора синхронизация undo + debounce-автосейва между ними
 * превратилась бы в проп-дриллинг с дублирующейся логикой.
 */
export const useEditorStore = defineStore('editor', () => {
  const projectId = ref<string | null>(null)
  const project = ref<ProjectOut | null>(null)
  const site = ref<SiteSchema | null>(null)
  const currentPageIndex = ref(0)
  const selectedSectionId = ref<string | null>(null)
  const saveStatus = ref<SaveStatus>('idle')

  const undoStack: SiteSchema[] = []
  const canUndo = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const currentPage = computed<Page | null>(() => {
    if (!site.value) return null
    const idx = Math.min(currentPageIndex.value, site.value.pages.length - 1)
    return site.value.pages[idx] ?? null
  })

  const selectedSection = computed<Section | null>(() => {
    if (!currentPage.value || !selectedSectionId.value) return null
    return currentPage.value.sections.find((s) => s.id === selectedSectionId.value) ?? null
  })

  function loadProject(loaded: ProjectOut) {
    projectId.value = loaded.id
    project.value = loaded
    site.value = cloneSite(loaded.site_data)
    currentPageIndex.value = 0
    selectedSectionId.value = null
    undoStack.length = 0
    canUndo.value = false
    saveStatus.value = 'saved'
  }

  function snapshot() {
    if (!site.value) return
    undoStack.push(cloneSite(site.value))
    if (undoStack.length > UNDO_LIMIT) undoStack.shift()
    canUndo.value = true
  }

  function undo() {
    const previous = undoStack.pop()
    canUndo.value = undoStack.length > 0
    if (!previous) return
    site.value = previous
    scheduleSave()
  }

  function scheduleSave() {
    if (!projectId.value || !site.value) return
    saveStatus.value = 'saving'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      if (!projectId.value || !site.value) return
      try {
        const api = useApi()
        await api.put(`/projects/${projectId.value}/site`, { site_data: site.value })
        saveStatus.value = 'saved'
      } catch (err) {
        saveStatus.value = 'error'
        useToast().error(err instanceof ApiError ? err.message : 'Не удалось сохранить изменения')
      }
    }, SAVE_DEBOUNCE_MS)
  }

  function updateSection(id: string, patch: Record<string, unknown>) {
    if (!site.value) return
    snapshot()
    site.value = {
      ...site.value,
      pages: site.value.pages.map((page, i) =>
        i === currentPageIndex.value
          ? { ...page, sections: page.sections.map((s) => (s.id === id ? ({ ...s, ...patch } as Section) : s)) }
          : page,
      ),
    }
    scheduleSave()
  }

  function updateTheme(patch: Partial<Theme>) {
    if (!site.value) return
    snapshot()
    site.value = { ...site.value, theme: { ...site.value.theme, ...patch } }
    scheduleSave()
  }

  function deleteSection(id: string) {
    if (!site.value) return
    snapshot()
    site.value = {
      ...site.value,
      pages: site.value.pages.map((page, i) =>
        i === currentPageIndex.value ? { ...page, sections: page.sections.filter((s) => s.id !== id) } : page,
      ),
    }
    if (selectedSectionId.value === id) selectedSectionId.value = null
    scheduleSave()
  }

  function insertSection(index: number, section: Section) {
    if (!site.value) return
    snapshot()
    site.value = {
      ...site.value,
      pages: site.value.pages.map((page, i) => {
        if (i !== currentPageIndex.value) return page
        const sections = page.sections.slice()
        sections.splice(index, 0, section)
        return { ...page, sections }
      }),
    }
    selectedSectionId.value = section.id
    scheduleSave()
  }

  /** Используется vuedraggable v-model на холсте — и для сортировки, и как приёмник clone из BlockLibrary. */
  function setPageSections(sections: Section[]) {
    if (!site.value) return
    snapshot()
    site.value = {
      ...site.value,
      pages: site.value.pages.map((page, i) => (i === currentPageIndex.value ? { ...page, sections } : page)),
    }
    scheduleSave()
  }

  /** Результат ИИ-чата уже применён и сохранён на бэкенде — просто синхронизируем локальный стейт. */
  function applyExternalSite(newSite: SiteSchema) {
    snapshot()
    site.value = newSite
    saveStatus.value = 'saved'
  }

  function selectSection(id: string | null) {
    selectedSectionId.value = id
  }

  function switchPage(index: number) {
    currentPageIndex.value = index
    selectedSectionId.value = null
  }

  function setProjectMeta(patch: Partial<ProjectOut>) {
    if (!project.value) return
    project.value = { ...project.value, ...patch }
  }

  return {
    projectId,
    project,
    site,
    currentPageIndex,
    selectedSectionId,
    saveStatus,
    canUndo,
    currentPage,
    selectedSection,
    loadProject,
    undo,
    updateSection,
    updateTheme,
    deleteSection,
    insertSection,
    setPageSections,
    applyExternalSite,
    selectSection,
    switchPage,
    setProjectMeta,
  }
})
