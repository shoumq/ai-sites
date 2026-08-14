<script setup lang="ts">
import type { ChatCommandOut } from '~/types/api'

// Вкладка «ИИ-Чат»: свободные текстовые команды правят JSON без перегенерации
// сайта (POST /projects/{id}/chat). Результат уже применён и сохранён на
// бэкенде — applyExternalSite() просто синхронизирует локальный стейт стора.
interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  failed?: boolean
}

const store = useEditorStore()
const api = useApi()

const messages = ref<ChatMessage[]>([])
const input = ref('')
const sending = ref(false)
let counter = 0
const logEl = ref<HTMLElement | null>(null)

async function scrollToEnd() {
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
}

async function submit() {
  const text = input.value.trim()
  if (!text || sending.value || !store.projectId) return

  messages.value.push({ id: ++counter, role: 'user', text })
  input.value = ''
  sending.value = true
  scrollToEnd()

  try {
    const result = await api.post<ChatCommandOut>(`/projects/${store.projectId}/chat`, { message: text })
    messages.value.push({ id: ++counter, role: 'assistant', text: result.reply, failed: !result.applied })
    if (result.applied) store.applyExternalSite(result.site_data)
  } catch (err) {
    messages.value.push({
      id: ++counter,
      role: 'assistant',
      text: err instanceof ApiError ? err.message : 'Не удалось выполнить команду. Попробуйте ещё раз.',
      failed: true,
    })
  } finally {
    sending.value = false
    scrollToEnd()
  }
}
</script>

<template>
  <div class="chat-panel">
    <p class="chat-panel__examples">
      Опишите правку своими словами — например: «Сделай шапку липкой», «Поменяй местами блоки Отзывы и Цены»,
      «Добавь блок FAQ в конец страницы», «Добавь блок фильтра каталога после услуг».
    </p>

    <div ref="logEl" class="chat-panel__log">
      <div v-if="messages.length === 0" class="chat-panel__empty">
        <Icon name="lucide:message-circle" />
        <p>
          Понимаю свободные формулировки: переставить, добавить (в том числе новый тип блока — FAQ, галерею,
          фильтр каталога, статистику), удалить блок, поменять текст, цвет, вариант оформления.
        </p>
      </div>
      <TransitionGroup name="chat-bubble">
        <div
          v-for="m in messages"
          :key="m.id"
          class="chat-bubble"
          :class="[`is-${m.role}`, { 'is-failed': m.failed }]"
        >
          {{ m.text }}
        </div>
      </TransitionGroup>
      <div v-if="sending" class="chat-bubble is-assistant is-pending">
        <span class="chat-panel__dot" /><span class="chat-panel__dot" /><span class="chat-panel__dot" />
      </div>
    </div>

    <form class="chat-panel__input-row" @submit.prevent="submit">
      <input
        v-model="input"
        class="chat-panel__input"
        placeholder="Например: «Сделай шапку липкой»…"
        :disabled="sending"
      >
      <button type="submit" class="chat-panel__send" :disabled="sending || !input.trim()" aria-label="Отправить">
        <Icon name="lucide:send-horizontal" />
      </button>
    </form>
  </div>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--a-space-3);
}

.chat-panel__examples {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  line-height: 1.5;
}

.chat-panel__log {
  flex: 1;
  min-height: 240px;
  max-height: 46vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
  padding: var(--a-space-1);
}

.chat-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--a-space-2);
  text-align: center;
  color: var(--a-text-faint);
  font-size: var(--a-fs-xs);
  padding: var(--a-space-6) var(--a-space-3);
}
.chat-panel__empty :deep(svg) {
  font-size: 1.75rem;
}

.chat-bubble {
  max-width: 88%;
  padding: var(--a-space-2) var(--a-space-3);
  border-radius: var(--a-radius-md);
  font-size: var(--a-fs-sm);
  line-height: 1.5;
}

.chat-bubble.is-user {
  align-self: flex-end;
  background: var(--a-gradient-brand);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-bubble.is-assistant {
  align-self: flex-start;
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-bottom-left-radius: 4px;
}

.chat-bubble.is-failed {
  border-color: color-mix(in srgb, var(--a-error) 40%, transparent);
  color: var(--a-error);
}

.chat-bubble.is-pending {
  display: flex;
  gap: 4px;
  align-items: center;
}

.chat-panel__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--a-text-faint);
  animation: chat-dot-bounce 1s ease-in-out infinite;
}
.chat-panel__dot:nth-child(2) { animation-delay: 0.15s; }
.chat-panel__dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes chat-dot-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.chat-panel__input-row {
  display: flex;
  gap: var(--a-space-2);
  flex-shrink: 0;
}

.chat-panel__input {
  flex: 1;
  height: 42px;
  padding: 0 var(--a-space-4);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  color: var(--a-text);
  font-family: inherit;
  font-size: var(--a-fs-base);
}
.chat-panel__input:focus {
  outline: none;
  border-color: var(--a-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-accent) 25%, transparent);
}

.chat-panel__send {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--a-radius-md);
  background: var(--a-gradient-brand);
  color: #fff;
  cursor: pointer;
  transition: filter var(--a-transition-fast), opacity var(--a-transition-fast);
}
.chat-panel__send:hover:not(:disabled) {
  filter: brightness(1.1);
}
.chat-panel__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-bubble-enter-active {
  transition: transform var(--a-transition-base) var(--a-ease-spring), opacity var(--a-transition-base);
}
.chat-bubble-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
