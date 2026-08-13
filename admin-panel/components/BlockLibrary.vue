<script setup lang="ts">
import draggable from 'vuedraggable'
import { BLOCK_LIBRARY, createDefaultSection } from '~/types/site'
import type { Section } from '~/types/site'

/**
 * Вкладка «Блоки»: источник для DnD на холст (components/PageCanvas.vue).
 * :list (не v-model) + put:false + sort:false — эта карусель сама никогда
 * не принимает и не переупорядочивает элементы, только отдаёт клоны через
 * :clone. group.name = 'sections' должно совпадать со значением в
 * PageCanvas.vue — это единственное, что связывает два независимых
 * draggable-инстанса в одну DnD-группу (см. SortableJS/vuedraggable docs).
 */
function cloneBlock(original: (typeof BLOCK_LIBRARY)[number]): Section {
  return createDefaultSection(original.type)
}

// Клик — альтернатива drag'у (не все успевают "поймать" перетаскивание с
// первого раза, особенно на трекпаде): вставляет блок сразу после текущего
// выделенного (если есть) или в конец страницы.
const store = useEditorStore()
const toast = useToast()

function addBlock(entry: (typeof BLOCK_LIBRARY)[number]) {
  const sections = store.currentPage?.sections ?? []
  const selectedIndex = sections.findIndex((s) => s.id === store.selectedSectionId)
  const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : sections.length
  store.insertSection(insertAt, createDefaultSection(entry.type))
  toast.success(`Блок «${entry.label}» добавлен`)
}
</script>

<template>
  <div class="block-library">
    <p class="block-library__hint">Перетащите блок на превью слева или кликните — он встанет на страницу.</p>
    <draggable
      :list="BLOCK_LIBRARY"
      :group="{ name: 'sections', pull: 'clone', put: false }"
      :sort="false"
      :clone="cloneBlock"
      item-key="type"
      tag="div"
      class="block-library__grid"
    >
      <template #item="{ element }">
        <button type="button" class="block-chip" @click="addBlock(element)">
          <span class="block-chip__icon"><Icon :name="element.icon" /></span>
          <span class="block-chip__label">{{ element.label }}</span>
          <span class="block-chip__add" aria-hidden="true"><Icon name="lucide:plus" /></span>
        </button>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.block-library {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-4);
}

.block-library__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  line-height: 1.5;
}

.block-library__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--a-space-3);
}

.block-chip {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  aspect-ratio: 1.1;
  padding: var(--a-space-3);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-lg);
  cursor: grab;
  text-align: center;
  font-family: inherit;
  transition: border-color var(--a-transition-fast), transform var(--a-transition-fast), background var(--a-transition-fast);
}
.block-chip:hover {
  border-color: var(--a-border-strong);
  background: var(--a-surface-hover);
  transform: translateY(-2px);
}
.block-chip:active {
  cursor: grabbing;
}

.block-chip__add {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--a-radius-full);
  background: var(--a-gradient-brand);
  color: #fff;
  font-size: 0.7rem;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity var(--a-transition-fast), transform var(--a-transition-fast);
}
.block-chip:hover .block-chip__add,
.block-chip:focus-visible .block-chip__add {
  opacity: 1;
  transform: scale(1);
}

.block-chip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--a-radius-md);
  background: var(--a-gradient-brand-soft);
  color: #fff;
  font-size: 1.15rem;
}

.block-chip__label {
  font-size: var(--a-fs-xs);
  font-weight: 600;
  color: var(--a-text-muted);
  line-height: 1.3;
}

.sortable-ghost .block-chip {
  opacity: 0.35;
}
</style>
