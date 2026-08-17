<script setup lang="ts">
/**
 * Заявки и заказы, пришедшие с опубликованного сайта.
 *
 * Раньше формы на сгенерированном сайте были декоративными — отправлять их было
 * некуда. Теперь статический сайт шлёт заявку на публичный эндпоинт платформы
 * (backend/app/api/routes/public.py), и она видна здесь.
 */
import type { Lead, LeadsPage } from '~/types/api'

const route = useRoute()
const projectId = route.params.id as string
const api = useApi()
const toast = useToast()
const confirm = useConfirm()

const leads = ref<Lead[]>([])
const total = ref(0)
const unread = ref(0)
const loading = ref(true)
const kindFilter = ref<'' | 'lead' | 'order'>('')

const KIND_OPTIONS = [
  { value: '', label: 'Все обращения' },
  { value: 'lead', label: 'Только заявки' },
  { value: 'order', label: 'Только заказы' },
]

async function load() {
  loading.value = true
  try {
    const query = kindFilter.value ? `?kind=${kindFilter.value}` : ''
    const page = await api.get<LeadsPage>(`/projects/${projectId}/leads${query}`)
    leads.value = page.items
    total.value = page.total
    unread.value = page.unread
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить заявки')
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(kindFilter, load)

async function toggleRead(lead: Lead) {
  const next = !lead.is_read
  try {
    await api.patch(`/projects/${projectId}/leads/${lead.id}`, { is_read: next })
    lead.is_read = next
    unread.value = leads.value.filter((l) => !l.is_read).length
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось изменить статус заявки')
  }
}

async function removeLead(lead: Lead) {
  const ok = await confirm.confirm({
    title: 'Удалить заявку?',
    message: `Заявка от ${lead.name || 'без имени'} будет удалена безвозвратно.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (!ok) return
  try {
    await api.del(`/projects/${projectId}/leads/${lead.id}`)
    leads.value = leads.value.filter((l) => l.id !== lead.id)
    total.value -= 1
    toast.success('Заявка удалена')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось удалить заявку')
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="page-shell">
    <div class="container leads-page">
      <NuxtLink :to="`/editor/${projectId}`" class="back-link">
        <Icon name="lucide:arrow-left" /> Вернуться в редактор
      </NuxtLink>

      <div class="leads-page__header">
        <h1>Заявки и заказы</h1>
        <BaseBadge v-if="unread" variant="success" size="sm">{{ unread }} новых</BaseBadge>
        <span class="leads-page__total">всего: {{ total }}</span>
      </div>

      <BaseSelect
        :model-value="kindFilter"
        :options="KIND_OPTIONS"
        @update:model-value="kindFilter = $event as '' | 'lead' | 'order'"
      />

      <div v-if="loading" class="leads-list">
        <BaseSkeleton v-for="i in 3" :key="i" height="120px" radius="var(--a-radius-lg)" />
      </div>

      <p v-else-if="!leads.length" class="leads-empty">
        Заявок пока нет. Они появятся здесь, как только посетитель отправит форму на опубликованном сайте.
      </p>

      <div v-else class="leads-list">
        <article v-for="lead in leads" :key="lead.id" class="lead-card glass-card" :class="{ 'is-unread': !lead.is_read }">
          <header class="lead-card__head">
            <BaseBadge :variant="lead.kind === 'order' ? 'success' : 'neutral'" size="sm">
              {{ lead.kind === 'order' ? 'Заказ' : 'Заявка' }}
            </BaseBadge>
            <span class="lead-card__date">{{ formatDate(lead.created_at) }}</span>
            <div class="lead-card__actions">
              <button type="button" class="icon-btn" :title="lead.is_read ? 'Отметить новой' : 'Отметить прочитанной'" @click="toggleRead(lead)">
                <Icon :name="lead.is_read ? 'lucide:mail' : 'lucide:mail-open'" />
              </button>
              <button type="button" class="icon-btn" title="Удалить" @click="removeLead(lead)">
                <Icon name="lucide:trash-2" />
              </button>
            </div>
          </header>

          <div class="lead-card__contacts">
            <span v-if="lead.name"><Icon name="lucide:user" /> {{ lead.name }}</span>
            <a v-if="lead.phone" :href="`tel:${lead.phone}`"><Icon name="lucide:phone" /> {{ lead.phone }}</a>
            <a v-if="lead.email" :href="`mailto:${lead.email}`"><Icon name="lucide:mail" /> {{ lead.email }}</a>
          </div>

          <p v-if="lead.message" class="lead-card__message">{{ lead.message }}</p>

          <dl v-if="Object.keys(lead.payload?.extra ?? {}).length" class="lead-card__extra">
            <template v-for="(value, key) in lead.payload.extra" :key="key">
              <dt>{{ key }}</dt>
              <dd>{{ value }}</dd>
            </template>
          </dl>

          <ul v-if="lead.payload?.items?.length" class="lead-card__items">
            <li v-for="(item, i) in lead.payload.items" :key="i">
              <span>{{ item.name }} × {{ item.qty }}</span>
              <span>{{ item.price }}</span>
            </li>
            <li v-if="lead.payload.total" class="is-total">
              <span>Итого</span>
              <span>{{ lead.payload.total }}</span>
            </li>
          </ul>

          <footer v-if="lead.source_page || lead.source_block" class="lead-card__source">
            <Icon name="lucide:link" />
            {{ lead.source_page || '/' }}<template v-if="lead.source_block"> · блок {{ lead.source_block }}</template>
          </footer>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leads-page {
  padding-top: var(--a-space-6);
  padding-bottom: var(--a-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
  max-width: 820px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--a-text-muted);
  text-decoration: none;
  font-size: var(--a-fs-sm);
  width: fit-content;
}

.leads-page__header {
  display: flex;
  align-items: center;
  gap: var(--a-space-3);
}

.leads-page__header h1 {
  font-size: var(--a-fs-2xl);
}

.leads-page__total {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.leads-empty {
  padding: var(--a-space-8) var(--a-space-5);
  text-align: center;
  color: var(--a-text-faint);
}

.leads-list {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
}

.lead-card {
  padding: var(--a-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
}

.lead-card.is-unread {
  border-left: 3px solid var(--a-accent);
}

.lead-card__head {
  display: flex;
  align-items: center;
  gap: var(--a-space-3);
}

.lead-card__date {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.lead-card__actions {
  margin-left: auto;
  display: flex;
  gap: var(--a-space-2);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-surface);
  color: var(--a-text-muted);
  cursor: pointer;
}

.icon-btn:hover {
  color: var(--a-text);
  border-color: var(--a-border-strong);
}

.lead-card__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-4);
  font-size: var(--a-fs-sm);
}

.lead-card__contacts a {
  color: var(--a-accent);
  text-decoration: none;
}

.lead-card__message {
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  white-space: pre-wrap;
}

.lead-card__extra {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px var(--a-space-3);
  margin: 0;
  font-size: var(--a-fs-xs);
}

.lead-card__extra dt {
  color: var(--a-text-faint);
}

.lead-card__extra dd {
  margin: 0;
  color: var(--a-text);
}

.lead-card__items {
  list-style: none;
  margin: 0;
  padding: var(--a-space-3);
  border-radius: var(--a-radius-md);
  background: var(--a-surface);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--a-fs-sm);
}

.lead-card__items li {
  display: flex;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.lead-card__items li.is-total {
  border-top: 1px solid var(--a-border);
  padding-top: 4px;
  font-weight: 700;
}

.lead-card__source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}
</style>
