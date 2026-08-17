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

const CHECKOUT_MODES = [
  { value: 'order', label: 'Заявка на заказ (менеджер перезвонит)' },
  { value: 'payment', label: 'Заявка + онлайн-оплата через ЮKassa' },
]

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
          <BaseInput label="Картинка для соцсетей (og:image)" placeholder="https://…/og.png" v-model="settings.seo.og_image" />
          <BaseInput label="Favicon" placeholder="https://…/favicon.png" v-model="settings.seo.favicon_url" />
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Закрыть от индексации</div>
              <div class="toggle-row__hint">Добавит meta robots noindex — для черновиков и тестовых сборок</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.seo.noindex }" @click="settings.seo.noindex = !settings.seo.noindex" />
          </div>
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
          <BaseInput label="Юридическое название" placeholder="ООО «Ромашка»" v-model="settings.legal.company_legal_name" />
          <BaseInput label="Ссылка на политику конфиденциальности" placeholder="https://…/privacy" v-model="settings.legal.privacy_policy_url" />
          <BaseInput label="Текст согласия под формами" v-model="settings.legal.consent_text" />
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
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Кнопка WhatsApp на сайте</div>
              <div class="toggle-row__hint">Плавающая кнопка в правом нижнем углу</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.leads.whatsapp_button }" @click="settings.leads.whatsapp_button = !settings.leads.whatsapp_button" />
          </div>
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 240 } }">
          <h2><Icon name="lucide:bar-chart-3" /> Аналитика и вебмастер</h2>
          <p class="card-hint">Всё отсюда попадает в &lt;head&gt; опубликованного сайта официальными сниппетами сервисов.</p>
          <BaseInput label="Яндекс.Метрика — номер счётчика" placeholder="109993128" v-model="settings.analytics.yandex_metrika_id" />
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Вебвизор</div>
              <div class="toggle-row__hint">Запись действий посетителей в Метрике</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.analytics.metrika_webvisor }" @click="settings.analytics.metrika_webvisor = !settings.analytics.metrika_webvisor" />
          </div>
          <BaseInput
            label="Яндекс.Вебмастер — код подтверждения"
            placeholder="fa1304247066b37e"
            v-model="settings.analytics.yandex_verification"
          />
          <BaseInput label="Google Analytics 4" placeholder="G-XXXXXXXXXX" v-model="settings.analytics.google_analytics_id" />
          <BaseInput label="Google Tag Manager" placeholder="GTM-XXXXXXX" v-model="settings.analytics.google_tag_manager_id" />
          <BaseInput
            label="Google Search Console — код подтверждения"
            placeholder="google-site-verification"
            v-model="settings.analytics.google_verification"
          />
          <BaseInput label="VK Пиксель" placeholder="VK-RTRG-000000-XXXXX" v-model="settings.analytics.vk_pixel_id" />
          <BaseInput label="top@Mail.ru / VK Ads — счётчик" placeholder="3300000" v-model="settings.analytics.mailru_counter_id" />
          <BaseTextarea
            label="Свой код в &lt;head&gt;"
            placeholder="<script>…</script> — для счётчика, которого нет в списке выше"
            :rows="3"
            v-model="settings.analytics.custom_head_html"
          />
          <BaseTextarea
            label="Свой код перед &lt;/body&gt;"
            :rows="3"
            v-model="settings.analytics.custom_body_html"
          />
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 300 } }">
          <h2><Icon name="lucide:shopping-cart" /> Корзина и заказы</h2>
          <p class="card-hint">
            Корзина появляется на сайте, только если хотя бы у одного блока каталога выбрано действие «В корзину».
          </p>
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Корзина включена</div>
              <div class="toggle-row__hint">Выключите, чтобы убрать корзину со всего сайта</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.commerce.cart_enabled }" @click="settings.commerce.cart_enabled = !settings.commerce.cart_enabled" />
          </div>
          <BaseInput label="Валюта" placeholder="₽" v-model="settings.commerce.currency" />
          <BaseSelect
            label="Оформление заказа"
            :model-value="settings.commerce.checkout_mode"
            :options="CHECKOUT_MODES"
            @update:model-value="settings.commerce.checkout_mode = $event as 'order' | 'payment'"
          />
          <template v-if="settings.commerce.checkout_mode === 'payment'">
            <BaseInput label="ЮKassa — shopId магазина" v-model="settings.commerce.yookassa_shop_id" />
            <BaseInput label="ЮKassa — секретный ключ" v-model="settings.commerce.yookassa_secret_key" />
            <p class="card-hint">
              Ключ хранится только на сервере и в статический сайт не попадает: платёж создаёт бэкенд, а сумму
              считает по ценам из схемы сайта.
            </p>
          </template>
          <BaseInput
            label="Минимальная сумма заказа"
            type="number"
            :model-value="String(settings.commerce.min_order_total)"
            @update:model-value="settings.commerce.min_order_total = Number($event) || 0"
          />
          <BaseTextarea label="Текст после оформления заказа" :rows="2" v-model="settings.commerce.success_text" />
        </section>

        <section class="settings-card glass-card" v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { duration: 320, delay: 360 } }">
          <h2><Icon name="lucide:inbox" /> Куда уходят заявки</h2>
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">Сохранять в платформе</div>
              <div class="toggle-row__hint">Заявки и заказы видны на вкладке «Заявки»</div>
            </div>
            <button type="button" class="toggle" :class="{ 'is-on': settings.leads.store_in_platform }" @click="settings.leads.store_in_platform = !settings.leads.store_in_platform" />
          </div>
          <BaseInput label="Вебхук (POST с JSON заявки)" placeholder="https://…/hook" v-model="settings.leads.webhook_url" />
          <BaseInput label="Telegram — токен бота" placeholder="123456:AA…" v-model="settings.leads.telegram_bot_token" />
          <BaseInput label="Telegram — chat_id" placeholder="-1001234567890" v-model="settings.leads.telegram_chat_id" />
          <p class="card-hint">
            Рассылку делает сервер, а не сайт: токен бота и адрес вебхука в исходники страницы не попадают.
          </p>
          <NuxtLink :to="`/editor/${projectId}/leads`" class="card-link">
            <Icon name="lucide:list" /> Открыть список заявок
          </NuxtLink>
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

.card-hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  line-height: 1.5;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  color: var(--a-accent);
  text-decoration: none;
  font-size: var(--a-fs-sm);
  font-weight: 600;
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
