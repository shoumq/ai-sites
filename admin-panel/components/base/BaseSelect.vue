<script setup lang="ts">
interface Option { value: string; label: string }

withDefaults(
  defineProps<{
    modelValue: string
    options: Option[]
    label?: string
  }>(),
  { label: undefined },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const uid = useId()
</script>

<template>
  <div class="base-field">
    <label v-if="label" :for="uid" class="base-field__label">{{ label }}</label>
    <div class="base-select__wrap">
      <select
        :id="uid"
        class="base-field__control base-select"
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <Icon name="lucide:chevron-down" class="base-select__chevron" />
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

.base-select__wrap {
  position: relative;
  display: flex;
}

.base-field__control.base-select {
  height: 42px;
  width: 100%;
  padding: 0 var(--a-space-7) 0 var(--a-space-4);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  color: var(--a-text);
  font-family: inherit;
  font-size: var(--a-fs-base);
  appearance: none;
  cursor: pointer;
  transition: border-color var(--a-transition-fast), background var(--a-transition-fast);
}

.base-select__wrap:hover .base-field__control {
  border-color: var(--a-border-strong);
}

.base-field__control.base-select:focus {
  outline: none;
  border-color: var(--a-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-accent) 25%, transparent);
}

.base-select__chevron {
  position: absolute;
  right: var(--a-space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--a-text-faint);
  pointer-events: none;
  font-size: 0.95rem;
}

.base-field__control.base-select option {
  background: var(--a-bg-elevated);
  color: var(--a-text);
}
</style>
