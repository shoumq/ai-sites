<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-screen">
    <div class="error-card glass-card" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 420 } }">
      <div class="error-card__code text-gradient">{{ error.statusCode ?? 500 }}</div>
      <h1>{{ isNotFound ? 'Страница не найдена' : 'Что-то пошло не так' }}</h1>
      <p>{{ isNotFound ? 'Такой страницы не существует или она была перемещена.' : (error.statusMessage || error.message || 'Произошла непредвиденная ошибка.') }}</p>
      <BaseButton variant="primary" icon="lucide:home" @click="goHome">На главную</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.error-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--a-space-5);
  position: relative;
}

.error-card {
  position: relative;
  z-index: 1;
  max-width: 420px;
  width: 100%;
  padding: var(--a-space-8) var(--a-space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--a-space-3);
}

.error-card__code {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
}

.error-card h1 {
  font-size: var(--a-fs-xl);
}

.error-card p {
  color: var(--a-text-muted);
  font-size: var(--a-fs-sm);
  margin-bottom: var(--a-space-2);
}
</style>
