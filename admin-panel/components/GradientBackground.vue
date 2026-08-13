<script setup lang="ts">
// Фиксированный на весь вьюпорт слой с 3 мягкими градиентными "блобами" —
// закатная палитра (оранж -> розовый -> индиго), медленный дрейф через CSS
// @keyframes. will-change: transform держит анимацию на композиторе (дёшево
// по CPU/GPU), prefers-reduced-motion полностью отключает движение в
// global.css (там animation-duration укорачивается до ~0), здесь же
// дублируем на всякий случай через media-запрос ниже, чтобы блобы замерли,
// а не просто "быстро домотались" до конечного кадра.
</script>

<template>
  <div class="gradient-bg" aria-hidden="true">
    <span class="blob blob--a" />
    <span class="blob blob--b" />
    <span class="blob blob--c" />
    <div class="grain" />
  </div>
</template>

<style scoped>
.gradient-bg {
  position: fixed;
  inset: 0;
  z-index: var(--a-z-bg);
  overflow: hidden;
  background: var(--a-bg);
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
  will-change: transform;
}

.blob--a {
  top: -12%;
  left: -8%;
  width: 46vw;
  height: 46vw;
  background: radial-gradient(circle at 30% 30%, var(--a-sunset-orange), transparent 70%);
  animation: drift-a 34s var(--a-ease-in-out) infinite alternate;
}

.blob--b {
  bottom: -18%;
  right: -10%;
  width: 52vw;
  height: 52vw;
  background: radial-gradient(circle at 60% 40%, var(--a-sunset-indigo), transparent 70%);
  animation: drift-b 40s var(--a-ease-in-out) infinite alternate;
}

.blob--c {
  top: 30%;
  left: 38%;
  width: 34vw;
  height: 34vw;
  background: radial-gradient(circle at 50% 50%, var(--a-sunset-pink), transparent 72%);
  opacity: 0.35;
  animation: drift-c 46s var(--a-ease-in-out) infinite alternate;
}

.grain {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, var(--a-bg) 92%);
}

@keyframes drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(6vw, 8vh) scale(1.12); }
}

@keyframes drift-b {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-7vw, -6vh) scale(1.08); }
}

@keyframes drift-c {
  from { transform: translate(-4vw, 3vh) scale(0.95); }
  to { transform: translate(5vw, -5vh) scale(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>
