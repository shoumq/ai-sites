<script setup lang="ts">
import type { SiteGoal, SiteType, StylePreset } from '~/types/api'

const funnel = useFunnelStore()
const router = useRouter()

const step = ref(0)

const SITE_TYPES: { value: SiteType; label: string; desc: string; icon: string }[] = [
  { value: 'landing', label: 'Лендинг', desc: '1 страница, форма захвата', icon: 'lucide:rocket' },
  { value: 'shop', label: 'Интернет-магазин', desc: 'Каталог + корзина + оплата', icon: 'lucide:shopping-bag' },
  { value: 'multipage', label: 'Многостраничник', desc: 'Главная, услуги, контакты, о нас', icon: 'lucide:files' },
  { value: 'crm', label: 'CRM-портал', desc: 'Личный кабинет с документами и чатом', icon: 'lucide:layout-dashboard' },
]

const STYLES: { value: StylePreset; label: string; desc: string; swatch: string }[] = [
  { value: 'business', label: 'Деловой', desc: 'Синий/серый, Sans-Serif', swatch: '#2563EB' },
  { value: 'warm', label: 'Тёплый', desc: 'Бежевый/зелёный — кафе, beauty', swatch: '#C17A4E' },
  { value: 'techno', label: 'Техно', desc: 'Тёмная тема с неоном — для IT', swatch: '#7C3AED' },
  { value: 'custom', label: 'Свой стиль', desc: 'Выберите HEX-цвет бренда', swatch: '#111827' },
]

const GOALS: { value: SiteGoal; label: string }[] = [
  { value: 'sales', label: 'Продажи' },
  { value: 'booking', label: 'Запись клиентов' },
  { value: 'portfolio', label: 'Портфолио' },
  { value: 'info', label: 'Информирование' },
]

// Экран с брифом (после него генерацию уже можно запускать) и последний экран
// воронки — необязательный выбор структуры.
const BRIEF_STEP = 2
const LAST_STEP = 3

const canGoNext = computed(
  () => (step.value === 0 && !!funnel.siteType) || (step.value === 1 && !!funnel.style) || step.value >= 2,
)

function back() {
  if (step.value === 0) router.push('/')
  else step.value -= 1
}

function next() {
  if (step.value < LAST_STEP && canGoNext.value) step.value += 1
}

function generate() {
  if (!funnel.isBriefComplete) return
  router.push('/generating')
}
</script>

<template>
  <div class="page-shell">
    <div class="container funnel">
      <div class="funnel__dots">
        <span v-for="i in 4" :key="i" class="funnel__dot" :class="{ 'is-active': i - 1 <= step }" />
      </div>

      <Transition name="funnel-step" mode="out-in">
        <div v-if="step === 0" key="0" class="funnel__step">
          <h2>Какой сайт создаём?</h2>
          <p class="funnel__subtitle">Выберите тип — от него зависит структура и набор блоков.</p>
          <div class="choice-grid">
            <button
              v-for="t in SITE_TYPES"
              :key="t.value"
              type="button"
              class="choice-card"
              :class="{ 'is-selected': funnel.siteType === t.value }"
              @click="funnel.siteType = t.value"
            >
              <Icon :name="t.icon" class="choice-card__icon" />
              <h3>{{ t.label }}</h3>
              <p>{{ t.desc }}</p>
            </button>
          </div>
        </div>

        <div v-else-if="step === 1" key="1" class="funnel__step">
          <h2>Выберите настроение</h2>
          <p class="funnel__subtitle">Визуальный пресет: цвета и шрифт сайта.</p>
          <div class="choice-grid">
            <button
              v-for="s in STYLES"
              :key="s.value"
              type="button"
              class="choice-card"
              :class="{ 'is-selected': funnel.style === s.value }"
              @click="funnel.style = s.value"
            >
              <span class="choice-card__swatch" :style="{ background: s.swatch }" />
              <h3>{{ s.label }}</h3>
              <p>{{ s.desc }}</p>
            </button>
          </div>
          <div v-if="funnel.style === 'custom'" class="funnel__custom-color">
            <label class="field-label">HEX-цвет бренда</label>
            <input v-model="funnel.customHex" type="color" class="color-input">
          </div>
        </div>

        <div v-else-if="step === 2" key="2" class="funnel__step">
          <h2>Расскажите о бренде</h2>
          <p class="funnel__subtitle">Это и есть промпт для ИИ — чем точнее опишете, тем точнее будут тексты сайта.</p>

          <div class="prompt-card glass-card">
            <span class="ai-badge"><Icon name="lucide:sparkles" /> Отсюда начинается генерация</span>
            <BaseInput
              v-model="funnel.brandName"
              label="Название компании / бренда"
              placeholder="Например, «Кафе Ромашка»"
              :maxlength="120"
            />
            <BaseTextarea
              v-model="funnel.description"
              label="Чем занимаетесь?"
              placeholder="Например: уютная кофейня в центре города с домашней выпечкой и авторскими десертами"
              :rows="4"
              :maxlength="500"
              show-count
            />
            <BaseTextarea
              v-model="funnel.extraRequirements"
              label="Какие блоки/функции нужны? (необязательно)"
              placeholder="Например: нужен фильтр по категориям товаров, блок FAQ, галерея работ"
              :rows="3"
              :maxlength="800"
              show-count
            />
          </div>

          <BaseSelect
            label="Какая главная цель сайта?"
            :model-value="funnel.goal"
            :options="GOALS.map((g) => ({ value: g.value, label: g.label }))"
            @update:model-value="funnel.goal = $event as SiteGoal"
          />
        </div>

        <div v-else key="3" class="funnel__step">
          <h2>Структура сайта</h2>
          <p class="funnel__subtitle">
            Необязательный шаг. Можно оставить всё на ИИ, а можно собрать страницу самому — вплоть до варианта
            вёрстки каждого блока.
          </p>
          <StructurePicker v-model="funnel.layout" :site-type="funnel.siteType ?? ''" />
        </div>
      </Transition>

      <div class="funnel__nav">
        <BaseButton variant="ghost" icon="lucide:arrow-left" @click="back">Назад</BaseButton>

        <div class="funnel__nav-right">
          <!-- Экран «Структура» необязательный, поэтому с экрана брифа должен
               остаться прямой путь к генерации — как было до его появления.
               Иначе пользователь, заполнивший бриф, упирается в «Далее» и не
               понимает, где кнопка «Сгенерировать». -->
          <BaseButton
            v-if="step === BRIEF_STEP"
            variant="ghost"
            icon="lucide:sparkles"
            :disabled="!funnel.isBriefComplete"
            @click="generate"
          >
            Сгенерировать сразу
          </BaseButton>
          <BaseButton v-if="step < LAST_STEP" variant="primary" :disabled="!canGoNext" @click="next">Далее</BaseButton>
          <BaseButton v-else variant="primary" icon="lucide:sparkles" :disabled="!funnel.isBriefComplete" @click="generate">
            Сгенерировать
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.funnel {
  max-width: 880px;
  padding-top: var(--a-space-7);
  padding-bottom: var(--a-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-6);
}

.funnel__dots {
  display: flex;
  gap: var(--a-space-2);
  justify-content: center;
}

.funnel__dot {
  width: 32px;
  height: 5px;
  border-radius: var(--a-radius-full);
  background: var(--a-surface);
  transition: background var(--a-transition-base);
}
.funnel__dot.is-active {
  background: var(--a-gradient-brand);
}

.funnel__step h2 {
  font-size: var(--a-fs-2xl);
  text-align: center;
}

.funnel__subtitle {
  text-align: center;
  color: var(--a-text-muted);
  font-size: var(--a-fs-sm);
  margin-top: var(--a-space-2);
  margin-bottom: var(--a-space-6);
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--a-space-4);
}

.choice-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--a-space-2);
  padding: var(--a-space-5);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-lg);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--a-transition-fast), transform var(--a-transition-fast), background var(--a-transition-fast);
}
.choice-card:hover {
  transform: translateY(-2px);
  border-color: var(--a-border-strong);
  background: var(--a-surface-hover);
}
.choice-card.is-selected {
  border-color: var(--a-accent);
  background: color-mix(in srgb, var(--a-accent) 10%, var(--a-surface));
  box-shadow: 0 0 0 1px var(--a-accent);
}

.choice-card__icon {
  font-size: 1.5rem;
  color: var(--a-accent);
}

.choice-card h3 {
  font-size: var(--a-fs-md);
}
.choice-card p {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.choice-card__swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--a-radius-full);
  border: 2px solid var(--a-border-strong);
}

.funnel__custom-color {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
  margin-top: var(--a-space-4);
}

.field-label {
  font-size: var(--a-fs-xs);
  font-weight: 600;
  color: var(--a-text-muted);
}

.color-input {
  width: 64px;
  height: 42px;
  padding: 4px;
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  cursor: pointer;
}

.prompt-card {
  padding: var(--a-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
  margin-bottom: var(--a-space-5);
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px var(--a-space-3);
  border-radius: var(--a-radius-full);
  background: var(--a-gradient-brand-soft);
  color: #fff;
  font-size: var(--a-fs-xs);
  font-weight: 600;
}

.funnel__nav {
  display: flex;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.funnel__nav-right {
  display: flex;
  gap: var(--a-space-3);
}

.funnel-step-enter-active,
.funnel-step-leave-active {
  transition: transform var(--a-transition-base) var(--a-ease-out), opacity var(--a-transition-base);
}
.funnel-step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.funnel-step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
