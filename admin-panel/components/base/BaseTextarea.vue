<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    hint?: string
    rows?: number
    maxlength?: number
    showCount?: boolean
  }>(),
  {
    label: undefined,
    placeholder: '',
    hint: undefined,
    rows: 4,
    maxlength: undefined,
    showCount: false,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const uid = useId()
const count = computed(() => props.modelValue.length)
</script>

<template>
  <div class="base-field">
    <label v-if="label" :for="uid" class="base-field__label">{{ label }}</label>
    <textarea
      :id="uid"
      class="base-field__control"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div class="base-field__footer">
      <p v-if="hint" class="base-field__hint">{{ hint }}</p>
      <span v-if="showCount && maxlength" class="base-field__count">{{ count }} / {{ maxlength }}</span>
    </div>
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
  padding: var(--a-space-3) var(--a-space-4);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  color: var(--a-text);
  font-family: inherit;
  font-size: var(--a-fs-base);
  line-height: 1.5;
  resize: vertical;
  transition: border-color var(--a-transition-fast), background var(--a-transition-fast), box-shadow var(--a-transition-fast);
}

.base-field__control::placeholder {
  color: var(--a-text-faint);
}

.base-field__control:hover {
  border-color: var(--a-border-strong);
}

.base-field__control:focus {
  outline: none;
  border-color: var(--a-accent);
  background: var(--a-surface-hover);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-accent) 25%, transparent);
}

.base-field__footer {
  display: flex;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.base-field__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.base-field__count {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  margin-left: auto;
}
</style>
