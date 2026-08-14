<script setup lang="ts">
/**
 * Короткий (~2.8с) product-intro сплэш, показывается один раз за вкладку
 * браузера при первой загрузке админки. Три акта по таймлайну на
 * setTimeout: 1) вордмарк "AI Sites" проявляется буква за буквой поверх
 * дрейфующих градиентных блобов; 2) стилизованный мокап браузера — секции
 * сайта (header/hero/grid/footer) укладываются друг на друга со стаггером,
 * метафора "собираем сайт из блоков", на фоне проплывает градиентная волна;
 * на стыке 1→2 через сцену по дуге пролетает градиентный аватар-плейсхолдер;
 * 3) всё растворяется/схлопывается, под сплэшем уже смонтировано реальное
 * приложение (оно грузится параллельно, сплэш его просто визуально
 * перекрывает).
 *
 * Пропуск в любой момент: клик или Escape/Enter/Space — короткое ~180мс
 * доигрывание fade-out вместо резкого обрыва. Показ только один раз за
 * сессию вкладки (sessionStorage), проверяем в onMounted — SPA (ssr:false),
 * так что sessionStorage доступен сразу, без гидратационных нюансов.
 *
 * prefers-reduced-motion: глобальный global.css уже зануляет
 * animation/transition-duration через !important для всего приложения —
 * визуальные эффекты сами схлопнутся. Но JS-таймлайн (setTimeout) от этого
 * не укорачивается, поэтому здесь отдельно проверяем матч-медиа и просто
 * ведём пользователя по тем же фазам гораздо быстрее, без долгого статичного
 * "зависания" на пустом экране.
 */

const STORAGE_KEY = 'ai-sites:intro-seen'
const LOGO_WORD = 'AI Sites'

type Phase = 'logo' | 'blocks'

const show = ref(false)
const phase = ref<Phase>('logo')
const exitMs = ref(550)

const logoChars = LOGO_WORD.split('')

let timers: ReturnType<typeof setTimeout>[] = []

function schedule(fn: () => void, delay: number) {
  timers.push(setTimeout(fn, delay))
}

function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // sessionStorage недоступен (приватный режим и т.п.) — не критично,
    // просто интро может показаться повторно.
  }
}

function beginExit(duration: number) {
  if (!show.value) return
  clearTimers()
  exitMs.value = duration
  show.value = false
  markSeen()
  window.removeEventListener('keydown', onKeydown)
}

function skip() {
  if (!show.value) return
  beginExit(180)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    skip()
  }
}

onMounted(() => {
  let seen = false
  try {
    seen = sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    seen = false
  }
  if (seen) return

  show.value = true
  window.addEventListener('keydown', onKeydown)

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    // Почти мгновенно: короткий статичный проблеск бренда + композиции,
    // без стаггера и без долгого удержания.
    schedule(() => { phase.value = 'blocks' }, 260)
    schedule(() => beginExit(1), 620)
    return
  }

  schedule(() => { phase.value = 'blocks' }, 900)
  schedule(() => beginExit(550), 900 + 1400)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Transition name="intro-root">
    <div
      v-if="show"
      class="intro-splash"
      :style="{ '--intro-exit-ms': `${exitMs}ms` }"
      role="dialog"
      aria-modal="true"
      aria-label="AI Sites"
      tabindex="-1"
      @click="skip"
    >
      <!-- аватар-плейсхолдер, пролетает по дуге на стыке акта 1 -> акта 2 -->
      <div class="intro-avatar" aria-hidden="true">
        <Icon name="lucide:user-round" />
      </div>

      <div class="intro-stage">
        <Transition name="intro-crossfade">
          <div v-if="phase === 'logo'" key="logo" class="intro-logo">
            <span class="intro-logo__glyph" aria-hidden="true">
              <Icon name="lucide:layout-template" />
            </span>
            <h1 class="intro-logo__word" aria-label="AI Sites">
              <span
                v-for="(ch, i) in logoChars"
                :key="i"
                class="intro-logo__char"
                :style="{ animationDelay: `${i * 55}ms` }"
              >{{ ch === ' ' ? ' ' : ch }}</span>
            </h1>
            <p class="intro-logo__tag">Собираем сайты из блоков за секунды</p>
          </div>

          <div v-else key="blocks" class="intro-mock">
            <!-- градиентная волна, проплывающая на заднем плане акта 2 -->
            <svg class="intro-wave" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="introWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color: var(--a-sunset-orange)" />
                  <stop offset="45%" style="stop-color: var(--a-sunset-pink)" />
                  <stop offset="100%" style="stop-color: var(--a-sunset-indigo)" />
                </linearGradient>
              </defs>
              <path
                d="M -20 60 Q 30 15 80 60 T 180 60 T 280 60 T 380 60 T 480 60"
                fill="none"
                stroke="url(#introWaveGrad)"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>

            <div class="intro-mock__frame glass-card">
              <div class="intro-mock__bar" aria-hidden="true">
                <span class="intro-mock__dot" />
                <span class="intro-mock__dot" />
                <span class="intro-mock__dot" />
              </div>
              <div class="intro-mock__canvas">
                <span class="intro-mock__block intro-mock__block--header" style="--i: 0" />
                <span class="intro-mock__block intro-mock__block--hero" style="--i: 1" />
                <span class="intro-mock__block intro-mock__block--a" style="--i: 2" />
                <span class="intro-mock__block intro-mock__block--b" style="--i: 3" />
                <span class="intro-mock__block intro-mock__block--c" style="--i: 4" />
                <span class="intro-mock__block intro-mock__block--footer" style="--i: 5" />
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <p class="intro-splash__hint" :class="{ 'is-visible': phase !== 'logo' }">
        Нажмите, чтобы пропустить <kbd>Esc</kbd>
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.intro-splash {
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* выше --a-z-toast (60) и любого модального слоя — сплэш перекрывает всё */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  background: var(--a-bg);
}

.intro-root-leave-active {
  transition:
    opacity var(--intro-exit-ms, 550ms) var(--a-ease-out),
    transform var(--intro-exit-ms, 550ms) var(--a-ease-spring);
}

.intro-root-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

.intro-stage {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0 var(--a-space-5);
}

.intro-stage > * {
  grid-area: 1 / 1;
}

.intro-crossfade-enter-active,
.intro-crossfade-leave-active {
  transition:
    opacity 320ms var(--a-ease-out),
    transform 320ms var(--a-ease-out);
}

.intro-crossfade-enter-from,
.intro-crossfade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

/* -- пролетающий аватар-плейсхолдер (стык акт 1 -> акт 2) -- */

.intro-avatar {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 46px;
  height: 46px;
  margin: -23px 0 0 -23px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--a-gradient-brand);
  box-shadow: var(--a-shadow-glow);
  opacity: 0;
  pointer-events: none;
  animation: intro-avatar-fly 620ms var(--a-ease-spring) 760ms both;
}

.intro-avatar :deep(svg) {
  width: 22px;
  height: 22px;
  stroke: #fff;
}

@keyframes intro-avatar-fly {
  0% {
    opacity: 0;
    transform: translate(-52vw, 16vh) scale(0.55) rotate(-14deg);
  }
  18% {
    opacity: 1;
  }
  50% {
    opacity: 1;
    transform: translate(0, -13vh) scale(1) rotate(3deg);
  }
  82% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(52vw, 14vh) scale(0.55) rotate(16deg);
  }
}

/* -- акт 1: вордмарк -- */

.intro-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--a-space-3);
  text-align: center;
}

.intro-logo__glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--a-radius-lg);
  background: var(--a-glass-bg);
  border: 1px solid var(--a-glass-border);
  color: transparent;
  background-image: var(--a-gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 26px;
  box-shadow: var(--a-shadow-glow);
  opacity: 0;
  transform: translateY(10px) scale(0.85);
  animation: intro-icon-in 480ms var(--a-ease-spring) both;
}

.intro-logo__glyph :deep(svg) {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: var(--a-sunset-pink);
}

.intro-logo__word {
  margin: 0;
  font-size: clamp(2rem, 8vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  background: var(--a-gradient-text);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: intro-shimmer 1.8s var(--a-ease-in-out) infinite;
}

.intro-logo__char {
  display: inline-block;
  opacity: 0;
  transform: translateY(18px);
  animation: intro-char-in 560ms var(--a-ease-out) both;
}

.intro-logo__tag {
  margin: 0;
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  opacity: 0;
  animation: intro-fade-in 500ms var(--a-ease-out) 520ms both;
}

@keyframes intro-icon-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes intro-char-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes intro-fade-in {
  to {
    opacity: 1;
  }
}

@keyframes intro-shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

/* -- акт 2: мокап "сборки" сайта -- */

.intro-wave {
  position: absolute;
  z-index: 1;
  left: -25%;
  top: 60%;
  width: 150%;
  height: 150px;
  opacity: 0;
  pointer-events: none;
  filter: drop-shadow(0 0 16px color-mix(in srgb, var(--a-sunset-pink) 30%, transparent));
  /* linear, не ease-in-out: волна должна непрерывно ПЛЫТЬ с постоянной
     скоростью, а не "дышать" (замедление к краям читалось как рывок).
     Затухание непрозрачности по-прежнему плавное — задано отдельными
     стопами (25%/75%) внутри той же линейной шкалы времени. */
  animation: intro-wave-drift 1300ms linear both;
}

@keyframes intro-wave-drift {
  0% {
    opacity: 0;
    transform: translateX(-14%);
  }
  25% {
    opacity: 0.55;
  }
  75% {
    opacity: 0.55;
  }
  100% {
    opacity: 0;
    transform: translateX(14%);
  }
}

.intro-mock__frame {
  position: relative;
  z-index: 2;
  width: min(80vw, 360px);
  padding: var(--a-space-2);
  opacity: 0;
  transform: translateY(12px) scale(0.94);
  animation: intro-frame-in 420ms var(--a-ease-spring) both;
}

@keyframes intro-frame-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.intro-mock__bar {
  display: flex;
  gap: 6px;
  padding: 0 var(--a-space-2) var(--a-space-2);
}

.intro-mock__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--a-border-strong);
}

.intro-mock__canvas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 16px 44px repeat(1, 28px) 14px;
  grid-template-areas:
    'header header header'
    'hero hero hero'
    'a b c'
    'footer footer footer';
  gap: var(--a-space-2);
  padding: var(--a-space-1) var(--a-space-2) var(--a-space-2);
}

.intro-mock__block {
  border-radius: var(--a-radius-sm);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  opacity: 0;
  transform: translateY(14px) scale(0.9);
  animation: intro-block-in 460ms var(--a-ease-spring) both;
  animation-delay: calc(150ms + var(--i) * 90ms);
}

.intro-mock__block--header {
  grid-area: header;
  background: var(--a-gradient-brand-soft);
  border-color: transparent;
}

.intro-mock__block--hero {
  grid-area: hero;
  background: var(--a-gradient-brand-soft);
  border-color: transparent;
  opacity: 0;
}

.intro-mock__block--a {
  grid-area: a;
}

.intro-mock__block--b {
  grid-area: b;
}

.intro-mock__block--c {
  grid-area: c;
}

.intro-mock__block--footer {
  grid-area: footer;
}

@keyframes intro-block-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* -- подсказка "пропустить" -- */

.intro-splash__hint {
  position: relative;
  z-index: 2;
  margin: var(--a-space-6) 0 0;
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  opacity: 0;
  transition: opacity 240ms var(--a-ease-out);
}

.intro-splash__hint.is-visible {
  opacity: 1;
}

.intro-splash__hint kbd {
  font: inherit;
  padding: 1px 6px;
  border-radius: var(--a-radius-sm);
  border: 1px solid var(--a-border);
  background: var(--a-surface);
}

@media (max-width: 480px) {
  .intro-mock__frame {
    width: min(88vw, 320px);
  }

  .intro-logo__tag {
    padding: 0 var(--a-space-4);
  }

  .intro-avatar {
    width: 38px;
    height: 38px;
    margin: -19px 0 0 -19px;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* Глобальный global.css уже зануляет animation/transition-duration для
     всего приложения через !important — это лишь подчёркивает намерение:
     никакого движения блобов/стаггера/волны/аватара, только статичный
     бренд-кадр. */
  .intro-logo__glyph,
  .intro-logo__char,
  .intro-logo__tag,
  .intro-logo__word,
  .intro-mock__frame,
  .intro-mock__block {
    animation: none;
    opacity: 1;
    transform: none;
    background-position: 0% 50%;
  }

  .intro-avatar,
  .intro-wave {
    display: none;
  }
}
</style>
