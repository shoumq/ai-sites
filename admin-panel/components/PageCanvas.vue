<script setup lang="ts">
import draggable from 'vuedraggable'
import { SECTION_TYPE_LABELS } from '~/types/site'
import type { SectionType } from '~/types/site'

/**
 * Холст редактора: рендерит секции текущей страницы через <SectionRenderer>
 * (из site-blocks) внутри vuedraggable-списка. group.name = 'sections'
 * совпадает с BlockLibrary.vue — оттуда прилетают клоны новых блоков и
 * вставляются в отпущенную позицию; drag ЭТОГО списка сам по себе
 * переставляет уже существующие блоки. handle ограничивает старт
 * перетаскивания собственной "ручкой" блока, чтобы клик по тексту
 * (contenteditable из EditableText) не конфликтовал с началом drag.
 */
const store = useEditorStore()

const sections = computed({
  get: () => store.currentPage?.sections ?? [],
  set: (value) => store.setPageSections(value),
})

function onSelect(id: string) {
  store.selectSection(id)
}

function onUpdateSection(id: string, patch: Record<string, unknown>) {
  store.updateSection(id, patch)
}

// Кнопки ▲/▼ — альтернатива drag'у для перестановки (не у всех с первого
// раза получается "поймать" ручку мышью, плюс это доступно с клавиатуры).
function moveSection(index: number, dir: -1 | 1) {
  const list = sections.value.slice()
  const target = index + dir
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target], list[index]]
  store.setPageSections(list)
}
</script>

<template>
  <div class="page-canvas">
    <draggable
      v-model="sections"
      :group="{ name: 'sections', pull: true, put: true }"
      item-key="id"
      handle=".canvas-block__handle"
      :animation="220"
      ghost-class="page-canvas__ghost"
      chosen-class="page-canvas__chosen"
      tag="div"
      class="page-canvas__list"
    >
      <template #item="{ element, index }">
        <div
          class="canvas-block"
          :class="{ 'is-selected': store.selectedSectionId === element.id }"
        >
          <div class="canvas-block__toolbar">
            <span class="canvas-block__handle" title="Перетащить блок">
              <Icon name="lucide:grip-vertical" />
            </span>
            <span class="canvas-block__type">{{ SECTION_TYPE_LABELS[element.type as SectionType] }}</span>
            <span class="canvas-block__move">
              <button
                type="button"
                :disabled="index === 0"
                title="Переместить выше"
                @click="moveSection(index, -1)"
              >
                <Icon name="lucide:chevron-up" />
              </button>
              <button
                type="button"
                :disabled="index === sections.length - 1"
                title="Переместить ниже"
                @click="moveSection(index, 1)"
              >
                <Icon name="lucide:chevron-down" />
              </button>
            </span>
          </div>
          <SectionRenderer
            :section="element"
            :editable="true"
            :theme="store.site?.theme"
            @select="onSelect(element.id)"
            @update:section="(patch: Record<string, unknown>) => onUpdateSection(element.id, patch)"
          />
        </div>
      </template>
    </draggable>

    <div v-if="sections.length === 0" class="page-canvas__empty">
      <Icon name="lucide:layout-panel-top" />
      <p>На этой странице пока нет блоков</p>
      <span>Перетащите блок со вкладки «Блоки» справа</span>
    </div>
  </div>
</template>

<style scoped>
.page-canvas {
  min-height: 100%;
}

.page-canvas__list {
  min-height: 200px;
}

.canvas-block {
  position: relative;
  outline: 2px solid transparent;
  outline-offset: -2px;
  transition: outline-color var(--a-transition-fast);
}

.canvas-block:hover {
  outline-color: color-mix(in srgb, var(--a-accent) 45%, transparent);
}

.canvas-block.is-selected {
  outline-color: var(--a-accent);
}

.canvas-block__toolbar {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px 3px 4px;
  background: var(--a-bg-elevated);
  border: 1px solid var(--a-border-strong);
  border-radius: var(--a-radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--a-text-muted);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity var(--a-transition-fast), transform var(--a-transition-fast);
  pointer-events: none;
}

.canvas-block:hover .canvas-block__toolbar,
.canvas-block.is-selected .canvas-block__toolbar {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.canvas-block__handle {
  display: inline-flex;
  color: var(--a-text-faint);
  cursor: grab;
}
.canvas-block__handle:active {
  cursor: grabbing;
}

.canvas-block__move {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px solid var(--a-border-strong);
}

.canvas-block__move button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--a-radius-sm);
  color: var(--a-text-faint);
  cursor: pointer;
  transition: background var(--a-transition-fast), color var(--a-transition-fast);
}

.canvas-block__move button:hover:not(:disabled) {
  background: var(--a-surface);
  color: var(--a-text);
}

.canvas-block__move button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-canvas__ghost {
  opacity: 0.4;
  outline: 2px dashed var(--a-accent);
}

.page-canvas__chosen .canvas-block__toolbar {
  opacity: 1;
}

.page-canvas__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  padding: var(--a-space-8) var(--a-space-5);
  color: var(--a-text-faint);
  text-align: center;
  border: 1px dashed var(--a-border-strong);
  border-radius: var(--a-radius-lg);
  margin: var(--a-space-5);
}
.page-canvas__empty :deep(svg) {
  font-size: 2rem;
}
.page-canvas__empty span {
  font-size: var(--a-fs-xs);
}
</style>
