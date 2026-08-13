<script setup lang="ts">
// Синглтон-хост промис-based confirm() — монтируется один раз в app.vue.
const { state, accept, dismiss } = useConfirm()
</script>

<template>
  <BaseConfirmDialog
    :model-value="state.open"
    :title="state.title"
    :message="state.message"
    :confirm-label="state.confirmLabel"
    :cancel-label="state.cancelLabel"
    :danger="state.danger"
    @accept="accept"
    @dismiss="dismiss"
  />
</template>
