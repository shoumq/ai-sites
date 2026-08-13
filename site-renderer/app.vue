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
  <NuxtPage />
</template>
