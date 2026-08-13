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
</script>

<template>
  <div class="block-library">
    <p class="block-library__hint">Перетащите блок на превью слева — он встанет в отпущенное место.</p>
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
        <div class="block-chip">
          <span class="block-chip__icon"><Icon :name="element.icon" /></span>
          <span class="block-chip__label">{{ element.label }}</span>
        </div>
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
