<script setup lang="ts">
import siteData from '~/data/site.json'
import type { SiteSchema } from '~/types/site'

// site.json инлайнится Vite в бандл на этапе сборки — рантайм-запросов нет.
const site = siteData as SiteSchema

// Прокидывает --primary/--primary-dark/--primary-light/--font-family на <html>
// через useHead (SSR/prerender-safe, см. site-blocks/composables/useSiteTheme.ts).
useSiteTheme(site.theme)

useHead({
  htmlAttrs: { lang: 'ru' },
  meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
})
</script>

<template>
  <div class="app-root">
    <NuxtPage />
  </div>
</template>

<style>
/* container-type здесь даёт блокам (например бургер-меню шапки) единый
   способ реагировать на реальную доступную ширину через @container — та же
   ось, что использует live-превью в admin-panel/pages/editor/[id]/index.vue
   (.editor-canvas-frame), так что поведение совпадает и в редакторе, и на
   опубликованном сайте. */
.app-root {
  container-type: inline-size;
}
</style>
