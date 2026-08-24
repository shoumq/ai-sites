<script setup lang="ts">
import type { SandboxItem, SandboxSection } from '~/types/site'

const props = defineProps<{ section: SandboxSection; editable?: boolean }>()
const emit = defineEmits<{ 'update:section': [patch: Partial<SandboxSection>]; select: [] }>()

const canvas = ref<HTMLElement | null>(null)
type Gesture = {
  pointerId: number
  index: number
  mode: 'move' | 'resize'
  startX: number
  startY: number
  item: SandboxItem
  width: number
}
const gesture = ref<Gesture | null>(null)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function styleFor(item: SandboxItem) {
  return {
    left: `${item.x}%`,
    top: `${item.y}px`,
    width: `${item.width}%`,
    height: `${item.height}px`,
    borderRadius: `${item.radius}px`,
    background: item.background || undefined,
    color: item.color || undefined,
  }
}

function begin(event: PointerEvent, index: number, mode: 'move' | 'resize') {
  if (!props.editable || !canvas.value) return
  const source = props.section.items[index]
  if (!source) return
  event.preventDefault()
  event.stopPropagation()
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  gesture.value = {
    pointerId: event.pointerId,
    index,
    mode,
    startX: event.clientX,
    startY: event.clientY,
    item: { ...source },
    width: canvas.value.getBoundingClientRect().width,
  }
}

function move(event: PointerEvent) {
  const active = gesture.value
  if (!active || event.pointerId !== active.pointerId) return
  const dx = event.clientX - active.startX
  const dy = event.clientY - active.startY
  const next = { ...active.item }
  if (active.mode === 'move') {
    next.x = clamp(active.item.x + (dx / active.width) * 100, 0, 100 - active.item.width)
    next.y = Math.round(clamp(active.item.y + dy, 0, props.section.min_height - active.item.height))
  } else {
    next.width = clamp(active.item.width + (dx / active.width) * 100, 8, 100 - active.item.x)
    next.height = Math.round(clamp(active.item.height + dy, 40, props.section.min_height - active.item.y))
  }
  const items = props.section.items.map((item, index) => (index === active.index ? next : item))
  emit('update:section', { items })
}

function end(event: PointerEvent) {
  if (gesture.value?.pointerId !== event.pointerId) return
  gesture.value = null
}

function preventEditableNavigation(event: MouseEvent) {
  if (props.editable) event.preventDefault()
}
</script>

<template>
  <section class="sandbox-section">
    <div class="sandbox-section__inner">
      <EditableText
        v-if="section.title || editable"
        tag="h2"
        class="sandbox-section__title"
        :model-value="section.title"
        :editable="editable"
        placeholder="Заголовок песочницы"
        @update:model-value="(value) => emit('update:section', { title: value })"
      />

      <div
        ref="canvas"
        class="sandbox-canvas"
        :class="{ 'is-editable': editable, 'shows-grid': editable && section.show_grid }"
        :style="{ minHeight: `${section.min_height}px` }"
      >
        <article
          v-for="(item, index) in section.items"
          :key="item.id"
          class="sandbox-item"
          :class="[`is-${item.kind}`, { 'is-active': gesture?.index === index }]"
          :style="styleFor(item)"
          @pointerdown="begin($event, index, 'move')"
          @pointermove="move"
          @pointerup="end"
          @pointercancel="end"
        >
          <img v-if="item.kind === 'image' && item.image" :src="item.image" alt="" draggable="false">
          <div v-else-if="item.kind === 'image'" class="sandbox-item__placeholder"><span>Фото</span></div>
          <a v-else-if="item.kind === 'button'" :href="item.href || '#'" class="sandbox-item__button" @click="preventEditableNavigation">{{ item.content || 'Кнопка' }}</a>
          <p v-else class="sandbox-item__content">{{ item.content || (item.kind === 'card' ? 'Карточка' : 'Текст') }}</p>

          <span v-if="editable" class="sandbox-item__grab" title="Перетащить"><span /><span /><span /><span /></span>
          <button
            v-if="editable"
            type="button"
            class="sandbox-item__resize"
            aria-label="Изменить размер"
            @pointerdown="begin($event, index, 'resize')"
            @pointermove="move"
            @pointerup="end"
            @pointercancel="end"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sandbox-section { padding: var(--section-py) var(--space-5); background: var(--surface); }
.sandbox-section__inner { max-width: var(--container); margin: 0 auto; display: flex; flex-direction: column; gap: var(--stack-gap); }
.sandbox-section__title { color: var(--text); font-size: var(--fs-3xl); text-align: center; }
.sandbox-canvas { position: relative; overflow: hidden; border: 1px solid var(--border-color); border-radius: var(--radius-block); background: color-mix(in srgb, var(--surface-muted) 74%, transparent); box-shadow: var(--shadow-md), inset 0 1px 0 color-mix(in srgb, white 18%, transparent); }
.sandbox-canvas.shows-grid { background-image: linear-gradient(color-mix(in srgb, var(--text) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--text) 6%, transparent) 1px, transparent 1px); background-size: 24px 24px; }
.sandbox-item { position: absolute; min-width: 8%; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid color-mix(in srgb, var(--border-color) 78%, white); background: color-mix(in srgb, var(--surface) 72%, transparent); color: var(--text); box-shadow: var(--shadow-md), inset 0 1px 0 color-mix(in srgb, white 22%, transparent); backdrop-filter: blur(24px) saturate(160%); -webkit-backdrop-filter: blur(24px) saturate(160%); transition: box-shadow var(--transition-fast), border-color var(--transition-fast); touch-action: none; }
.sandbox-item.is-text { border-color: transparent; background: transparent; box-shadow: none; backdrop-filter: none; }
.sandbox-item.is-button { border: 0; background: var(--primary); color: #fff; box-shadow: 0 12px 30px -14px var(--primary); }
.sandbox-item.is-image img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.sandbox-item__placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: var(--text-muted); background: var(--surface-muted); }
.sandbox-item__content { width: 100%; padding: var(--card-p); font-size: var(--fs-lg); font-weight: 650; line-height: 1.25; white-space: pre-wrap; }
.sandbox-item.is-text .sandbox-item__content { padding: var(--space-2); font-size: var(--fs-2xl); letter-spacing: -.025em; }
.sandbox-item__button { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: var(--space-3); color: inherit; text-decoration: none; font-weight: 700; }
.sandbox-canvas.is-editable .sandbox-item { cursor: grab; outline: 1px solid color-mix(in srgb, var(--primary) 46%, transparent); }
.sandbox-canvas.is-editable .sandbox-item:active, .sandbox-item.is-active { cursor: grabbing; border-color: var(--primary); box-shadow: 0 18px 44px -18px var(--primary); }
.sandbox-item__grab { position: absolute; top: 7px; left: 7px; width: 24px; height: 18px; display: grid; grid-template-columns: repeat(2, 3px); place-content: center; gap: 3px; border-radius: 8px; background: color-mix(in srgb, var(--surface) 74%, transparent); pointer-events: none; }
.sandbox-item__grab span { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); }
.sandbox-item__resize { position: absolute; right: 6px; bottom: 6px; width: 18px; height: 18px; padding: 0; border: 0; border-right: 3px solid var(--primary); border-bottom: 3px solid var(--primary); border-radius: 0 0 5px 0; background: transparent; cursor: nwse-resize; touch-action: none; }
@media (prefers-reduced-transparency: reduce) { .sandbox-item { background: var(--surface); backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .sandbox-item { transition: none; } }
</style>
