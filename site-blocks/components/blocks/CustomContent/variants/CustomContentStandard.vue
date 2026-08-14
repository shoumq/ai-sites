<script setup lang="ts">
import type { CustomContentSection, CustomContentItem } from '~/types/site'

const props = defineProps<{
  section: CustomContentSection
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:section': [patch: Partial<CustomContentSection>]
  select: []
}>()

// В режиме редактирования правим исходный текст (**жирный**/список) как есть;
// на опубликованном сайте — рендерим уже разобранную структуру обычными
// текстовыми узлами, без v-html (см. composables/useLiteMarkdown.ts).
const blocks = computed(() => parseLiteMarkdown(props.section.body))

function updateItem(index: number, patch: Partial<CustomContentItem>) {
  const items = props.section.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
  emit('update:section', { items })
}
</script>

<template>
  <section class="custom-content">
    <div class="custom-content__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="custom-content__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок"
        @update:model-value="(v) => emit('update:section', { title: v })"
      />

      <EditableText
        v-if="editable"
        tag="div"
        class="custom-content__body custom-content__body--edit"
        :model-value="section.body"
        :editable="editable"
        multiline
        placeholder='Текст блока (поддерживается **жирный**, *курсив*, списки через "- ")'
        @update:model-value="(v) => emit('update:section', { body: v })"
      />
      <div v-else class="custom-content__body">
        <template v-for="(block, bi) in blocks" :key="bi">
          <p v-if="block.type === 'p'">
            <template v-for="(span, si) in block.spans" :key="si">
              <strong v-if="span.bold">{{ span.text }}</strong>
              <em v-else-if="span.italic">{{ span.text }}</em>
              <template v-else>{{ span.text }}</template>
            </template>
          </p>
          <ul v-else>
            <li v-for="(spans, ii) in block.items" :key="ii">
              <template v-for="(span, si) in spans" :key="si">
                <strong v-if="span.bold">{{ span.text }}</strong>
                <em v-else-if="span.italic">{{ span.text }}</em>
                <template v-else>{{ span.text }}</template>
              </template>
            </li>
          </ul>
        </template>
      </div>

      <div v-if="section.items.length || editable" class="custom-content__items">
        <div v-for="(item, i) in section.items" :key="i" class="custom-content-item">
          <EditableText
            tag="span"
            class="custom-content-item__label"
            :model-value="item.label"
            :editable="editable"
            placeholder="Название"
            @update:model-value="(v) => updateItem(i, { label: v })"
          />
          <EditableText
            tag="span"
            class="custom-content-item__value"
            :model-value="item.value"
            :editable="editable"
            placeholder="Значение"
            @update:model-value="(v) => updateItem(i, { value: v })"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-content {
  padding: var(--space-8) var(--space-5);
  background: var(--surface);
}

.custom-content__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.custom-content__title {
  font-size: var(--fs-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.custom-content__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--fs-base);
  color: var(--text-muted);
}

.custom-content__body :deep(p) {
  line-height: 1.7;
}

.custom-content__body :deep(ul) {
  margin: 0;
  padding-left: 1.3em;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.custom-content__body :deep(strong) {
  color: var(--text);
  font-weight: 700;
}

.custom-content__body--edit {
  white-space: pre-wrap;
}

.custom-content__items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.custom-content-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--border-color);
}

.custom-content-item__label {
  font-weight: 600;
  color: var(--text);
  font-size: var(--fs-sm);
}

.custom-content-item__value {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
</style>
