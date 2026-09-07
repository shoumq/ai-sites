<script setup lang="ts">
import type { GenerationPreferences, SiteGoal, SiteType, StylePreset } from '~/types/api'
const funnel = useFunnelStore()
const step = ref(0)
const heading = ref<HTMLElement | null>(null)
const steps = ['Задача', 'Характер', 'О бизнесе', 'Структура']
const types: { value: SiteType; label: string; desc: string; icon: string }[] = [
  { value: 'landing', label: 'Лендинг', desc: 'Одна идея. Одна выразительная страница.', icon: 'lucide:panel-top' },
  { value: 'shop', label: 'Магазин', desc: 'Товары, каталог и оформление заказа.', icon: 'lucide:shopping-bag' },
  { value: 'multipage', label: 'Сайт компании', desc: 'Больше пространства для вашего бизнеса.', icon: 'lucide:panels-top-left' },
  { value: 'crm', label: 'Презентация сервиса', desc: 'Витрина продукта. Без личного кабинета.', icon: 'lucide:app-window' },
]
const directions: { value: GenerationPreferences['design_direction']; label: string; desc: string; color: string }[] = [
  { value: 'minimal', label: 'Чистый', desc: 'Воздух и внимание к деталям', color: '#607359' },
  { value: 'editorial', label: 'Редакционный', desc: 'Типографика и чёткий ритм', color: '#847462' },
  { value: 'bold', label: 'Выразительный', desc: 'Крупные акценты и энергия', color: '#7560b5' },
  { value: 'warm', label: 'Тёплый', desc: 'Мягкость и естественные оттенки', color: '#a56e4e' },
]
const goals: { value: SiteGoal; label: string }[] = [
  { value: 'sales', label: 'Получать продажи и заявки' }, { value: 'booking', label: 'Записывать клиентов' },
  { value: 'portfolio', label: 'Показывать работы' }, { value: 'info', label: 'Рассказывать о бизнесе' },
]
const features: { value: GenerationPreferences['features'][number]; label: string; icon: string }[] = [
  { value: 'catalog', label: 'Каталог', icon: 'lucide:layout-grid' }, { value: 'leads', label: 'Заявки', icon: 'lucide:send' },
  { value: 'gallery', label: 'Галерея', icon: 'lucide:images' }, { value: 'faq', label: 'Вопросы и ответы', icon: 'lucide:message-circle' },
  { value: 'pricing', label: 'Цены', icon: 'lucide:tag' },
]
const tones = [{ value: 'neutral', label: 'Спокойно и по делу' }, { value: 'friendly', label: 'Тепло и дружелюбно' }, { value: 'expert', label: 'Уверенно и экспертно' }, { value: 'bold', label: 'Смело и энергично' }]
const palette: { value: StylePreset; label: string; color: string }[] = [
  { value: 'business', label: 'Синий', color: '#2563eb' }, { value: 'warm', label: 'Терракота', color: '#c17a4e' },
  { value: 'techno', label: 'Фиолетовый', color: '#7c3aed' }, { value: 'custom', label: 'Свой цвет', color: '#596753' },
]
const currentDirection = computed(() => directions.find(d => d.value === funnel.preferences.design_direction))
const accent = computed(() => funnel.style === 'custom' ? funnel.customHex : palette.find(p => p.value === funnel.style)?.color || '#596753')
const canContinue = computed(() => step.value === 0 ? !!funnel.siteType : step.value === 1 ? !!funnel.style : funnel.isBriefComplete)
function chooseDirection(value: GenerationPreferences['design_direction']) {
  funnel.preferences.design_direction = value
  if (!funnel.style) funnel.style = 'business'
}
function toggleFeature(value: GenerationPreferences['features'][number]) {
  const selected = funnel.preferences.features
  funnel.preferences.features = selected.includes(value) ? selected.filter(f => f !== value) : [...selected, value]
}
async function goTo(value: number) {
  if (value === 1 && !funnel.style) funnel.style = 'business'
  step.value = value
  await nextTick()
  heading.value?.focus({ preventScroll: true })
}
function generate() { if (funnel.isBriefComplete) navigateTo('/generating') }
</script>

<template>
  <WorkspaceShell>
    <div class="studio">
      <header class="studio__top"><NuxtLink to="/">Мои сайты</NuxtLink><Icon name="lucide:chevron-right" /><span>Новый сайт</span><span class="studio__draft"><span /> Бриф сохраняется в этой вкладке</span></header>
      <div class="studio__intro"><span class="studio__eyebrow">ОТ ИДЕИ К САЙТУ</span><h1>Начнём с вашего видения.</h1><p>Бизнес, характер, детали. Всё остальное соберём вместе.</p></div>
      <nav class="studio__steps" aria-label="Этапы создания сайта"><button v-for="(label, i) in steps" :key="label" type="button" :class="{ current: step === i, done: step > i }" :aria-current="step === i ? 'step' : undefined" :disabled="i > step" @click="goTo(i)"><span><Icon v-if="step > i" name="lucide:check" /><template v-else>{{ String(i + 1).padStart(2, '0') }}</template></span>{{ label }}</button></nav>
      <div class="studio__grid">
        <section class="studio__form" aria-label="Настройки генерации">
          <div v-if="step === 0" class="studio__step">
            <h2 ref="heading" tabindex="-1">Что создаём?</h2><p class="studio__hint">Начните с формата. Он задаёт возможности сайта.</p>
            <div class="format-grid"><button v-for="type in types" :key="type.value" class="format-card" :class="{ selected: funnel.siteType === type.value }" type="button" :aria-pressed="funnel.siteType === type.value" @click="funnel.siteType = type.value"><Icon :name="type.icon" /><span class="selection-dot"><Icon v-if="funnel.siteType === type.value" name="lucide:check" /></span><strong>{{ type.label }}</strong><small>{{ type.desc }}</small></button></div>
            <BaseSelect label="Главная задача сайта" :model-value="funnel.goal" :options="goals" @update:model-value="funnel.goal = $event as SiteGoal" />
          </div>
          <div v-else-if="step === 1" class="studio__step">
            <h2 ref="heading" tabindex="-1">Какой у него характер?</h2><p class="studio__hint">Выберите близкое направление. Детали можно изменить позже.</p>
            <div class="direction-grid"><button v-for="d in directions" :key="d.value" type="button" class="direction-card" :class="{ selected: funnel.preferences.design_direction === d.value }" :aria-pressed="funnel.preferences.design_direction === d.value" @click="chooseDirection(d.value)"><span class="direction-art" :class="`art-${d.value}`" :style="{ '--direction-color': d.color }"><i>Aa</i><span /><span /></span><strong>{{ d.label }}</strong><small>{{ d.desc }}</small></button></div>
            <button class="studio__auto" :aria-pressed="funnel.preferences.design_direction === 'auto'" type="button" @click="chooseDirection('auto')"><Icon :name="funnel.preferences.design_direction === 'auto' ? 'lucide:circle-check' : 'lucide:sparkles'" /> Пусть ИИ выберет направление</button>
            <div class="studio__appearance"><div><span class="field-label">Акцентный цвет</span><div class="palette"><button v-for="p in palette" :key="p.value" type="button" :aria-label="p.label" :title="p.label" :aria-pressed="funnel.style === p.value" :style="{ background: p.color }" :class="{ selected: funnel.style === p.value }" @click="funnel.style = p.value"><Icon v-if="funnel.style === p.value" name="lucide:check" /></button><input v-if="funnel.style === 'custom'" v-model="funnel.customHex" type="color" aria-label="Цвет вашего бренда"></div></div><div><span class="field-label">Тема сайта</span><div class="mode-switch"><button v-for="mode in (['light', 'dark'] as const)" :key="mode" type="button" :aria-pressed="funnel.siteColorMode === mode" :class="{ selected: funnel.siteColorMode === mode }" @click="funnel.siteColorMode = mode"><Icon :name="mode === 'light' ? 'lucide:sun' : 'lucide:moon'" />{{ mode === 'light' ? 'Светлая' : 'Тёмная' }}</button></div></div></div>
          </div>
          <div v-else-if="step === 2" class="studio__step">
            <h2 ref="heading" tabindex="-1">Познакомимся с вашим бизнесом.</h2><p class="studio__hint">Эти детали помогут подобрать структуру и написать тексты для вашей аудитории.</p>
            <BaseInput v-model="funnel.brandName" label="Название бренда *" placeholder="Например, Forma" :maxlength="120" />
            <BaseInput v-model="funnel.preferences.industry" label="Сфера бизнеса" placeholder="Архитектура, кофейня, консалтинг — любая сфера" :maxlength="120" />
            <BaseTextarea v-model="funnel.description" label="Что вы предлагаете и чем отличаетесь? *" placeholder="Помогаем создавать дома, в которых хочется жить. Работаем с частными заказчиками…" :rows="3" :maxlength="500" show-count />
            <BaseInput v-model="funnel.preferences.audience" label="Для кого ваш сайт?" placeholder="Кто ваши клиенты и что для них важно" :maxlength="300" />
            <BaseSelect label="Как говорить с посетителем" :model-value="funnel.preferences.tone" :options="tones" @update:model-value="funnel.preferences.tone = $event as GenerationPreferences['tone']" />
            <div><span class="field-label">Что обязательно нужно на сайте</span><div class="feature-chips"><button v-for="feature in features" :key="feature.value" type="button" :class="{ selected: funnel.preferences.features.includes(feature.value) }" :aria-pressed="funnel.preferences.features.includes(feature.value)" @click="toggleFeature(feature.value)"><Icon :name="feature.icon" />{{ feature.label }}</button></div></div>
            <details class="studio__details"><summary>Дополнительные пожелания</summary><BaseTextarea v-model="funnel.extraRequirements" label="Что ещё учесть" placeholder="Например: каталог с фильтром, акцент на индивидуальном подходе" :rows="3" :maxlength="800" /><BaseTextarea v-model="funnel.preferences.avoid" label="Чего избегать в дизайне и текстах" placeholder="Например: неоновых цветов, канцелярита, неподтверждённых обещаний" :rows="2" :maxlength="400" /></details>
          </div>
          <div v-else class="studio__step"><h2 ref="heading" tabindex="-1">Последние штрихи.</h2><p class="studio__hint">Доверьте структуру ИИ или расставьте блоки сами. Ручной выбор важнее автоматического.</p><StructurePicker v-model="funnel.layout" :site-type="funnel.siteType ?? ''" /><p v-if="funnel.siteType === 'multipage'" class="studio__hint">Сейчас сайт компании включает главную, услуги, информацию о компании и контакты. Ручная структура применяется в пределах этих страниц.</p></div>
          <footer class="studio__actions"><BaseButton v-if="step > 0" variant="ghost" icon="lucide:arrow-left" @click="goTo(step - 1)">Назад</BaseButton><span v-else class="studio__step-count">Шаг 1 из 4</span><div><BaseButton v-if="step === 2" variant="ghost" :disabled="!funnel.isBriefComplete" @click="generate">Создать сразу</BaseButton><BaseButton v-if="step < 3" variant="primary" :disabled="!canContinue" @click="goTo(step + 1)">Продолжить <span aria-hidden="true">→</span></BaseButton><BaseButton v-else variant="primary" icon="lucide:sparkles" :disabled="!funnel.isBriefComplete" @click="generate">Создать сайт</BaseButton></div></footer>
        </section>
        <aside class="studio__preview"><div class="studio__preview-label"><span>ВАШЕ НАПРАВЛЕНИЕ</span><Icon name="lucide:sliders-horizontal" /></div><DesignPreview :direction="funnel.preferences.design_direction" :brand="funnel.brandName" :dark="funnel.siteColorMode === 'dark'" :accent="accent" /><div class="studio__preview-caption"><span>{{ currentDirection?.label || 'Свобода для вашей идеи' }}</span><span>Эскиз оформления</span></div><p class="studio__preview-note">Пример визуального настроения. Настоящие тексты, изображения и блоки появятся после генерации.</p><div class="studio__brief"><span class="studio__eyebrow">В ОСНОВЕ ВАШЕГО САЙТА</span><dl><div><dt>Формат</dt><dd>{{ types.find(t => t.value === funnel.siteType)?.label || 'Выберите формат' }}</dd></div><div><dt>Цель</dt><dd>{{ goals.find(g => g.value === funnel.goal)?.label }}</dd></div><div v-if="funnel.preferences.industry"><dt>Бизнес</dt><dd>{{ funnel.preferences.industry }}</dd></div><div><dt>Структура</dt><dd>{{ funnel.layout.mode === 'manual' ? 'Ваш выбор блоков' : 'Подберёт ИИ' }}</dd></div></dl><div class="studio__editable"><Icon name="lucide:circle-check" /><span>Каждый блок можно будет отредактировать.</span></div></div></aside>
      </div>
    </div>
  </WorkspaceShell>
</template>

<style scoped>
.studio { max-width: 1400px; margin: auto; padding: 0 48px 50px; }
.studio__top { height: 76px; display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--a-text-muted); border-bottom: 1px solid var(--a-border); }
.studio__top a { text-decoration: none; }
.studio__draft { margin-left: auto; display: flex; align-items: center; gap: 7px; font-size: 10px; }
.studio__draft > span { width: 5px; height: 5px; border-radius: 50%; background: #729777; }
.studio__intro { padding: 44px 0 34px; }
.studio__eyebrow { font-size: 9px; letter-spacing: .16em; font-weight: 600; color: var(--a-text-muted); }
.studio__intro h1 { font-size: clamp(28px, 3.2vw, 44px); font-weight: 600; letter-spacing: -.05em; margin: 13px 0; }
.studio__intro p { font-size: 13px; color: var(--a-text-muted); }
.studio__steps { display: flex; gap: 32px; margin-bottom: 32px; border-bottom: 1px solid var(--a-border); }
.studio__steps button { position: relative; display: flex; align-items: center; gap: 9px; padding: 0 0 17px; border: 0; background: none; color: var(--a-text-muted); font-size: 12px; cursor: pointer; }
.studio__steps button > span { display: grid; place-items: center; width: 23px; height: 23px; border-radius: 50%; background: var(--a-surface); font-size: 9px; }
.studio__steps button.current { color: var(--a-text); font-weight: 600; }
.studio__steps button.current::after { content: ''; position: absolute; bottom: -1px; height: 2px; background: var(--a-text); width: 100%; }
.studio__steps button.current > span { background: var(--a-text); color: var(--a-bg); }
.studio__steps button:disabled { cursor: default; }
.studio__steps button.done > span { color: #50825a; }
.studio__grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 40px; align-items: start; }
.studio__form { min-width: 0; background: var(--a-surface-solid); border: 1px solid var(--a-border); border-radius: 18px; padding: 28px; box-shadow: var(--a-shadow-sm); }
.studio__step { display: flex; flex-direction: column; gap: 20px; }
.studio__step h2 { font-size: 21px; font-weight: 600; letter-spacing: -.035em; }
.studio__hint { font-size: 12px; color: var(--a-text-muted); line-height: 1.65; margin-top: -10px; }
.format-grid, .direction-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.format-card, .direction-card { position: relative; color: var(--a-text); border: 1px solid var(--a-border); background: transparent; border-radius: 12px; padding: 20px 16px; text-align: left; cursor: pointer; transition: background 160ms ease, border-color 160ms ease, transform 120ms ease; }
.format-card:hover, .direction-card:hover { background: var(--a-surface); }
.format-card:active, .direction-card:active, .feature-chips button:active { transform: scale(.98); }
.format-card.selected, .direction-card.selected { border-color: var(--a-accent); box-shadow: 0 0 0 1px var(--a-accent); background: color-mix(in srgb, var(--a-accent) 4%, transparent); }
.format-card > .iconify { font-size: 23px; margin-bottom: 24px; }
.format-card strong, .direction-card strong { display: block; font-size: 12px; font-weight: 600; }
.format-card small, .direction-card small { display: block; font-size: 10px; color: var(--a-text-muted); line-height: 1.6; margin-top: 6px; }
.selection-dot { position: absolute; right: 13px; top: 14px; border: 1px solid var(--a-border-strong); border-radius: 50%; width: 15px; height: 15px; display: grid; place-items: center; font-size: 10px; }
.selected .selection-dot { background: var(--a-accent); color: white; border-color: transparent; }
.direction-card { padding: 8px 8px 14px; }
.direction-card strong, .direction-card small { padding-inline: 5px; }
.direction-art { display: flex; flex-direction: column; background: #f1f2ed; color: var(--direction-color); height: 83px; border-radius: 7px; margin-bottom: 12px; padding: 11px 15px; gap: 4px; }
.direction-art i { font-size: 27px; font-weight: 500; font-style: normal; line-height: 1.1; letter-spacing: -.06em; }
.direction-art > span { width: 70%; height: 3px; background: currentColor; opacity: .25; }
.direction-art > span:last-child { width: 45%; }
.art-editorial { background: #ebe8e1; border-radius: 0; font-family: Georgia, serif; }
.art-bold { background: #e8e1fb; }
.art-bold i { font-weight: 850; }
.art-warm { background: #f3e7db; border-radius: 20px 20px 7px 7px; }
.studio__auto { display: flex; align-items: center; justify-content: center; gap: 8px; border: 0; background: none; color: var(--a-text-muted); font-size: 11px; cursor: pointer; padding: 4px; }
.studio__auto[aria-pressed='true'] { color: var(--a-accent); }
.studio__appearance { display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; border-top: 1px solid var(--a-border); padding-top: 20px; }
.palette, .mode-switch { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.palette button { display: grid; place-items: center; height: 26px; width: 26px; color: white; border: 3px solid var(--a-surface-solid); outline: 1px solid transparent; border-radius: 50%; cursor: pointer; font-size: 11px; }
.palette button.selected { outline-color: var(--a-text-muted); }
.palette input { width: 28px; height: 28px; padding: 0; border: 0; background: transparent; }
.mode-switch { padding: 3px; background: var(--a-surface); border-radius: 8px; gap: 3px; }
.mode-switch button { display: flex; align-items: center; gap: 5px; border: 0; border-radius: 6px; background: transparent; color: var(--a-text-muted); font-size: 10px; padding: 6px 8px; cursor: pointer; }
.mode-switch button.selected { background: var(--a-surface-solid); color: var(--a-text); box-shadow: var(--a-shadow-sm); }
.feature-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.feature-chips button { display: flex; gap: 6px; align-items: center; background: transparent; color: var(--a-text-muted); padding: 9px 12px; border: 1px solid var(--a-border); border-radius: 20px; font-size: 11px; cursor: pointer; }
.feature-chips button.selected { border-color: var(--a-accent); color: var(--a-accent); background: color-mix(in srgb, var(--a-accent) 5%, transparent); }
.studio__details { font-size: 12px; color: var(--a-text-muted); }
.studio__details summary { cursor: pointer; padding-block: 8px; }
.studio__details > :not(summary) { margin-top: 16px; }
.studio__actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--a-border); }
.studio__actions > div { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
.studio__actions :deep(.base-btn) { font-size: 11px; padding-inline: 16px; height: 38px; }
.studio__step-count { font-size: 10px; color: var(--a-text-muted); }
.studio__preview { position: sticky; top: 30px; padding-top: 4px; }
.studio__preview-label { display: flex; justify-content: space-between; align-items: center; color: var(--a-text-muted); font-size: 9px; letter-spacing: .14em; margin-bottom: 18px; }
.studio__preview-caption { display: flex; justify-content: space-between; margin-top: 20px; gap: 12px; font-size: 11px; }
.studio__preview-caption > span:last-child { color: var(--a-text-muted); font-size: 10px; }
.studio__preview-note { font-size: 10px; line-height: 1.7; color: var(--a-text-muted); margin-top: 12px; max-width: 320px; }
.studio__brief { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--a-border); }
.studio__brief dl { margin: 18px 0; font-size: 11px; }
.studio__brief dl > div { display: flex; justify-content: space-between; gap: 20px; margin-block: 12px; }
.studio__brief dt { color: var(--a-text-muted); }
.studio__brief dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
.studio__editable { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--a-text-muted); }
.studio__editable .iconify { color: #65866a; }
@media (max-width: 1200px) { .studio { padding-inline: 28px; } .studio__grid { gap: 24px; } .studio__form { padding: 22px; } }
@media (max-width: 1050px) { .studio__grid { grid-template-columns: 1fr; } .studio__preview { position: static; max-width: 580px; width: 100%; } .studio__draft { display: none; } }
@media (max-width: 600px) { .studio { padding-inline: 20px; } .studio__intro { padding-top: 30px; } .studio__steps { gap: 0; justify-content: space-between; } .studio__steps button { font-size: 10px; gap: 5px; } .studio__steps button > span { width: 20px; height: 20px; } .studio__form { padding: 18px; } .format-card { padding: 16px 12px; } .studio__actions { align-items: flex-start; } }
</style>
