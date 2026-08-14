<script setup lang="ts">
import { emptyProjectSettings } from '~/types/api'
import type { DnsCheckResult, ProjectSettings } from '~/types/api'

const route = useRoute()
const projectId = route.params.id as string
const api = useApi()
const toast = useToast()

const settings = ref<ProjectSettings>(emptyProjectSettings())
const loading = ref(true)
const loaded = ref(false)
const checking = ref(false)
const dnsResult = ref<DnsCheckResult | null>(null)

let saveTimer: ReturnType<typeof setTimeout> | null = null
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

async function load() {
  loading.value = true
  try {
    settings.value = await api.get<ProjectSettings>(`/projects/${projectId}/settings`)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить настройки')
  } finally {
    loading.value = false
    loaded.value = true
  }
}
onMounted(load)

function scheduleSave() {
  if (!loaded.value) return
  saveStatus.value = 'saving'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      await api.put(`/projects/${projectId}/settings`, settings.value)
      saveStatus.value = 'saved'
    } catch (err) {
      saveStatus.value = 'error'
      toast.error(err instanceof ApiError ? err.message : 'Не удалось сохранить настройки')
    }
  }, 800)
}

watch(settings, scheduleSave, { deep: true })

async function checkDomain() {
  checking.value = true
  try {
    dnsResult.value = await api.post<DnsCheckResult>(`/projects/${projectId}/settings/check-domain`)
    if (dnsResult.value.verified) settings.value.domain.dns_verified = true
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось проверить домен. Убедитесь, что он указан.')
  } finally {
    checking.value = false
  }
}

function onDomainInput(value: string) {
  settings.value.domain.custom_domain = value
  settings.value.domain.dns_verified = false
}
</script>

<template>
  <div class="page-shell">
    <div class="container settings-page">
      <NuxtLink :to="`/editor/${projectId}`" class="back-link">
        <Icon name="lucide:arrow-left" /> Вернуться в редактор
      </NuxtLink>

      <div class="settings-page__header">
        <h1>Настройки сайта</h1>
        <span class="save-indicator" :class="`is-${saveStatus}`">
          <Icon v-if="saveStatus === 'saving'" name="lucide:loader-2" class="spin" />
          <Icon v-else-if="saveStatus === 'saved'" name="lucide:check" />
          <Icon v-else-if="saveStatus === 'error'" name="lucide:alert-triangle" />
          <template v-if="saveStatus === 'saving'">Сохраняем…</template>
          <template v-else-if="saveStatus === 'saved'">Сохранено</template>
          <template v-else-if="saveStatus === 'error'">Ошибка сохранения</template>
        </span>
      </div>

      <div v-if="loading" class="settings-grid">
        <BaseSkeleton v-for="i in 4" :key="i" height="180px" radius="var(--a-radius-lg)" />
      </div>

      <div v-else class="settings-grid">
        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320 } }">
          <h2><Icon name="lucide:globe" /> Домены</h2>
          <BaseInput
            label="Свой домен"
            placeholder="example.ru"
            :model-value="settings.domain.custom_domain"
            @update:model-value="onDomainInput"
          />
          <BaseButton variant="secondary" :loading="checking" :disabled="!settings.domain.custom_domain" @click="checkDomain">
            Проверить DNS
          </BaseButton>
          <div v-if="dnsResult" class="dns-result" :class="dnsResult.verified ? 'is-verified' : 'is-unverified'">
            <Icon :name="dnsResult.verified ? 'lucide:check-circle-2' : 'lucide:alert-circle'" />
            {{ dnsResult.detail }}
          </div>
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 60 } }">
          <h2><Icon name="lucide:search" /> SEO-настройки</h2>
          <BaseInput label="Title" placeholder="Кафе Ромашка — уютная кофейня в центре города" v-model="settings.seo.title" />
          <BaseTextarea label="Description" placeholder="Домашняя выпечка, авторские десерты…" v-model="settings.seo.description" />
          <BaseInput label="Keywords" placeholder="кофейня, кафе, десерты, доставка" v-model="settings.seo.keywords" />
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 120 } }">
          <h2><Icon name="lucide:scale" /> Законность (152-ФЗ)</h2>
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Согласие на обработку ПД</div>
              <div class="toggle-row__hint">Баннер согласия появится внизу каждой страницы</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.legal.add_pd_consent }" @click="settings.legal.add_pd_consent = !settings.legal.add_pd_consent" />
          </div>
          <BaseInput label="ИНН" placeholder="7712345678" v-model="settings.legal.inn" />
          <BaseInput label="ОГРН" placeholder="1157746112233" v-model="settings.legal.ogrn" />
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 180 } }">
          <h2><Icon name="lucide:plug" /> Интеграции</h2>
          <div class="toggle-row">
            <div class="toggle-row__label">ЮKassa</div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.integrations.yookassa_enabled }" @click="settings.integrations.yookassa_enabled = !settings.integrations.yookassa_enabled" />
          </div>
          <BaseInput label="Яндекс.Метрика — номер счётчика" placeholder="98765432" v-model="settings.integrations.yandex_metrika_id" />
          <div class="toggle-row">
            <div class="toggle-row__label">2ГИС (iframe на карте контактов)</div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.integrations.dgis_enabled }" @click="settings.integrations.dgis_enabled = !settings.integrations.dgis_enabled" />
          </div>
          <BaseInput label="WhatsApp — номер телефона" placeholder="+7900…" v-model="settings.integrations.whatsapp_widget_phone" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding-top: var(--a-space-6);
  padding-bottom: var(--a-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-5);
  max-width: 920px;
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
.back-link:hover {
  color: var(--a-text);
}

.settings-page__header {
  display: flex;
  align-items: center;
  gap: var(--a-space-4);
}
.settings-page__header h1 {
  font-size: var(--a-fs-2xl);
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
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--a-space-5);
  align-items: start;
}

.settings-card {
  padding: var(--a-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
}

.settings-card h2 {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  font-size: var(--a-fs-md);
}

.dns-result {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  border-radius: var(--a-radius-md);
  font-size: var(--a-fs-sm);
}
.dns-result.is-verified {
  background: var(--a-success-bg);
  color: var(--a-success);
}
.dns-result.is-unverified {
  background: var(--a-warning-bg);
  color: var(--a-warning);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.toggle-row__label {
  font-size: var(--a-fs-sm);
  font-weight: 600;
}

.toggle-row__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.toggle {
  width: 42px;
  height: 24px;
  border-radius: var(--a-radius-full);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--a-transition-base);
}
.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--a-text-muted);
  transition: transform var(--a-transition-base) var(--a-ease-spring), background var(--a-transition-base);
}
.toggle.is-on {
  background: var(--a-gradient-brand);
  border-color: transparent;
}
.toggle.is-on::after {
  transform: translateX(18px);
  background: #fff;
}
</style>
