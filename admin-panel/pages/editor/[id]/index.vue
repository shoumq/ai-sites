<script setup lang="ts">
import type { ProjectOut, PublishOut } from '~/types/api'
import type { Theme } from '~/types/site'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const store = useEditorStore()
const auth = useAuthStore()
const api = useApi()
const toast = useToast()

const loading = ref(true)
const loadError = ref(false)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const project = await api.get<ProjectOut>(`/projects/${projectId}`)
    store.loadProject(project)
    publishedUrl.value = project.published_url
  } catch (err) {
    loadError.value = true
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить проект')
  } finally {
    loading.value = false
  }
}

onMounted(load)

// site-blocks/composables/useSiteTheme.ts выставляет --primary/--font-family
// на <html> — работает даже когда site ещё не загружен (дефолтная тема), не
// требует условного вызова composable.
const DEFAULT_THEME: Theme = { style: 'business', primary_color: '#2563EB', font: 'Inter', logo_url: '', custom_css: '' }
const themeForPreview = computed(() => store.site?.theme ?? DEFAULT_THEME)
useSiteTheme(themeForPreview)

// -- undo (Ctrl+Z), но не когда фокус внутри текстового поля/contenteditable
// (там должен работать нативный undo браузера для текста) --
function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

function onKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey && !isEditableTarget(e.target)) {
    e.preventDefault()
    store.undo()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// -- топбар --
const previewMode = ref<'desktop' | 'mobile'>('desktop')
const activeTab = ref<'constructor' | 'blocks' | 'chat'>('constructor')
const publishing = ref(false)
const exporting = ref(false)
const publishedUrl = ref<string | null>(null)

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  generating: 'Генерируется',
  ready: 'Готов',
  published: 'Опубликован',
}

const isBusiness = computed(() => auth.tariff === 'business')

// Инлайн-редактируемое имя проекта. ВАЖНО: backend/app/api/routes/projects.py
// не предоставляет эндпоинт переименования (только generate/get/list/delete) —
// правка остаётся локальной на вкладке до перезагрузки. Не выдумываем
// несуществующий API-вызов; см. отчёт по итогам задачи.
const editingName = ref(false)
const nameDraft = ref('')

function startEditName() {
  nameDraft.value = store.project?.name ?? ''
  editingName.value = true
  nextTick(() => nameInputEl.value?.focus())
}

function commitName() {
  editingName.value = false
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== store.project?.name) {
    store.setProjectMeta({ name: trimmed })
  }
}

const nameInputEl = ref<HTMLInputElement | null>(null)

async function handlePublish() {
  publishing.value = true
  try {
    const result = await api.post<PublishOut>(`/projects/${projectId}/publish`)
    publishedUrl.value = result.url
    store.setProjectMeta({ status: 'published', published_url: result.url })
    toast.success('Сайт опубликован')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось опубликовать сайт')
  } finally {
    publishing.value = false
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const filename = `${(store.project?.name ?? 'site').toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-')}.zip`
    await api.download(`/projects/${projectId}/export`, filename)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось экспортировать код')
  } finally {
    exporting.value = false
  }
}

const publishedHref = computed(() => {
  const url = publishedUrl.value
  if (!url) return ''
  return url.startsWith('http') ? url : `https://${url}`
})
</script>

<template>
  <div class="editor-shell">
    <div v-if="loading" class="editor-loading">
      <BaseSkeleton width="220px" height="20px" />
      <BaseSkeleton width="100%" height="60vh" radius="var(--a-radius-lg)" />
    </div>

    <div v-else-if="loadError || !store.site" class="editor-loading">
      <p>Не удалось загрузить проект.</p>
      <BaseButton variant="secondary" to="/">К проектам</BaseButton>
    </div>

    <template v-else>
      <header class="editor-topbar">
        <div class="editor-topbar__left">
          <NuxtLink to="/" class="icon-btn" title="К проектам">
            <Icon name="lucide:arrow-left" />
          </NuxtLink>

          <div class="editor-topbar__name">
            <input
              v-if="editingName"
              ref="nameInputEl"
              v-model="nameDraft"
              class="editor-topbar__name-input"
              @blur="commitName"
              @keydown.enter="commitName"
              @keydown.escape="editingName = false"
            >
            <button v-else type="button" class="editor-topbar__name-btn" @click="startEditName">
              {{ store.project?.name }}
              <Icon name="lucide:pencil" />
            </button>
          </div>

          <BaseBadge size="sm" :variant="store.project?.status === 'published' ? 'success' : 'neutral'">
            {{ STATUS_LABELS[store.project?.status ?? ''] ?? store.project?.status }}
          </BaseBadge>

          <span class="save-indicator" :class="`is-${store.saveStatus}`">
            <Icon v-if="store.saveStatus === 'saving'" name="lucide:loader-2" class="spin" />
            <Icon v-else-if="store.saveStatus === 'saved'" name="lucide:check" />
            <Icon v-else-if="store.saveStatus === 'error'" name="lucide:alert-triangle" />
            <template v-if="store.saveStatus === 'saving'">Сохраняем…</template>
            <template v-else-if="store.saveStatus === 'saved'">Сохранено</template>
            <template v-else-if="store.saveStatus === 'error'">Ошибка сохранения</template>
          </span>
        </div>

        <div class="editor-topbar__right">
          <button
            type="button"
            class="icon-btn"
            :class="{ 'is-active': previewMode === 'desktop' }"
            title="Десктоп"
            @click="previewMode = 'desktop'"
          >
            <Icon name="lucide:monitor" />
          </button>
          <button
            type="button"
            class="icon-btn"
            :class="{ 'is-active': previewMode === 'mobile' }"
            title="Мобильный"
            @click="previewMode = 'mobile'"
          >
            <Icon name="lucide:smartphone" />
          </button>
          <NuxtLink :to="`/editor/${projectId}/settings`" class="icon-btn" title="Настройки">
            <Icon name="lucide:settings" />
          </NuxtLink>
          <BaseButton variant="secondary" size="sm" icon="lucide:eye" :to="`/preview/${projectId}`" target="_blank">
            Просмотр
          </BaseButton>
          <BaseButton
            v-if="isBusiness"
            variant="secondary"
            size="sm"
            icon="lucide:download"
            :loading="exporting"
            @click="handleExport"
          >
            Экспорт кода
          </BaseButton>
          <BaseButton variant="primary" size="sm" icon="lucide:rocket" :loading="publishing" @click="handlePublish">
            Опубликовать
          </BaseButton>
        </div>
      </header>

      <div v-if="publishedUrl" class="published-banner">
        <Icon name="lucide:check-circle-2" />
        Сайт опубликован:
        <a :href="publishedHref" target="_blank" rel="noreferrer">{{ publishedUrl }}</a>
      </div>

      <div v-if="store.site.pages.length > 1" class="page-tabs">
        <button
          v-for="(p, i) in store.site.pages"
          :key="p.slug"
          type="button"
          class="page-tabs__item"
          :class="{ 'is-active': i === store.currentPageIndex }"
          @click="store.switchPage(i)"
        >
          {{ p.title || p.slug }}
        </button>
      </div>

      <div class="editor-body">
        <div class="editor-canvas-wrap">
          <div class="editor-canvas-frame" :class="{ 'is-mobile': previewMode === 'mobile' }">
            <PageCanvas />
          </div>
        </div>

        <aside class="editor-panel glass-card">
          <BaseTabs
            v-model="activeTab"
            :tabs="[
              { key: 'constructor', label: 'Конструктор', icon: 'lucide:sliders-horizontal' },
              { key: 'blocks', label: 'Блоки', icon: 'lucide:layout-grid' },
              { key: 'chat', label: 'ИИ-Чат', icon: 'lucide:message-circle' },
            ]"
          />
          <div class="editor-panel__content">
            <ConstructorPanel v-if="activeTab === 'constructor'" />
            <BlockLibrary v-else-if="activeTab === 'blocks'" />
            <ChatPanel v-else-if="activeTab === 'chat'" />
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.editor-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: var(--a-z-base);
}

.editor-loading {
  max-width: 900px;
  margin: var(--a-space-8) auto;
  padding: 0 var(--a-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
}

.editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-4);
  padding: var(--a-space-3) var(--a-space-5);
  border-bottom: 1px solid var(--a-border);
  background: var(--a-glass-bg);
  backdrop-filter: blur(var(--a-glass-blur));
  flex-wrap: wrap;
}

.editor-topbar__left,
.editor-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  flex-wrap: wrap;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--a-radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--a-text-muted);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--a-transition-fast), color var(--a-transition-fast), border-color var(--a-transition-fast);
}
.icon-btn:hover {
  background: var(--a-surface);
  color: var(--a-text);
}
.icon-btn.is-active {
  background: var(--a-gradient-brand);
  color: #fff;
}

.editor-topbar__name-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--a-text);
  font-weight: 700;
  font-size: var(--a-fs-md);
  cursor: text;
  padding: 4px 6px;
  border-radius: var(--a-radius-sm);
}
.editor-topbar__name-btn:hover {
  background: var(--a-surface);
}
.editor-topbar__name-btn svg {
  font-size: 0.8rem;
  color: var(--a-text-faint);
}

.editor-topbar__name-input {
  height: 32px;
  padding: 0 var(--a-space-2);
  background: var(--a-surface);
  border: 1px solid var(--a-accent);
  border-radius: var(--a-radius-sm);
  color: var(--a-text);
  font-weight: 700;
  font-size: var(--a-fs-md);
  font-family: inherit;
}

.save-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}
.save-indicator.is-saved { color: var(--a-success); }
.save-indicator.is-error { color: var(--a-error); }

.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.published-banner {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  padding: var(--a-space-2) var(--a-space-5);
  background: var(--a-success-bg);
  color: var(--a-success);
  font-size: var(--a-fs-sm);
}
.published-banner a {
  color: inherit;
  font-weight: 600;
}

.page-tabs {
  display: flex;
  gap: var(--a-space-1);
  padding: var(--a-space-2) var(--a-space-5);
  overflow-x: auto;
  border-bottom: 1px solid var(--a-border);
}

.page-tabs__item {
  padding: var(--a-space-2) var(--a-space-4);
  border-radius: var(--a-radius-md);
  background: transparent;
  border: none;
  color: var(--a-text-muted);
  font-size: var(--a-fs-sm);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--a-transition-fast), color var(--a-transition-fast);
}
.page-tabs__item:hover {
  background: var(--a-surface);
}
.page-tabs__item.is-active {
  background: var(--a-surface);
  color: var(--a-text);
  box-shadow: inset 0 -2px 0 var(--a-accent);
}

.editor-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--a-space-4);
  padding: var(--a-space-4) var(--a-space-5) var(--a-space-6);
  min-height: 0;
}

.editor-canvas-wrap {
  overflow: auto;
  border-radius: var(--a-radius-lg);
  background: var(--a-bg-elevated);
  border: 1px solid var(--a-border);
  padding: var(--a-space-5);
}

.editor-canvas-frame {
  background: var(--surface, #fff);
  border-radius: var(--a-radius-md);
  overflow: hidden;
  margin: 0 auto;
  transition: max-width var(--a-transition-slow) var(--a-ease-out);
  box-shadow: var(--a-shadow-lg);
  /* Блоки сайта переключают мобильную вёрстку через @container, а не
     @media — иначе переключатель "Мобильный" здесь в редакторе сужает
     только эту рамку, а не реальный viewport браузера, и адаптивные
     стили (например бургер-меню шапки) никогда не срабатывали в превью,
     хотя на настоящем телефоне работали. container-type делает ширину
     САМОЙ рамки источником истины для @container внутри неё. */
  container-type: inline-size;
}

.editor-canvas-frame.is-mobile {
  max-width: 390px;
}

.editor-panel {
  padding: var(--a-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
  height: fit-content;
  max-height: calc(100vh - 140px);
  position: sticky;
  top: var(--a-space-4);
  overflow: hidden;
}

.editor-panel__content {
  overflow-y: auto;
  padding-right: 4px;
}

@media (max-width: 960px) {
  .editor-body {
    grid-template-columns: 1fr;
  }
  .editor-panel {
    position: static;
    max-height: none;
  }
}
</style>
