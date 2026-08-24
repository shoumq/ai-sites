<script setup lang="ts">
interface TabItem { key: string; label: string; icon?: string }

defineProps<{
  modelValue: string
  tabs: TabItem[]
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="base-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      class="base-tabs__item"
      :class="{ 'is-active': tab.key === modelValue }"
      :aria-selected="tab.key === modelValue"
      @click="$emit('update:modelValue', tab.key)"
    >
      <Icon v-if="tab.icon" :name="tab.icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.base-tabs {
  display: flex;
  gap: var(--a-space-1);
  padding: 4px;
  background: color-mix(in srgb, var(--a-surface) 92%, transparent);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  box-shadow: inset 0 1px 3px rgba(0,0,0,.08);
}

.base-tabs__item {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  padding: var(--a-space-2) var(--a-space-3);
  border: none;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-muted);
  font-size: var(--a-fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--a-transition-fast), color var(--a-transition-fast), transform var(--a-transition-fast), box-shadow var(--a-transition-fast);
  white-space: nowrap;
}

.base-tabs__item:hover {
  color: var(--a-text);
}
.base-tabs__item:active { transform: scale(.97); }

.base-tabs__item.is-active {
  background: var(--a-bg-elevated);
  color: var(--a-text);
  box-shadow: var(--a-shadow-sm), inset 0 1px 0 rgba(255,255,255,.12);
}
</style>
