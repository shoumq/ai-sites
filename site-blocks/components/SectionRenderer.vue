<script setup lang="ts">
import type { Section, Theme } from '~/types/site'
import { SECTION_COMPONENT_MAP } from './blockRegistry'

const props = withDefaults(
  defineProps<{
    section: Section
    editable?: boolean
    // Нужна только Header/Footer (лого — theme.logo_url), но проп общий и
    // необязательный — остальным блокам передавать не нужно.
    theme?: Theme
  }>(),
  { editable: false },
)

const emit = defineEmits<{
  'update:section': [patch: Partial<Section>]
  select: []
}>()

// Единая точка коммита патча секции наружу — все блок-компоненты эмитят
//'update:section' с частичным патчем своего же типа, здесь просто ретранслируем.
function onUpdateSection(patch: Record<string, unknown>) {
  emit('update:section', patch as Partial<Section>)
}

// 'select' триггерится ЕДИНОЖДЫ здесь через нативный bubbling клика из любого
// вложенного блок-компонента — сами блоки/варианты объявляют 'select' в своих
// emits (по контракту), но не обязаны сами его вызывать, чтобы не было двойных
// срабатываний на один клик.
function onWrapperClick() {
  if (props.editable) emit('select')
}

// Фон блока: --surface — обычная CSS-переменная, наследуется вниз по DOM
// независимо от Vue scoped-стилей. Задав её инлайн-стилем на этой обёртке,
// переопределяем фон ВНУТРИ конкретного блока (все варианты уже используют
// background: var(--surface) в своих корневых селекторах), не трогая ни один
// из файлов вариантов блоков. Пусто — не переопределяем, наследуется фон
// сайта (theme.bg_color, см. composables/useSiteTheme.ts) либо дефолт.
const wrapperStyle = computed(() => (props.section.bg_color ? { '--surface': props.section.bg_color } : undefined))

const component = computed(() => SECTION_COMPONENT_MAP[props.section.type])
// theme нужен только Header/Footer — остальным компонентам передавать
// undefined, иначе Vue уронит объект как fallthrough-атрибут на корневой
// элемент (theme="[object Object]"), т.к. они его не объявляют в props.
const sectionTheme = computed(() => (props.section.type === 'header' || props.section.type === 'footer' ? props.theme : undefined))
</script>

<template>
  <div
    class="site-section"
    :data-block-id="section.id"
    :data-block-type="section.type"
    :class="{ 'is-editable': editable }"
    :style="wrapperStyle"
    @click="onWrapperClick"
  >
    <component
      :is="component"
      :section="section"
      :editable="editable"
      :theme="sectionTheme"
      @update:section="onUpdateSection"
      @select="emit('select')"
    />
  </div>
</template>

<style scoped>
.site-section {
  position: relative;
}

.site-section.is-editable {
  cursor: default;
}
</style>
