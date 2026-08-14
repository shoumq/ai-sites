<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: string
    hint?: string
    error?: string
    disabled?: boolean
    maxlength?: number
    autocomplete?: string
  }>(),
  {
    label: undefined,
    placeholder: '',
    type: 'text',
    hint: undefined,
    error: undefined,
    disabled: false,
    maxlength: undefined,
    autocomplete: undefined,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const uid = useId()
</script>

<template>
  <div class="base-field">
    <label v-if="label" :for="uid" class="base-field__label">{{ label }}</label>
    <input
      :id="uid"
      class="base-field__control"
      :class="{ 'has-error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p v-if="error" class="base-field__error">{{ error }}</p>
    <p v-else-if="hint" class="base-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-field {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
}

.base-field__label {
  font-size: var(--a-fs-xs);
  font-weight: 600;
  color: var(--a-text-muted);
  letter-spacing: 0.02em;
}

.base-field__control {
  height: 42px;
  padding: 0 var(--a-space-4);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  color: var(--a-text);
  font-family: inherit;
  font-size: var(--a-fs-base);
  transition: border-color var(--a-transition-fast), background var(--a-transition-fast), box-shadow var(--a-transition-fast);
}

.base-field__control::placeholder {
  color: var(--a-text-faint);
}

.base-field__control:hover:not(:disabled) {
  border-color: var(--a-border-strong);
}

.base-field__control:focus {
  outline: none;
  border-color: var(--a-accent);
  background: var(--a-surface-hover);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-accent) 25%, transparent);
}

.base-field__control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-field__control.has-error {
  border-color: var(--a-error);
}

.base-field__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.base-field__error {
  font-size: var(--a-fs-xs);
  color: var(--a-error);
}
</style>
