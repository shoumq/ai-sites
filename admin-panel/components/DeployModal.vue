<script setup lang="ts">
/**
 * Деплой сайта в git: скачать готовую к заливке папку или сразу создать
 * репозиторий на GitHub и запушить туда сборку.
 *
 * Токен GitHub НЕ сохраняется: он живёт только в этом компоненте на время
 * запроса, уходит в тело POST и на сервере используется одним вызовом (см.
 * backend/app/api/routes/deploy.py). Поэтому при повторном деплое его нужно
 * ввести заново — это осознанный размен приватности на удобство.
 */
import type { GitHubDeployOut } from '~/types/api'

const props = defineProps<{ modelValue: boolean; projectId: string; projectName: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const api = useApi()
const toast = useToast()

function defaultRepoName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'site'
}

const repoName = ref(defaultRepoName(props.projectName))
const token = ref('')
const isPrivate = ref(false)
const enablePages = ref(true)

const downloading = ref(false)
const deploying = ref(false)
const result = ref<GitHubDeployOut | null>(null)

// Приватный репозиторий на бесплатном тарифе GitHub не умеет Pages — не
// обещаем пользователю ссылку, которой не будет.
watch(isPrivate, (value) => {
  if (value) enablePages.value = false
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      token.value = ''
      result.value = null
    } else {
      repoName.value = defaultRepoName(props.projectName)
    }
  },
)

async function downloadFolder() {
  downloading.value = true
  try {
    await api.download(
      `/projects/${props.projectId}/deploy/folder?repo_name=${encodeURIComponent(repoName.value)}`,
      `${repoName.value}.zip`,
    )
    toast.success('Папка собрана — распакуйте и запушьте по инструкции из README')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось собрать папку')
  } finally {
    downloading.value = false
  }
}

async function deployToGithub() {
  if (!token.value.trim()) {
    toast.error('Нужен personal access token GitHub')
    return
  }
  deploying.value = true
  try {
    result.value = await api.post<GitHubDeployOut>(`/projects/${props.projectId}/deploy/github`, {
      token: token.value.trim(),
      repo_name: repoName.value.trim(),
      private: isPrivate.value,
      enable_pages: enablePages.value,
    })
    // Токен больше не нужен — стираем сразу, не дожидаясь закрытия окна.
    token.value = ''
    toast.success(result.value.created ? 'Репозиторий создан и сайт залит' : 'Сайт обновлён в репозитории')
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось задеплоить в GitHub')
  } finally {
    deploying.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Деплой сайта"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="deploy">
      <BaseInput
        v-model="repoName"
        label="Название репозитория"
        placeholder="my-site"
        hint="Латиница, цифры, дефис и подчёркивание"
      />

      <section class="deploy__option">
        <h3><Icon name="lucide:folder-down" /> Скачать готовую папку</h3>
        <p>
          Zip с собранным сайтом, <code>.gitignore</code>, <code>.nojekyll</code>, workflow для GitHub Pages и
          README с командами <code>git init</code> / <code>git push</code>. Заливаете сами, куда хотите.
        </p>
        <BaseButton variant="secondary" icon="lucide:download" :loading="downloading" @click="downloadFolder">
          Скачать папку
        </BaseButton>
      </section>

      <section class="deploy__option">
        <h3><Icon name="lucide:github" /> Создать репозиторий на GitHub</h3>
        <p>
          Создадим репозиторий с этим названием (или обновим существующий), зальём сайт одним коммитом и включим
          GitHub Pages.
        </p>

        <BaseInput
          v-model="token"
          label="Personal access token"
          type="password"
          placeholder="ghp_…"
          hint="Нужны права repo (Contents, Administration) и Pages. Токен нигде не сохраняется — введите его заново при следующем деплое."
        />

        <label class="deploy__check">
          <input v-model="isPrivate" type="checkbox">
          Приватный репозиторий
        </label>
        <label class="deploy__check" :class="{ 'is-disabled': isPrivate }">
          <input v-model="enablePages" type="checkbox" :disabled="isPrivate">
          Включить GitHub Pages
        </label>
        <p v-if="isPrivate" class="deploy__note">
          Для приватного репозитория GitHub Pages недоступен на бесплатном тарифе.
        </p>

        <BaseButton variant="primary" icon="lucide:upload-cloud" :loading="deploying" @click="deployToGithub">
          Задеплоить в GitHub
        </BaseButton>

        <div v-if="result" class="deploy__result">
          <p>
            <Icon name="lucide:check-circle-2" />
            Залито файлов: {{ result.files_count }}, коммит <code>{{ result.commit_sha.slice(0, 7) }}</code>
          </p>
          <a :href="result.repo_url" target="_blank" rel="noopener">{{ result.repo_url }}</a>
          <a v-if="result.pages_url" :href="result.pages_url" target="_blank" rel="noopener">{{ result.pages_url }}</a>
          <p v-else-if="enablePages" class="deploy__note">
            Pages включить не удалось — включите вручную в Settings → Pages (ветка main, папка /).
          </p>
          <p v-if="result.pages_url" class="deploy__note">
            Первая публикация на Pages занимает около минуты.
          </p>
        </div>
      </section>
    </div>
  </BaseModal>
</template>

<style scoped>
.deploy {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-5);
}

.deploy__option {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
  padding: var(--a-space-4);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-lg);
  background: var(--a-surface);
}

.deploy__option h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--a-fs-md);
}

.deploy__option p {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  line-height: 1.55;
}

.deploy__option code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--a-bg-elevated);
}

.deploy__check {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  cursor: pointer;
}

.deploy__check.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.deploy__note {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.deploy__result {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  border-radius: var(--a-radius-md);
  background: color-mix(in srgb, var(--a-success) 12%, transparent);
  font-size: var(--a-fs-sm);
}

.deploy__result a {
  color: var(--a-accent);
  word-break: break-all;
}
</style>
