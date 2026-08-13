<script setup lang="ts">
import type { ProjectSummary } from '~/types/api'

const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const { confirm } = useConfirm()

const projects = ref<ProjectSummary[] | null>(null)
const loading = ref(true)
const search = ref('')
const deletingId = ref<string | null>(null)

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  generating: 'Генерируется',
  ready: 'Готов',
  published: 'Опубликован',
}
const STATUS_VARIANT: Record<string, 'neutral' | 'warning' | 'success' | 'brand'> = {
  draft: 'neutral',
  generating: 'warning',
  ready: 'success',
  published: 'brand',
}
const TYPE_ICONS: Record<string, string> = {
  landing: 'lucide:rocket',
  shop: 'lucide:shopping-bag',
  multipage: 'lucide:files',
  crm: 'lucide:layout-dashboard',
}
const TARIFF_LABELS: Record<string, string> = {
  trial: 'Бесплатный',
  basic: 'Базовый',
  business: 'Бизнес',
}

async function load() {
  loading.value = true
  try {
    projects.value = await api.get<ProjectSummary[]>('/projects')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить проекты')
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filtered = computed(() => {
  const list = projects.value ?? []
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((p) => p.name.toLowerCase().includes(q))
})

async function removeProject(p: ProjectSummary) {
  const ok = await confirm({
    title: 'Удалить проект?',
    message: `Проект «${p.name}» и все его данные будут удалены безвозвратно.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return
  deletingId.value = p.id
  try {
    await api.del(`/projects/${p.id}`)
    projects.value = (projects.value ?? []).filter((x) => x.id !== p.id)
    toast.success('Проект удалён')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось удалить проект')
  } finally {
    deletingId.value = null
  }
}

function logout() {
  auth.logout()
  navigateTo('/login')
}
</script>

<template>
  <div class="page-shell">
    <div class="container dashboard">
      <header class="dashboard__header">
        <div>
          <h1>Мои сайты</h1>
          <p v-if="auth.user" class="dashboard__tariff">
            Тариф: <BaseBadge variant="brand" size="sm">{{ TARIFF_LABELS[auth.user.tariff] }}</BaseBadge>
          </p>
        </div>
        <div class="dashboard__actions">
          <BaseButton variant="primary" icon="lucide:plus" to="/new">Новый сайт</BaseButton>
          <BaseButton variant="ghost" icon="lucide:log-out" @click="logout">Выйти</BaseButton>
        </div>
      </header>

      <div v-if="!loading && projects && projects.length > 0" class="dashboard__search">
        <BaseInput v-model="search" placeholder="Поиск по названию…" />
      </div>

      <div v-if="loading" class="project-grid">
        <div v-for="i in 3" :key="i" class="project-card glass-card">
          <BaseSkeleton height="90px" radius="var(--a-radius-md)" />
          <BaseSkeleton height="16px" width="70%" />
          <BaseSkeleton height="20px" width="90px" radius="var(--a-radius-full)" />
        </div>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="empty-state glass-card">
        <div class="empty-state__icon"><Icon name="lucide:sparkles" /></div>
        <h2>Пока нет ни одного сайта</h2>
        <p>Опишите бренд в двух словах — ИИ соберёт лендинг за минуту.</p>
        <BaseButton variant="primary" icon="lucide:plus" to="/new">Создать первый сайт</BaseButton>
        <span class="empty-state__example">«Уютная кофейня с домашней выпечкой в центре города»</span>
      </div>

      <div v-else-if="filtered.length === 0" class="empty-state glass-card">
        <div class="empty-state__icon"><Icon name="lucide:search-x" /></div>
        <h2>Ничего не найдено</h2>
        <p>Попробуйте другой запрос.</p>
      </div>

      <TransitionGroup v-else name="card-in" tag="div" class="project-grid">
        <div v-for="p in filtered" :key="p.id" class="project-card glass-card">
          <NuxtLink :to="`/editor/${p.id}`" class="project-card__link">
            <div class="project-card__thumb">
              <Icon :name="TYPE_ICONS[p.type] ?? 'lucide:globe'" />
            </div>
            <h3>{{ p.name }}</h3>
            <BaseBadge :variant="STATUS_VARIANT[p.status] ?? 'neutral'" size="sm">
              {{ STATUS_LABELS[p.status] ?? p.status }}
            </BaseBadge>
          </NuxtLink>
          <div class="project-card__actions">
            <BaseButton
              v-if="p.status !== 'draft' && p.status !== 'generating'"
              variant="secondary"
              size="sm"
              icon="lucide:eye"
              :to="`/preview/${p.id}`"
              block
            >
              Просмотр
            </BaseButton>
            <BaseButton
              variant="danger"
              size="sm"
              icon="lucide:trash-2"
              block
              :loading="deletingId === p.id"
              @click="removeProject(p)"
            >
              Удалить
            </BaseButton>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding-top: var(--a-space-7);
  padding-bottom: var(--a-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-5);
}

.dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--a-space-4);
  flex-wrap: wrap;
}

.dashboard__header h1 {
  font-size: var(--a-fs-2xl);
}

.dashboard__tariff {
  margin-top: var(--a-space-2);
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
}

.dashboard__actions {
  display: flex;
  gap: var(--a-space-3);
}

.dashboard__search {
  max-width: 320px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--a-space-5);
}

.project-card {
  padding: var(--a-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
  transition: transform var(--a-transition-base), box-shadow var(--a-transition-base);
}
.project-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--a-shadow-lg);
}

.project-card__link {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
  text-decoration: none;
  color: inherit;
}

.project-card__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
  border-radius: var(--a-radius-md);
  background: var(--a-gradient-brand-soft);
  font-size: 2rem;
  color: #fff;
}

.project-card h3 {
  font-size: var(--a-fs-md);
}

.project-card__actions {
  display: flex;
  gap: var(--a-space-2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--a-space-3);
  padding: var(--a-space-8) var(--a-space-6);
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--a-radius-full);
  background: var(--a-gradient-brand-soft);
  color: #fff;
  font-size: 1.75rem;
  margin-bottom: var(--a-space-2);
}

.empty-state p {
  color: var(--a-text-muted);
  max-width: 360px;
}

.empty-state__example {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  font-style: italic;
}

.card-in-enter-active {
  transition: transform var(--a-transition-slow) var(--a-ease-spring), opacity var(--a-transition-base);
}
.card-in-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.card-in-leave-active {
  transition: transform var(--a-transition-fast), opacity var(--a-transition-fast);
  position: absolute;
}
.card-in-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
