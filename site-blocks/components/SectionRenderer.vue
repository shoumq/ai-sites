<script setup lang="ts">
import type { Section } from '~/types/site'

const props = withDefaults(
  defineProps<{
    section: Section
    editable?: boolean
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
</script>

<template>
  <div
    class="site-section"
    :data-block-id="section.id"
    :data-block-type="section.type"
    :class="{ 'is-editable': editable }"
    @click="onWrapperClick"
  >
    <Header
      v-if="section.type === 'header'"
      :section="section"
      :editable="editable"
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
