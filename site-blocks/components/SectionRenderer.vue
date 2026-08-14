<script setup lang="ts">
import type { Section, Theme } from '~/types/site'

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
    <Header
      v-if="section.type === 'header'"
      :section="section"
      :editable="editable"
      :theme="theme"
      @update:section="onUpdateSection"
    />
    <Hero
      v-else-if="section.type === 'hero'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <TextImage
      v-else-if="section.type === 'text_image'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <Grid3Col
      v-else-if="section.type === 'grid_3col'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <Pricing
      v-else-if="section.type === 'pricing'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <Testimonials
      v-else-if="section.type === 'testimonials'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <ContactMap
      v-else-if="section.type === 'contact_map'"
      :section="section"
      :editable="editable"
      @update:section="onUpdateSection"
    />
    <Footer
      v-else-if="section.type === 'footer'"
      :section="section"
      :editable="editable"
      :theme="theme"
      @update:section="onUpdateSection"
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
