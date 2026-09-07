<script setup lang="ts">
import type { CheckoutIn, CheckoutOut, ProjectSummary, Tariff } from '~/types/api'

const auth = useAuthStore()
const api = useApi()
const toast = useToast()
const { confirm } = useConfirm()

const projects = ref<ProjectSummary[] | null>(null)
const loading = ref(true)
const search = ref('')
const deletingId = ref<string | null>(null)
const loadError = ref(false)
const statusFilter = ref('all')
const statusFilters = [{ value: 'all', label: 'Все сайты' }, { value: 'published', label: 'Опубликованы' }, { value: 'drafts', label: 'В работе' }]

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
  basic: 'Продвинутый',
  business: 'Бизнес',
}
// Порядок для переключателя + короткая подпись возможностей каждого тарифа.
const TARIFF_ORDER: Tariff[] = ['trial', 'basic', 'business']
const TARIFF_HINTS: Record<string, string> = {
  trial: '1 страница',
  basic: 'до 10 страниц, многостраничники',
  business: 'до 50 страниц, экспорт кода',
}

const switchingTariff = ref<Tariff | null>(null)

async function switchTariff(tariff: Tariff) {
  if (tariff === auth.tariff || switchingTariff.value) return
  switchingTariff.value = tariff
  try {
    await api.post<CheckoutOut>('/billing/checkout', { tariff } satisfies CheckoutIn)
    await auth.fetchMe()
    toast.success(`Тариф переключён: ${TARIFF_LABELS[tariff]}`)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось переключить тариф')
  } finally {
    switchingTariff.value = null
  }
}

async function load() {
  loading.value = true
  loadError.value = false
  try {
    projects.value = await api.get<ProjectSummary[]>('/projects')
  } catch (err) {
    loadError.value = true
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить проекты')
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filtered = computed(() => {
  const list = (projects.value ?? []).filter(p => statusFilter.value === 'all' || (statusFilter.value === 'published' ? p.status === 'published' : p.status !== 'published'))
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
  <WorkspaceShell>
    <div class="dashboard">
      <header class="dashboard__header">
        <div>
          <p class="dashboard__eyebrow">ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</p>
          <h1>Хорошие идеи заслуживают сайта.</h1><p class="dashboard__subtitle">Создавайте, пробуйте, развивайте. В своём стиле.</p>
          <div v-if="auth.user" class="tariff-switch">
            <span class="tariff-switch__label">Тариф (бета, бесплатно):</span>
            <div class="tariff-switch__options">
              <button
                v-for="t in TARIFF_ORDER"
                :key="t"
                type="button"
                class="tariff-switch__option"
                :class="{ 'is-active': auth.user.tariff === t }"
                :disabled="switchingTariff !== null"
                :title="TARIFF_HINTS[t]"
                @click="switchTariff(t)"
              >
                <Icon v-if="switchingTariff === t" name="lucide:loader-2" class="spin" />
                {{ TARIFF_LABELS[t] }}
              </button>
            </div>
          </div>
        </div>
        <div class="dashboard__actions">
          <BaseButton variant="primary" icon="lucide:plus" to="/new">Новый сайт</BaseButton>
          <BaseButton variant="ghost" icon="lucide:log-out" @click="logout">Выйти</BaseButton>
        </div>
      </header>

      <NuxtLink to="/new" class="create-banner">
        <div class="create-banner__copy"><span>СОЗДАНО ВАМИ. СОБРАНО С ИИ.</span><h2>Ваш следующий<br>большой шаг.</h2><p>От первого наброска до сайта<br>с характером вашего бизнеса.</p><span class="create-banner__button">Создать новый сайт <Icon name="lucide:arrow-up-right" /></span><small>Ваши предпочтения. Ваша структура. Ваш результат.</small></div>
        <div class="create-banner__preview" aria-hidden="true"><DesignPreview direction="editorial" brand="forma®" /></div>
      </NuxtLink>
      <div class="dashboard__collection"><div><h2>Мои сайты <span v-if="projects">{{ projects.length }}</span></h2><div class="collection-tabs"><button v-for="filter in statusFilters" :key="filter.value" type="button" :aria-pressed="statusFilter === filter.value" :class="{ active: statusFilter === filter.value }" @click="statusFilter = filter.value">{{ filter.label }}</button></div></div><div v-if="projects?.length" class="dashboard__search"><BaseInput v-model="search" label="Поиск сайтов" placeholder="Название сайта…" /></div></div>

      <div v-if="loading" class="project-grid">
        <div v-for="i in 3" :key="i" class="project-card glass-card">
          <BaseSkeleton height="90px" radius="var(--a-radius-md)" />
          <BaseSkeleton height="16px" width="70%" />
          <BaseSkeleton height="20px" width="90px" radius="var(--a-radius-full)" />
        </div>
      </div>

      <div v-else-if="loadError" class="empty-state glass-card"><Icon name="lucide:wifi-off" /><h2>Не удалось загрузить сайты</h2><p>Проверьте соединение и попробуйте ещё раз.</p><BaseButton @click="load">Повторить загрузку</BaseButton></div>
      <div v-else-if="!projects || projects.length === 0" class="empty-state glass-card">
        <div class="empty-state__icon"><Icon name="lucide:sparkles" /></div>
        <h2>Пока нет ни одного сайта</h2>
        <p>Начните с идеи. Выберите характер, расскажите о бизнесе — и создайте свой первый сайт.</p>
        <BaseButton variant="primary" icon="lucide:plus" to="/new">Создать первый сайт</BaseButton>
        <span class="empty-state__example">«Уютная кофейня с домашней выпечкой в центре города»</span>
      </div>

      <div v-else-if="filtered.length === 0" class="empty-state glass-card">
        <div class="empty-state__icon"><Icon name="lucide:search-x" /></div>
        <h2>Ничего не найдено</h2>
        <p>Измените поисковый запрос или выберите другую вкладку.</p>
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
  </WorkspaceShell>
</template>

<style scoped>
.dashboard { max-width: 1400px; padding: 48px; margin: auto; display: flex; flex-direction: column; gap: 36px; }
.dashboard__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.dashboard__eyebrow { color: var(--a-text-muted); font-size: 9px; letter-spacing: .15em; font-weight: 600; margin-bottom: 16px; }
.dashboard__header h1 { font-size: clamp(26px, 2.8vw, 38px); font-weight: 600; letter-spacing: -.045em; }
.dashboard__subtitle { font-size: 12px; color: var(--a-text-muted); margin-top: 12px; }
.dashboard__actions { display: flex; align-items: center; gap: 6px; }
.dashboard__actions :deep(.base-btn) { font-size: 11px; }
.tariff-switch { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 20px; font-size: 10px; color: var(--a-text-muted); }
.tariff-switch__options { display: flex; gap: 4px; }
.tariff-switch__option { display: flex; align-items: center; gap: 4px; padding: 5px 9px; background: transparent; border: 0; border-radius: 6px; color: var(--a-text-muted); cursor: pointer; font-size: 10px; }
.tariff-switch__option.is-active { color: var(--a-text); background: var(--a-surface-solid); box-shadow: var(--a-shadow-sm); }
.create-banner { position: relative; display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 20px; padding: 42px; min-height: 345px; overflow: hidden; border-radius: 20px; background: #e9ece5; color: #2c352b; text-decoration: none; border: 1px solid #2730220a; }
.create-banner__copy { z-index: 1; }
.create-banner__copy > span:first-child { font-size: 8px; letter-spacing: .16em; color: #5d6958; font-weight: 600; }
.create-banner h2 { font-size: clamp(30px, 3.2vw, 46px); font-weight: 500; letter-spacing: -.055em; margin: 19px 0 15px; line-height: 1.06; }
.create-banner p { font-size: 12px; color: #616c5b; line-height: 1.7; }
.create-banner__button { display: inline-flex; align-items: center; gap: 20px; background: #303f2f; color: #fff; padding: 12px 18px; border-radius: 24px; font-size: 11px; margin: 24px 0 16px; transition: background 150ms ease; }
.create-banner:hover .create-banner__button { background: #485b41; }
.create-banner small { display: block; font-size: 8px; color: #65715e; }
.create-banner__preview { transform: perspective(1200px) rotateY(-8deg) rotateZ(3deg) translate(20px, 20px); pointer-events: none; }
.create-banner__preview :deep(.design-preview) { box-shadow: -15px 30px 50px -20px #38433255; }
.dashboard__collection { display: flex; align-items: end; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--a-border); padding-bottom: 0; }
.dashboard__collection h2 { font-size: 20px; font-weight: 600; }
.dashboard__collection h2 > span { color: var(--a-text-muted); font-size: 12px; font-weight: 400; margin-left: 8px; }
.collection-tabs { display: flex; gap: 22px; margin-top: 20px; }
.collection-tabs button { position: relative; background: none; color: var(--a-text-muted); border: 0; font-size: 11px; padding: 0 0 14px; cursor: pointer; }
.collection-tabs button.active { color: var(--a-text); }
.collection-tabs button.active::after { content: ''; position: absolute; height: 2px; bottom: -1px; left: 0; right: 0; background: var(--a-text); }
.dashboard__search { width: 230px; margin-bottom: 12px; }
.dashboard__search :deep(label) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.dashboard__search :deep(input) { height: 35px; font-size: 11px; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 22px; }
.project-card { display: flex; flex-direction: column; gap: 16px; padding: 12px; background: var(--a-surface-solid); border: 1px solid var(--a-border); border-radius: 15px; box-shadow: var(--a-shadow-sm); transition: box-shadow 160ms ease; }
.project-card:hover { box-shadow: var(--a-shadow-md); }
.project-card__link { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; text-decoration: none; }
.project-card__thumb { position: relative; height: 145px; width: 100%; background: var(--a-surface); border-radius: 9px; display: grid; place-items: center; font-size: 30px; color: var(--a-text-muted); }
.project-card__thumb::before { content: '•••'; position: absolute; left: 12px; top: 5px; font-size: 12px; letter-spacing: 2px; opacity: .4; }
.project-card h3 { font-size: 14px; padding-inline: 6px; overflow-wrap: anywhere; }
.project-card__actions { display: flex; gap: 8px; }
.project-card__actions :deep(.base-btn) { font-size: 10px; }
.empty-state { padding: 38px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; background: transparent; box-shadow: none; border: 1px dashed var(--a-border-strong); border-radius: 16px; backdrop-filter: none; }
.empty-state__icon { color: var(--a-text-muted); font-size: 25px; }
.empty-state h2 { font-size: 18px; font-weight: 550; }
.empty-state p { max-width: 380px; color: var(--a-text-muted); font-size: 12px; line-height: 1.7; }
.empty-state__example { font-size: 10px; color: var(--a-text-muted); }
.card-in-enter-active, .card-in-leave-active { transition: opacity 160ms ease; }
.card-in-enter-from, .card-in-leave-to { opacity: 0; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) { .dashboard { padding: 30px; } .create-banner { padding: 28px; } }
@media (max-width: 900px) { .create-banner { grid-template-columns: 1fr; } .create-banner__preview { display: none; } }
@media (max-width: 600px) { .dashboard { padding: 26px 20px; gap: 28px; } .dashboard__collection { align-items: stretch; flex-direction: column; gap: 8px; } .dashboard__search { width: 100%; } .collection-tabs { gap: 20px; } .create-banner { padding: 28px; } .dashboard__actions { flex-wrap: wrap; } }
@media (prefers-reduced-motion: reduce) { .create-banner__preview { transform: none; } }
</style>
