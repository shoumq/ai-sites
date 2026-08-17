<script setup lang="ts">
import type { LeadFormSection } from '~/types/site'

defineProps<{ section: LeadFormSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()
const { variantOptions } = useVariantOptions()

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'tel', label: 'Телефон' },
  { value: 'email', label: 'E-mail' },
  { value: 'textarea', label: 'Многострочный текст' },
  { value: 'select', label: 'Выпадающий список' },
]
</script>

<template>
  <BaseSelect
    label="Вариант блока"
    :model-value="section.variant"
    :options="variantOptions('lead_form')"
    @update:model-value="emit('patch', { variant: $event })"
  />
  <BaseInput label="Заголовок" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <BaseTextarea label="Подзаголовок" :model-value="section.subtitle" @update:model-value="emit('patch', { subtitle: $event })" />
  <BaseInput
    v-if="section.variant === 'split'"
    label="Ссылка на изображение"
    :model-value="section.image"
    @update:model-value="emit('patch', { image: $event })"
  />
  <BaseInput label="Текст кнопки" :model-value="section.submit_text" @update:model-value="emit('patch', { submit_text: $event })" />
  <BaseTextarea
    label="Текст после отправки"
    :model-value="section.success_text"
    @update:model-value="emit('patch', { success_text: $event })"
  />
  <BaseInput
    label="Текст согласия 152-ФЗ (пусто — из настроек проекта)"
    :model-value="section.consent_text"
    @update:model-value="emit('patch', { consent_text: $event })"
  />

  <div class="field-label">Поля формы</div>
  <p class="field-hint">
    Поля с именами <code>name</code>, <code>phone</code>, <code>email</code>, <code>message</code> попадают в
    одноимённые колонки списка заявок. Любое другое имя уедет в дополнительные поля заявки.
  </p>
  <ListEditor
    :items="section.fields"
    add-label="поле"
    :new-item="() => ({ name: 'field', label: 'Новое поле', type: 'text', required: false, placeholder: '', options: [] })"
    @update:items="emit('patch', { fields: $event })"
  >
    <template #default="{ item, update }">
      <BaseInput placeholder="Имя поля (латиницей)" :model-value="item.name" @update:model-value="update({ name: $event })" />
      <BaseInput placeholder="Подпись" :model-value="item.label" @update:model-value="update({ label: $event })" />
      <BaseSelect :model-value="item.type" :options="FIELD_TYPES" @update:model-value="update({ type: $event })" />
      <BaseInput placeholder="Подсказка внутри поля" :model-value="item.placeholder" @update:model-value="update({ placeholder: $event })" />
      <BaseInput
        v-if="item.type === 'select'"
        placeholder="Варианты через запятую"
        :model-value="item.options.join(', ')"
        @update:model-value="update({ options: $event.split(',').map((o: string) => o.trim()).filter(Boolean) })"
      />
      <label class="checkbox-row">
        <input type="checkbox" :checked="item.required" @change="update({ required: ($event.target as HTMLInputElement).checked })">
        Обязательное
      </label>
    </template>
  </ListEditor>
</template>

<style scoped>
.field-hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  margin: calc(var(--a-space-2) * -1) 0 0;
}

.field-hint code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--a-surface);
  font-size: 0.95em;
}
</style>
