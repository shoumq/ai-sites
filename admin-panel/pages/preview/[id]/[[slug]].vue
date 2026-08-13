<script setup lang="ts">
import type { ProjectOut } from '~/types/api'
import type { Theme } from '~/types/site'

// Read-only просмотр сайта — тот же SectionRenderer, что и в редакторе, но
// editable=false (голый рендер без единого обработчика, см. EditableText.vue).
// Опциональный [[slug]] — переключение между страницами multipage-сайта.
const route = useRoute()
const projectId = route.params.id as string
const slug = computed(() => (route.params.slug as string | undefined) ?? null)

const api = useApi()
const toast = useToast()

const project = ref<ProjectOut | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    project.value = await api.get<ProjectOut>(`/projects/${projectId}`)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить сайт')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const currentPage = computed(() => {
  const pages = project.value?.site_data.pages ?? []
  if (!pages.length) return null
  if (!slug.value) return pages.find((p) => p.slug === 'main') ?? pages[0]
  return pages.find((p) => p.slug === slug.value) ?? pages[0]
})

const DEFAULT_THEME: Theme = { style: 'business', primary_color: '#2563EB', font: 'Inter', logo_url: '', custom_css: '' }
useSiteTheme(computed(() => project.value?.site_data.theme ?? DEFAULT_THEME))

function pageHref(slugValue: string) {
  return slugValue === 'main' ? `/preview/${projectId}` : `/preview/${projectId}/${slugValue}`
}
</script>

<template>
  <div class="preview-page">
    <div v-if="loading" class="preview-page__loading">
      <BaseSkeleton width="240px" height="24px" />
    </div>

    <template v-else-if="project && currentPage">
      <nav v-if="project.site_data.pages.length > 1" class="preview-nav">
        <NuxtLink
          v-for="p in project.site_data.pages"
          :key="p.slug"
          :to="pageHref(p.slug)"
          class="preview-nav__item"
          :class="{ 'is-active': p.slug === currentPage.slug }"
        >
          {{ p.title || p.slug }}
        </NuxtLink>
        <NuxtLink :to="`/editor/${projectId}`" class="preview-nav__back">
          <Icon name="lucide:pencil" /> В редактор
        </NuxtLink>
      </nav>

      <div v-for="section in currentPage.sections" :key="section.id">
        <SectionRenderer :section="section" :editable="false" />
      </div>
    </template>

    <div v-else class="preview-page__loading">
      <p>Сайт ещё не сгенерирован.</p>
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: var(--surface, #fff);
}

.preview-page__loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-nav {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  padding: var(--a-space-3) var(--a-space-5);
  background: var(--a-bg-elevated);
  border-bottom: 1px solid var(--a-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.preview-nav__item {
  padding: 6px var(--a-space-3);
  border-radius: var(--a-radius-md);
  color: var(--a-text-muted);
  text-decoration: none;
  font-size: var(--a-fs-sm);
  font-weight: 600;
}
.preview-nav__item.is-active {
  background: var(--a-surface);
  color: var(--a-text);
}

.preview-nav__back {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--a-text-faint);
  text-decoration: none;
  font-size: var(--a-fs-xs);
}
</style>
