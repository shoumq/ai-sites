<script setup lang="ts">
import type { SandboxItem, SandboxSection } from '~/types/site'

defineProps<{ section: SandboxSection }>()
const emit = defineEmits<{ patch: [p: Record<string, unknown>] }>()

const KIND_OPTIONS = [
  { value: 'text', label: 'Текст' },
  { value: 'card', label: 'Стеклянная карточка' },
  { value: 'button', label: 'Кнопка' },
  { value: 'image', label: 'Изображение' },
]

function newItem(): SandboxItem {
  return {
    id: `sandbox-${Math.random().toString(36).slice(2, 9)}`,
    kind: 'card',
    x: 8,
    y: 64,
    width: 38,
    height: 180,
    content: 'Новый элемент',
    href: '#',
    image: '',
    background: '',
    color: '',
    radius: 24,
  }
}
</script>

<template>
  <BaseInput label="Заголовок" :model-value="section.title" @update:model-value="emit('patch', { title: $event })" />
  <label class="sandbox-range">
    <span>Высота холста <strong>{{ section.min_height }} px</strong></span>
    <input type="range" min="240" max="1200" step="20" :value="section.min_height" @input="emit('patch', { min_height: Number(($event.target as HTMLInputElement).value) })">
  </label>
  <label class="checkbox-row">
    <input type="checkbox" :checked="section.show_grid" @change="emit('patch', { show_grid: ($event.target as HTMLInputElement).checked })">
    Показывать сетку при редактировании
  </label>
  <p class="sandbox-hint"><Icon name="lucide:mouse-pointer-2" /> Элементы можно двигать прямо на превью и растягивать за угол, как в графическом редакторе.</p>

  <div class="field-label">Элементы песочницы</div>
  <ListEditor :items="section.items" add-label="элемент" :new-item="newItem" @update:items="emit('patch', { items: $event })">
    <template #default="{ item, update }">
      <BaseSelect :model-value="item.kind" :options="KIND_OPTIONS" @update:model-value="update({ kind: $event as SandboxItem['kind'] })" />
      <BaseTextarea v-if="item.kind !== 'image'" label="Содержимое" :model-value="item.content" :rows="2" @update:model-value="update({ content: $event })" />
      <BaseInput v-if="item.kind === 'button'" label="Ссылка" :model-value="item.href" placeholder="#contact или https://…" @update:model-value="update({ href: $event })" />
      <BaseInput v-if="item.kind === 'image'" label="URL изображения" :model-value="item.image" placeholder="https://…" @update:model-value="update({ image: $event })" />

      <div class="sandbox-geometry">
        <label><span>X: {{ Math.round(item.x) }}%</span><input type="range" min="0" max="92" :value="item.x" @input="update({ x: Number(($event.target as HTMLInputElement).value) })"></label>
        <label><span>Y: {{ item.y }} px</span><input type="range" min="0" :max="Math.max(0, section.min_height - item.height)" :value="item.y" @input="update({ y: Number(($event.target as HTMLInputElement).value) })"></label>
        <label><span>Ширина: {{ Math.round(item.width) }}%</span><input type="range" min="8" :max="100 - item.x" :value="item.width" @input="update({ width: Number(($event.target as HTMLInputElement).value) })"></label>
        <label><span>Высота: {{ item.height }} px</span><input type="range" min="40" :max="Math.max(40, section.min_height - item.y)" :value="item.height" @input="update({ height: Number(($event.target as HTMLInputElement).value) })"></label>
        <label><span>Скругление: {{ item.radius }} px</span><input type="range" min="0" max="64" :value="item.radius" @input="update({ radius: Number(($event.target as HTMLInputElement).value) })"></label>
      </div>

      <div class="sandbox-colors">
        <label><span>Фон</span><input type="color" :value="item.background || '#ffffff'" @input="update({ background: ($event.target as HTMLInputElement).value })"></label>
        <BaseButton v-if="item.background" variant="ghost" size="sm" @click="update({ background: '' })">Авто</BaseButton>
        <label><span>Текст</span><input type="color" :value="item.color || '#111827'" @input="update({ color: ($event.target as HTMLInputElement).value })"></label>
        <BaseButton v-if="item.color" variant="ghost" size="sm" @click="update({ color: '' })">Авто</BaseButton>
      </div>
    </template>
  </ListEditor>
</template>

<style scoped>
.sandbox-range { display: flex; flex-direction: column; gap: 7px; color: var(--a-text-muted); font-size: var(--a-fs-xs); }
.sandbox-range strong { color: var(--a-accent); }
.sandbox-range input, .sandbox-geometry input { width: 100%; accent-color: var(--a-accent); }
.sandbox-hint { display: flex; align-items: flex-start; gap: 7px; padding: var(--a-space-3); border-radius: var(--a-radius-md); background: var(--a-info-bg); color: var(--a-info); font-size: var(--a-fs-xs); }
.sandbox-geometry { display: grid; grid-template-columns: 1fr 1fr; gap: var(--a-space-3); padding: var(--a-space-3); border: 1px solid var(--a-border); border-radius: var(--a-radius-md); }
.sandbox-geometry label { display: flex; flex-direction: column; gap: 5px; color: var(--a-text-faint); font-size: var(--a-fs-xs); }
.sandbox-geometry label:last-child { grid-column: 1 / -1; }
.sandbox-colors { display: flex; align-items: center; gap: var(--a-space-2); flex-wrap: wrap; }
.sandbox-colors label { display: flex; align-items: center; gap: 6px; color: var(--a-text-faint); font-size: var(--a-fs-xs); }
.sandbox-colors input { width: 34px; height: 30px; padding: 2px; border: 1px solid var(--a-border); border-radius: 9px; background: var(--a-surface); }
</style>
