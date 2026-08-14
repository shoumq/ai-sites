<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  danger: boolean
}>()

const emit = defineEmits<{
  accept: []
  dismiss: []
}>()
</script>

<template>
  <BaseModal :model-value="modelValue" :title="title" size="sm" @update:model-value="emit('dismiss')">
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <BaseButton variant="ghost" @click="emit('dismiss')">{{ cancelLabel }}</BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'primary'" @click="emit('accept')">{{ confirmLabel }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-message {
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  line-height: 1.55;
}
</style>
