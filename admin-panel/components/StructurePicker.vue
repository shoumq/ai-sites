<script setup lang="ts">
/**
 * Экран «Структура» воронки: ручная сборка сайта из блоков + оси вёрстки.
 *
 * До него пользователь мог выбрать только тип сайта (лендинг/магазин/…), а
 * состав блоков, их вёрстку и общий характер решал ИИ — из-за чего сайты
 * выходили однотипными. Здесь любую ось можно зафиксировать, а всё, что
 * оставлено пустым («Пусть решит ИИ»), по-прежнему подбирается генератором.
 */
import {
  BLOCK_LIBRARY,
  ITEM_ACTION_LABELS,
  SECTION_VARIANTS,
  SECTION_VARIANT_LABELS,
  THEME_AXES,
  THEME_AXIS_LABELS,
  THEME_AXIS_VALUE_LABELS,
} from '~/types/site'
import type { SectionType } from '~/types/site'
import type { LayoutPreferences } from '~/types/api'

const props = defineProps<{ modelValue: LayoutPreferences; siteType: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: LayoutPreferences] }>()

// header/hero/footer не выбираются как «блоки»: они есть на каждом сайте
// всегда и ровно по одному — для них ниже отдельные селекты вариантов.
const STRUCTURAL_TYPES: SectionType[] = ['header', 'hero', 'footer']
const CHOOSABLE_BLOCKS = computed(() => BLOCK_LIBRARY.filter((b) => !STRUCTURAL_TYPES.includes(b.type)))

const AUTO_OPTION = { value: '', label: 'Пусть решит ИИ' }

function patch(part: Partial<LayoutPreferences>) {
  emit('update:modelValue', { ...props.modelValue, ...part })
}

const isManual = computed(() => props.modelValue.mode === 'manual')

function selectedIndex(type: string) {
  return props.modelValue.blocks.findIndex((b) => b.type === type)
}

function toggleBlock(type: string) {
  const index = selectedIndex(type)
  const blocks = [...props.modelValue.blocks]
  if (index === -1) blocks.push({ type, variant: '' })
  else blocks.splice(index, 1)
  patch({ blocks })
}

function setBlockVariant(type: string, variant: string) {
  patch({ blocks: props.modelValue.blocks.map((b) => (b.type === type ? { ...b, variant } : b)) })
}

function moveBlock(type: string, delta: number) {
  const index = selectedIndex(type)
  const target = index + delta
  if (index === -1 || target < 0 || target >= props.modelValue.blocks.length) return
  const blocks = [...props.modelValue.blocks]
  const [moved] = blocks.splice(index, 1)
  blocks.splice(target, 0, moved)
  patch({ blocks })
}

function variantSelectOptions(type: SectionType) {
  return [AUTO_OPTION, ...SECTION_VARIANTS[type].map((v) => ({ value: v, label: SECTION_VARIANT_LABELS[v] ?? v }))]
}

function axisOptions(axis: string) {
  return [AUTO_OPTION, ...THEME_AXES[axis].map((v) => ({ value: v, label: THEME_AXIS_VALUE_LABELS[v] ?? v }))]
}

const ACTION_OPTIONS = [
  { value: '', label: 'По типу сайта' },
  ...Object.entries(ITEM_ACTION_LABELS).map(([value, label]) => ({ value, label })),
]

const actionHint = computed(() =>
  props.siteType === 'shop'
    ? 'По умолчанию для магазина — «В корзину».'
    : 'По умолчанию — «Оставить заявку»: подходит каталогу авто, недвижимости и услуг, где корзина не нужна.',
)
</script>

<template>
  <div class="structure">
    <div class="structure__modes">
      <button
        type="button"
        class="mode-card"
        :class="{ 'is-selected': !isManual }"
        @click="patch({ mode: 'auto' })"
      >
        <Icon name="lucide:sparkles" class="mode-card__icon" />
        <h3>Пусть соберёт ИИ</h3>
        <p>Состав блоков и вёрстка подбираются под ваш бриф. Всё можно изменить потом в редакторе.</p>
      </button>
      <button
        type="button"
        class="mode-card"
        :class="{ 'is-selected': isManual }"
        @click="patch({ mode: 'manual' })"
      >
        <Icon name="lucide:layout-list" class="mode-card__icon" />
        <h3>Собрать самому</h3>
        <p>Выберите блоки, их порядок и вариант вёрстки каждого. Тексты всё равно напишет ИИ.</p>
      </button>
    </div>

    <section v-if="isManual" class="structure__blocks">
      <h4 class="structure__legend">Блоки страницы</h4>
      <div class="block-grid">
        <div
          v-for="block in CHOOSABLE_BLOCKS"
          :key="block.type"
          class="block-chip"
          :class="{ 'is-selected': selectedIndex(block.type) !== -1 }"
        >
          <button type="button" class="block-chip__toggle" @click="toggleBlock(block.type)">
            <Icon :name="block.icon" />
            <span>{{ block.label }}</span>
          </button>

          <template v-if="selectedIndex(block.type) !== -1">
            <BaseSelect
              :model-value="modelValue.blocks[selectedIndex(block.type)].variant"
              :options="variantSelectOptions(block.type)"
              @update:model-value="setBlockVariant(block.type, String($event))"
            />
            <div class="block-chip__order">
              <span class="block-chip__pos">{{ selectedIndex(block.type) + 1 }}</span>
              <button type="button" aria-label="Выше" @click="moveBlock(block.type, -1)">↑</button>
              <button type="button" aria-label="Ниже" @click="moveBlock(block.type, 1)">↓</button>
            </div>
          </template>
        </div>
      </div>
      <p v-if="!modelValue.blocks.length" class="structure__hint">
        Ничего не выбрано — сайт соберётся так же, как в режиме «Пусть соберёт ИИ».
      </p>
    </section>

    <section class="structure__axes">
      <h4 class="structure__legend">Шапка, герой и футер</h4>
      <div class="axis-grid">
        <BaseSelect
          label="Вариант шапки"
          :model-value="modelValue.header_variant"
          :options="variantSelectOptions('header')"
          @update:model-value="patch({ header_variant: String($event) })"
        />
        <BaseSelect
          label="Вариант первого экрана"
          :model-value="modelValue.hero_variant"
          :options="variantSelectOptions('hero')"
          @update:model-value="patch({ hero_variant: String($event) })"
        />
        <BaseSelect
          label="Вариант футера"
          :model-value="modelValue.footer_variant"
          :options="variantSelectOptions('footer')"
          @update:model-value="patch({ footer_variant: String($event) })"
        />
      </div>
    </section>

    <section class="structure__axes">
      <h4 class="structure__legend">Характер вёрстки</h4>
      <p class="structure__hint">Эти настройки меняют пропорции и вид сразу всех блоков сайта.</p>
      <div class="axis-grid">
        <BaseSelect
          v-for="(values, axis) in THEME_AXES"
          :key="axis"
          :label="THEME_AXIS_LABELS[axis] ?? axis"
          :model-value="(modelValue as any)[axis]"
          :options="axisOptions(axis)"
          @update:model-value="patch({ [axis]: String($event) } as Partial<LayoutPreferences>)"
        />
      </div>
    </section>

    <section class="structure__axes">
      <h4 class="structure__legend">Кнопка на карточках товаров и услуг</h4>
      <div class="axis-grid">
        <BaseSelect
          label="Действие карточки"
          :model-value="modelValue.item_action"
          :options="ACTION_OPTIONS"
          @update:model-value="patch({ item_action: String($event) })"
        />
      </div>
      <p class="structure__hint">{{ actionHint }}</p>
    </section>
  </div>
</template>

<style scoped>
.structure {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-6);
  text-align: left;
}

.structure__modes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--a-space-4);
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--a-space-2);
  padding: var(--a-space-5);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-lg);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--a-transition-fast), background var(--a-transition-fast);
}

.mode-card:hover {
  border-color: var(--a-border-strong);
}

.mode-card.is-selected {
  border-color: var(--a-accent);
  background: color-mix(in srgb, var(--a-accent) 10%, var(--a-surface));
  box-shadow: 0 0 0 1px var(--a-accent);
}

.mode-card__icon {
  font-size: 1.4rem;
  color: var(--a-accent);
}

.mode-card h3 {
  font-size: var(--a-fs-md);
}

.mode-card p {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.structure__legend {
  font-size: var(--a-fs-sm);
  font-weight: 700;
  color: var(--a-text-muted);
  margin-bottom: var(--a-space-3);
}

.structure__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  margin-top: var(--a-space-2);
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--a-space-3);
}

.block-chip {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-surface);
}

.block-chip.is-selected {
  border-color: var(--a-accent);
}

.block-chip__toggle {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  background: none;
  border: none;
  color: var(--a-text);
  font-size: var(--a-fs-sm);
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.block-chip__order {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
}

.block-chip__order button {
  width: 26px;
  height: 26px;
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-surface);
  color: var(--a-text-muted);
  cursor: pointer;
}

.block-chip__pos {
  font-size: var(--a-fs-xs);
  font-weight: 700;
  color: var(--a-accent);
}

.axis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--a-space-3);
}

@media (max-width: 640px) {
  .structure__modes {
    grid-template-columns: 1fr;
  }
}
</style>
