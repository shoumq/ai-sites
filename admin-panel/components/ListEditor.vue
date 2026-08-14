<script setup lang="ts" generic="T extends object">
import draggable from 'vuedraggable'

/**
 * Универсальный редактор списков (пункты меню, услуги, тарифы, отзывы,
 * ссылки футера…) — добавление/удаление и перетаскивание порядка через
 * vuedraggable. Элементы схемы (NavItem/ServiceItem/…) не имеют своего id,
 * поэтому item-key — функция по индексу элемента В ИСХОДНОМ массиве (а не
 * по индексу текущей строки рендера) — так Sortable корректно сопоставляет
 * DOM-узлы при перетаскивании.
 */
const props = defineProps<{
  items: T[]
  newItem: () => T
  addLabel: string
}>()

const emit = defineEmits<{ 'update:items': [items: T[]] }>()

const localItems = computed<T[]>({
  get: () => props.items,
  set: (value) => emit('update:items', value),
})

function keyOf(item: T) {
  return String(props.items.indexOf(item))
}

function updateAt(index: number, patch: Partial<T>) {
  const next = props.items.slice()
  next[index] = { ...next[index], ...patch } as T
  emit('update:items', next)
}

function removeAt(index: number) {
  emit('update:items', props.items.filter((_, i) => i !== index))
}

function add() {
  emit('update:items', [...props.items, props.newItem()])
}
</script>

<template>
  <div class="list-editor">
    <draggable
      v-model="localItems"
      :item-key="keyOf"
      handle=".list-editor__handle"
      :animation="180"
      ghost-class="list-editor__ghost"
      tag="div"
      class="list-editor__rows"
    >
      <template #item="{ element, index }">
        <div class="list-editor__row">
          <span class="list-editor__handle" title="Перетащить">
            <Icon name="lucide:grip-vertical" />
          </span>
          <div class="list-editor__fields">
            <slot :item="element" :update="(patch: Partial<T>) => updateAt(index, patch)" :index="index" />
          </div>
          <button type="button" class="list-editor__remove" aria-label="Удалить" @click="removeAt(index)">
            <Icon name="lucide:x" />
          </button>
        </div>
      </template>
    </draggable>

    <button type="button" class="list-editor__add" @click="add">
      <Icon name="lucide:plus" /> Добавить {{ addLabel }}
    </button>
  </div>
</template>

<style scoped>
.list-editor {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
}

.list-editor__rows {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
}

.list-editor__row {
  display: flex;
  align-items: flex-start;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
}

.list-editor__ghost {
  opacity: 0.4;
}

.list-editor__handle {
  display: flex;
  align-items: center;
  height: 42px;
  color: var(--a-text-faint);
  cursor: grab;
  flex-shrink: 0;
  touch-action: none;
}
.list-editor__handle:active {
  cursor: grabbing;
}

.list-editor__fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
}

.list-editor__remove {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-top: 6px;
  border-radius: var(--a-radius-sm);
  background: transparent;
  border: none;
  color: var(--a-text-faint);
  cursor: pointer;
  transition: color var(--a-transition-fast), background var(--a-transition-fast);
}
.list-editor__remove:hover {
  color: var(--a-error);
  background: var(--a-error-bg);
}

.list-editor__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  border: 1px dashed var(--a-border-strong);
  border-radius: var(--a-radius-md);
  background: transparent;
  color: var(--a-text-muted);
  font-size: var(--a-fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--a-transition-fast), color var(--a-transition-fast), background var(--a-transition-fast);
}
.list-editor__add:hover {
  border-color: var(--a-accent);
  color: var(--a-text);
  background: var(--a-surface);
}
</style>
