<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  if (!email.value.trim() || !password.value) return
  loading.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    router.push('/')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось войти')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-screen">
    <div class="auth-card glass-card" v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 420 } }">
      <div class="auth-card__brand">
        <span class="auth-card__logo">
          <Icon name="lucide:sparkles" />
        </span>
        <h1 class="text-gradient">AI Sites</h1>
      </div>
      <p class="auth-card__subtitle">Войдите, чтобы продолжить работу над своими сайтами</p>

      <form class="auth-card__form" @submit.prevent="submit">
        <BaseInput v-model="email" type="email" label="Email" placeholder="you@example.com" autocomplete="email" />
        <BaseInput v-model="password" type="password" label="Пароль" placeholder="••••••••" autocomplete="current-password" />
        <BaseButton type="submit" variant="primary" size="lg" block :loading="loading" :disabled="!email.trim() || !password">
          Войти
        </BaseButton>
      </form>

      <p class="auth-card__footer">
        Нет аккаунта?
        <NuxtLink to="/register" class="auth-card__link">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--a-space-5);
  position: relative;
  z-index: var(--a-z-base);
  overflow: hidden;
}
.auth-screen::before { content: ''; position: absolute; width: 36rem; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--a-accent) 24%, transparent), transparent 68%); filter: blur(12px); transform: translate(-36%, -26%); pointer-events: none; }

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: var(--a-space-7);
  display: flex;
  flex-direction: column;
  gap: var(--a-space-5);
}

.auth-card__brand {
  display: flex;
  align-items: center;
  gap: var(--a-space-3);
  justify-content: center;
}

.auth-card__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 17px;
  background: var(--a-gradient-brand);
  color: #fff;
  font-size: 1.25rem;
  box-shadow: var(--a-shadow-glow);
}

.auth-card__brand h1 {
  font-size: var(--a-fs-xl);
}

.auth-card__subtitle {
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  margin-top: calc(var(--a-space-3) * -1);
  text-align: center;
}

@media (max-width: 480px) { .auth-card { padding: var(--a-space-6) var(--a-space-5); } }

.auth-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
}

.auth-card__footer {
  text-align: center;
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
}

.auth-card__link {
  color: var(--a-accent);
  font-weight: 600;
  text-decoration: none;
}
.auth-card__link:hover {
  text-decoration: underline;
}
</style>
