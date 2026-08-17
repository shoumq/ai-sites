<script setup lang="ts">
/**
 * Переиспользуемое «тело» формы заявки: поля + согласие 152-ФЗ + кнопка +
 * состояния «отправляем / спасибо / ошибка».
 *
 * Живёт отдельным компонентом, потому что одну и ту же форму показывают три
 * места: блок lead_form (три варианта вёрстки), модалка «Оставить заявку» с
 * карточки товара и шаг оформления заказа в корзине. Дублировать валидацию и
 * обработку ответа в трёх местах — гарантированно разъехаться.
 */
import { computed, reactive, ref } from 'vue'
import type { LeadFormField } from '~/types/site'
import type { CartItem } from '../composables/useCart'

const props = withDefaults(
  defineProps<{
    fields: LeadFormField[]
    submitText?: string
    successText?: string
    consentText?: string
    /** Скрытый контекст заявки: товар, из карточки которого открыли форму. */
    subject?: string
    sku?: string
    kind?: 'lead' | 'order'
    /** Состав корзины для kind="order" — уезжает в заявку позициями. */
    cartItems?: CartItem[]
    cartTotal?: string
    sourceBlock?: string
    /** Поля в одну строку — для варианта lead_form=inline. */
    inline?: boolean
    /** true в редакторе: форма не отправляется и не блокирует клики по блоку. */
    editable?: boolean
  }>(),
  {
    submitText: 'Отправить',
    successText: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
    consentText: '',
    subject: '',
    sku: '',
    kind: 'lead',
    cartItems: () => [],
    cartTotal: '',
    sourceBlock: '',
    inline: false,
    editable: false,
  },
)

const emit = defineEmits<{ sent: [paymentUrl: string] }>()

const runtime = useSiteRuntime()
const { submitLead } = useSiteForms()

const values = reactive<Record<string, string>>({})
const honeypot = ref('')
const consent = ref(false)
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorText = ref('')

const consentLabel = computed(() => props.consentText || runtime.value.consentText)
const needsConsent = computed(() => runtime.value.addPdConsent)

// Стандартные ключи уезжают в отдельные колонки заявки, остальные — в extra
// (см. backend/app/schemas/lead.py). Так телефон из формы всегда оказывается
// в поле «Телефон» списка заявок, а не в куче произвольных полей.
const STANDARD_KEYS = new Set(['name', 'phone', 'email', 'message'])

function fieldValue(field: LeadFormField): string {
  return values[field.name] ?? ''
}

function validate(): string {
  for (const field of props.fields) {
    if (field.required && !fieldValue(field).trim()) {
      return `Заполните поле «${field.label}»`
    }
  }
  if (needsConsent.value && !consent.value) {
    return 'Нужно согласие на обработку персональных данных'
  }
  return ''
}

async function onSubmit() {
  if (props.editable || status.value === 'sending') return

  const validationError = validate()
  if (validationError) {
    status.value = 'error'
    errorText.value = validationError
    return
  }

  status.value = 'sending'
  errorText.value = ''

  const extra: Record<string, string> = {}
  for (const field of props.fields) {
    if (!STANDARD_KEYS.has(field.name) && fieldValue(field).trim()) {
      extra[field.label || field.name] = fieldValue(field)
    }
  }
  if (props.subject) extra['Товар'] = props.subject
  if (props.sku) extra['Артикул'] = props.sku

  const { ok, paymentUrl } = await submitLead({
    kind: props.kind,
    name: values.name ?? '',
    phone: values.phone ?? '',
    email: values.email ?? '',
    message: values.message ?? '',
    extra,
    items: props.cartItems,
    total: props.cartTotal,
    sourceBlock: props.sourceBlock,
    companyWebsite: honeypot.value,
  })

  if (ok) {
    status.value = 'sent'
    emit('sent', paymentUrl)
  } else {
    status.value = 'error'
    errorText.value = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.'
  }
}

function reset() {
  status.value = 'idle'
  for (const key of Object.keys(values)) delete values[key]
  consent.value = false
}

defineExpose({ reset })
</script>

<template>
  <form v-if="status !== 'sent'" class="lead-form" :class="{ 'is-inline': inline }" novalidate @submit.prevent="onSubmit">
    <p v-if="subject" class="lead-form__subject">
      Заявка на: <strong>{{ subject }}</strong>
    </p>

    <label v-for="field in fields" :key="field.name" class="lead-form__field">
      <span class="lead-form__label">
        {{ field.label }}<span v-if="field.required" class="lead-form__required">*</span>
      </span>

      <textarea
        v-if="field.type === 'textarea'"
        v-model="values[field.name]"
        class="lead-form__control"
        rows="3"
        :placeholder="field.placeholder"
      />
      <select v-else-if="field.type === 'select'" v-model="values[field.name]" class="lead-form__control">
        <option value="" disabled>Выберите…</option>
        <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
      </select>
      <input
        v-else
        v-model="values[field.name]"
        class="lead-form__control"
        :type="field.type"
        :placeholder="field.placeholder"
      >
    </label>

    <!-- Honeypot: спрятан от людей (не display:none — часть ботов такие поля
         пропускает), заполняется только автозаполнением ботов. -->
    <input
      v-model="honeypot"
      class="lead-form__honeypot"
      type="text"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
    >

    <label v-if="needsConsent" class="lead-form__consent">
      <input v-model="consent" type="checkbox">
      <span>
        {{ consentLabel }}
        <a v-if="runtime.privacyPolicyUrl" :href="runtime.privacyPolicyUrl" target="_blank" rel="noopener">(политика)</a>
      </span>
    </label>

    <p v-if="status === 'error'" class="lead-form__error">{{ errorText }}</p>

    <button class="lead-form__submit btn-primary" type="submit" :disabled="status === 'sending'">
      {{ status === 'sending' ? 'Отправляем…' : submitText }}
    </button>
  </form>

  <div v-else class="lead-form__success">
    <span class="lead-form__success-icon" aria-hidden="true">✓</span>
    <p>{{ successText }}</p>
    <button class="lead-form__again" type="button" @click="reset">Отправить ещё одну</button>
  </div>
</template>

<style scoped>
.lead-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.lead-form.is-inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
}

.lead-form.is-inline .lead-form__field {
  flex: 1 1 180px;
}

.lead-form.is-inline .lead-form__consent {
  flex-basis: 100%;
}

.lead-form__subject {
  padding: var(--space-3);
  border-radius: var(--radius-control);
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  font-size: var(--fs-sm);
  color: var(--text);
}

.lead-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lead-form__label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text-muted);
}

.lead-form__required {
  color: var(--primary);
  margin-left: 2px;
}

.lead-form__control {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-control);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: var(--fs-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.lead-form__control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 22%, transparent);
}

.lead-form__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.lead-form__consent {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  font-size: var(--fs-sm);
  color: var(--text-muted);
  cursor: pointer;
}

.lead-form__consent input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.lead-form__consent a {
  color: var(--primary);
}

.lead-form__error {
  font-size: var(--fs-sm);
  color: #dc2626;
}

.lead-form__submit {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.lead-form__submit:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.lead-form__submit:disabled {
  opacity: 0.65;
  cursor: progress;
}

.lead-form__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
}

.lead-form__success-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
  font-size: 1.75rem;
  font-weight: 700;
}

.lead-form__again {
  border: none;
  background: none;
  color: var(--primary);
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
}
</style>
