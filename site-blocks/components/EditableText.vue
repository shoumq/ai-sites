<script setup lang="ts">
/**
 * Инлайн contentEditable-редактор текста.
 *
 * Ключевое поведение (важно для UX): пока идёт редактирование, элемент НЕ
 * синхронизируется с внешним modelValue на каждый keystroke — иначе курсор
 * прыгает в начало при каждом ререндере родителя. Вместо v-model-биндинга
 * текст в contenteditable-узле управляется императивно (textContent), а
 * наружу событие уходит только на commit:
 *   - blur -> commit
 *   - Enter (если !multiline) -> commit и blur
 *   - Escape -> откат к значению на момент фокуса, blur без commit
 *
 * Когда editable === false — рендерит голый <component :is="tag"> без единого
 * обработчика событий (ветка для site-renderer/публичного сайта).
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    tag?: string
    editable?: boolean
    placeholder?: string
    multiline?: boolean
  }>(),
  {
    modelValue: '',
    tag: 'div',
    editable: false,
    placeholder: '',
    multiline: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const el = ref<HTMLElement | null>(null)
const isFocused = ref(false)
let valueBeforeEdit = ''

function setElText(text: string) {
  if (el.value && el.value.textContent !== text) {
    el.value.textContent = text
  }
}

onMounted(() => {
  if (props.editable) setElText(props.modelValue ?? '')
})

// Внешние изменения modelValue (например, откат в редакторе) применяем к DOM
// только когда пользователь сейчас НЕ печатает в этом поле.
watch(
  () => props.modelValue,
  (value) => {
    if (!isFocused.value) setElText(value ?? '')
  },
)

function onFocus() {
  isFocused.value = true
  valueBeforeEdit = props.modelValue ?? ''
}

function commit() {
  const text = el.value?.textContent ?? ''
  if (text !== props.modelValue) emit('update:modelValue', text)
}

function onBlur() {
  isFocused.value = false
  commit()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    setElText(valueBeforeEdit)
    el.value?.blur()
    return
  }
  if (event.key === 'Enter' && !props.multiline) {
    event.preventDefault()
    el.value?.blur()
  }
}

// tag может быть "a" (нав-ссылки, футер-линки со своим href через fallthrough-атрибут) —
// в режиме редактирования клик должен фокусировать текст, а не уводить со страницы.
function onClick(event: MouseEvent) {
  if (props.editable && props.tag === 'a') event.preventDefault()
}
</script>

<template>
  <component
    :is="tag"
    v-if="editable"
    ref="el"
    class="editable-text"
    contenteditable="true"
    spellcheck="false"
    :data-placeholder="placeholder"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
    @click="onClick"
  />
  <component :is="tag" v-else>{{ modelValue }}</component>
</template>

<style scoped>
.editable-text {
  outline: none;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast);
  cursor: text;
}

.editable-text:hover {
  background-color: color-mix(in srgb, var(--primary) 8%, transparent);
}

.editable-text:focus {
  background-color: color-mix(in srgb, var(--primary) 10%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent);
}

.editable-text:empty::before {
  content: attr(data-placeholder);
  opacity: 0.45;
}
</style>
