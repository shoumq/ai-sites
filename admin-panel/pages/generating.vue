<script setup lang="ts">
import type { GenerationProgress, ProjectOut } from '~/types/api'

const TIMER_SECONDS = 60
const STAGE_LABELS = ['Тексты', 'Вёрстка', 'Изображения', 'Сборка']

const funnel = useFunnelStore()
const auth = useAuthStore()
const api = useApi()
const router = useRouter()

const brief = funnel.toBrief()

const status = ref<'connecting' | 'generating' | 'done' | 'error'>('connecting')
const progress = ref<GenerationProgress | null>(null)
const errorMessage = ref('')
const secondsLeft = ref(TIMER_SECONDS)

let socket: WebSocket | null = null
let timerHandle: ReturnType<typeof setInterval> | null = null

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle)
  timerHandle = null
}

function startTimer() {
  stopTimer()
  secondsLeft.value = TIMER_SECONDS
  timerHandle = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1
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
  if (!progress.value) return 5
  return (progress.value.step / progress.value.total_steps) * 100
})
</script>

<template>
  <div v-if="brief" class="page-shell">
    <div class="container generating">
      <span class="ai-badge"><Icon name="lucide:sparkles" /> ИИ-оркестратор работает</span>
      <h2>Создаём ваш сайт «{{ brief.brand_name }}»</h2>
      <div class="generating__timer">{{ secondsLeft }}с</div>

      <div class="progress-steps">
        <div
          v-for="(label, i) in STAGE_LABELS"
          :key="label"
          class="progress-step"
          :class="{ 'is-done': i + 1 < currentStep || status === 'done', 'is-current': i + 1 === currentStep && status !== 'done' }"
        >
          <span class="progress-step__dot">
            <Icon v-if="i + 1 < currentStep || status === 'done'" name="lucide:check" />
          </span>
          {{ label }}
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-track__fill" :style="{ width: `${progressPct}%` }" />
      </div>

      <p class="generating__message" :class="{ 'is-error': status === 'error' }">
        {{ status === 'error' ? errorMessage : (progress?.message ?? 'Подключаемся к ИИ-оркестратору…') }}
      </p>

      <BaseButton v-if="status === 'error'" variant="primary" icon="lucide:refresh-cw" @click="retry">
        Попробовать снова
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.generating {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--a-space-4);
  max-width: 560px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px var(--a-space-3);
  border-radius: var(--a-radius-full);
  background: var(--a-gradient-brand-soft);
  color: #fff;
  font-size: var(--a-fs-xs);
  font-weight: 600;
}

.generating h2 {
  font-size: var(--a-fs-2xl);
}

.generating__timer {
  font-size: var(--a-fs-3xl);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: var(--a-gradient-text);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-steps {
  display: flex;
  gap: var(--a-space-5);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--a-space-3);
}

.progress-step {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  font-weight: 600;
}

.progress-step__dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--a-border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  transition: background var(--a-transition-base), border-color var(--a-transition-base);
}

.progress-step.is-current {
  color: var(--a-text);
}
.progress-step.is-current .progress-step__dot {
  border-color: var(--a-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--a-accent) 25%, transparent);
  animation: step-pulse 1.4s ease-in-out infinite;
}

.progress-step.is-done {
  color: var(--a-success);
}
.progress-step.is-done .progress-step__dot {
  background: var(--a-success);
  border-color: var(--a-success);
  color: #06281c;
}

@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--a-accent) 25%, transparent); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--a-accent) 10%, transparent); }
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: var(--a-radius-full);
  background: var(--a-surface);
  overflow: hidden;
  margin-top: var(--a-space-2);
}

.progress-track__fill {
  height: 100%;
  background: var(--a-gradient-brand);
  border-radius: var(--a-radius-full);
  transition: width 0.6s var(--a-ease-out);
}

.generating__message {
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  min-height: 1.5em;
}
.generating__message.is-error {
  color: var(--a-error);
}
</style>
