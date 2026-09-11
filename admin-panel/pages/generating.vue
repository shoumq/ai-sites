<script setup lang="ts">
import type { GenerationProgress, ProjectOut } from '~/types/api'

const STAGE_LABELS = ['Структура', 'Тексты', 'Изображения', 'Сборка']
const STAGE_DETAILS = ['Подбираем блоки под задачу бизнеса', 'Формулируем предложение и детали', 'Создаём визуальный материал', 'Готовим сайт к редактированию']

const funnel = useFunnelStore()
const auth = useAuthStore()
const api = useApi()
const router = useRouter()

const brief = funnel.toBrief()

const status = ref<'connecting' | 'generating' | 'done' | 'error'>('connecting')
const progress = ref<GenerationProgress | null>(null)
const errorMessage = ref('')
const elapsed = ref(0)

let socket: WebSocket | null = null
let timerHandle: ReturnType<typeof setInterval> | null = null

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle)
  timerHandle = null
}

function startTimer() {
  stopTimer()
  elapsed.value = 0
  timerHandle = setInterval(() => {
    elapsed.value += 1
  }, 1000)
}

function connect() {
  if (!brief || !auth.token) return
  status.value = 'connecting'
  progress.value = null
  errorMessage.value = ''
  startTimer()

  socket = new WebSocket(`${api.wsBase()}/ws/generate?token=${encodeURIComponent(auth.token)}`)

  socket.onopen = () => {
    status.value = 'generating'
    socket?.send(JSON.stringify(brief))
  }

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data) as
      | { type: 'progress' } & GenerationProgress
      | { type: 'done'; project: ProjectOut }
      | { type: 'error'; message: string }

    if (payload.type === 'progress') {
      progress.value = payload
    } else if (payload.type === 'done') {
      status.value = 'done'
      stopTimer()
      funnel.reset()
      router.replace(`/editor/${payload.project.id}`)
    } else if (payload.type === 'error') {
      status.value = 'error'
      errorMessage.value = payload.message ?? 'Ошибка генерации'
      stopTimer()
    }
  }

  socket.onclose = () => {
    if (status.value === 'connecting' || status.value === 'generating') {
      status.value = 'error'
      errorMessage.value = 'Соединение прервалось. Проверьте «Мои сайты» перед повторным запуском.'
      stopTimer()
    }
  }

  socket.onerror = () => {
    if (status.value !== 'done') {
      status.value = 'error'
      errorMessage.value = 'Не удалось подключиться к серверу генерации.'
      stopTimer()
    }
  }
}

function disconnect() {
  stopTimer()
  if (socket) socket.onclose = null
  socket?.close()
  socket = null
}

onMounted(() => {
  if (!brief) {
    router.replace('/new')
    return
  }
  connect()
})

onUnmounted(disconnect)

function retry() {
  disconnect()
  connect()
}

const currentStep = computed(() => progress.value?.step ?? 0)
const progressPct = computed(() => {
  if (status.value === 'done') return 100
  if (!progress.value) return 0
  return Math.min(95, Math.max(0, (progress.value.step - 1) / progress.value.total_steps * 100))
})
</script>

<template>
  <WorkspaceShell>
    <main v-if="brief" class="generation">
      <NuxtLink to="/" class="generation__back"><Icon name="lucide:arrow-left" /> Мои сайты</NuxtLink>
      <div class="generation__layout">
        <section class="generation__status">
          <span class="generation__eyebrow">СТУДИЯ / СОЗДАНИЕ САЙТА</span>
          <h1>{{ status === 'error' ? 'Нужна ещё одна попытка.' : 'Ваша идея обретает форму.' }}</h1>
          <p class="generation__intro">{{ brief.brand_name }} <span>·</span> {{ status === 'error' ? 'Бриф сохранён' : 'Создаём первую версию' }}</p>
          <ol class="generation__stages" aria-label="Этапы генерации">
            <li v-for="(label, i) in STAGE_LABELS" :key="label" :class="{ done: i + 1 < currentStep || status === 'done', active: i + 1 === currentStep && status !== 'error' }">
              <span class="generation__number"><Icon v-if="i + 1 < currentStep || status === 'done'" name="lucide:check" /><template v-else>{{ String(i + 1).padStart(2, '0') }}</template></span>
              <div><strong>{{ label }}</strong><p>{{ STAGE_DETAILS[i] }}</p></div>
              <Icon v-if="i + 1 === currentStep && status === 'generating'" class="generation__spinner" name="lucide:loader-circle" />
            </li>
          </ol>
          <div class="generation__track" role="progressbar" aria-label="Генерация сайта" :aria-valuenow="progressPct" :aria-valuemin="0" :aria-valuemax="100"><span :style="{ width: `${progressPct}%` }" /></div>
          <div class="generation__meta"><span>Прошло {{ Math.floor(elapsed / 60) }}:{{ String(elapsed % 60).padStart(2, '0') }}</span><span>4 этапа до редактора</span></div>
          <p class="generation__message" :class="{ error: status === 'error' }" role="status">{{ status === 'error' ? errorMessage : (progress?.message ?? 'Подключаемся к серверу…') }}</p>
          <BaseButton v-if="status === 'error'" icon="lucide:refresh-cw" @click="retry">Попробовать снова</BaseButton>
        </section>
        <aside class="generation__preview">
          <div class="generation__preview-label"><span>ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ</span><Icon name="lucide:layout-template" /></div>
          <DesignPreview :brand="brief.brand_name" :direction="brief.preferences.design_direction" :dark="brief.site_color_mode === 'dark'" :accent="brief.custom_hex_color || '#38664b'" />
          <div class="generation__note"><Icon name="lucide:mouse-pointer-2" /><div><strong>Дальше — ваши правки.</strong><p>Тексты, фотографии, порядок блоков и оформление можно изменить в редакторе.</p></div></div>
          <p class="generation__disclaimer">Эскиз направления. Готовый сайт появится после сборки.</p>
        </aside>
      </div>
    </main>
  </WorkspaceShell>
</template>

<style scoped>
.generation { max-width: 1360px; margin: auto; padding: 32px 48px 60px; }
.generation__back { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; text-decoration: none; color: var(--a-text-muted); min-height: 44px; }
.generation__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; align-items: center; min-height: calc(100svh - 160px); }
.generation__eyebrow, .generation__preview-label { font-size: 10px; letter-spacing: .13em; color: var(--a-text-muted); }
.generation h1 { font-size: clamp(32px, 3.5vw, 52px); letter-spacing: -.055em; font-weight: 600; margin-top: 22px; }
.generation__intro { margin-top: 20px; color: var(--a-text-muted); font-size: 14px; overflow-wrap: anywhere; }
.generation__intro span { margin-inline: 8px; }
.generation__stages { margin-block: 36px 28px; }
.generation__stages li { display: flex; gap: 16px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--a-border); color: var(--a-text-muted); }
.generation__number { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border: 1px solid var(--a-border); border-radius: 10px; font-size: 12px; font-variant-numeric: tabular-nums; }
.generation__stages strong { font-size: 14px; font-weight: 600; }
.generation__stages p { font-size: 12px; margin-top: 4px; }
.generation__stages .active { color: var(--a-text); }
.active .generation__number { color: white; background: var(--a-accent); border-color: var(--a-accent); }
.done .generation__number { color: var(--a-success); background: var(--a-success-bg); border-color: transparent; }
.generation__spinner { margin-left: auto; flex-shrink: 0; animation: rotate 1.5s linear infinite; }
@keyframes rotate { to { transform: rotate(360deg); } }
.generation__track { height: 3px; background: var(--a-border); overflow: hidden; }
.generation__track span { display: block; height: 100%; background: var(--a-accent); transition: width .4s ease; }
.generation__meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; font-size: 11px; color: var(--a-text-muted); font-variant-numeric: tabular-nums; }
.generation__message { margin-block: 22px; font-size: 13px; color: var(--a-text-muted); }
.generation__message.error { color: var(--a-error); }
.generation__preview { min-width: 0; padding: 24px; border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-surface); }
.generation__preview-label { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
.generation__note { display: flex; gap: 12px; margin-top: 30px; }
.generation__note > .iconify { flex-shrink: 0; margin-top: 3px; }
.generation__note strong { font-size: 14px; font-weight: 500; }
.generation__note p, .generation__disclaimer { margin-top: 8px; font-size: 12px; line-height: 1.7; color: var(--a-text-muted); }
.generation__disclaimer { margin-top: 24px; border-top: 1px solid var(--a-border); padding-top: 18px; }
@media (max-width: 1150px) { .generation { padding-inline: 28px; } .generation__layout { gap: 28px; } }
@media (max-width: 1000px) { .generation__layout { grid-template-columns: minmax(0, 1fr); padding-top: 24px; } .generation__preview { max-width: 620px; } }
@media (max-width: 600px) { .generation { padding: 16px 20px 32px; } .generation__preview { padding: 16px; } }
</style>
