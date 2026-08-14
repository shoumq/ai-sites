<script setup lang="ts">
import siteData from '~/data/site.json'
import type { Page, SiteSchema } from '~/types/site'

// Единый catch-all роут для всех страниц сайта. slug сегменты пусты для корня.
const site = siteData as SiteSchema
const route = useRoute()

const slugParam = route.params.slug
const slugSegments = Array.isArray(slugParam) ? slugParam : slugParam ? [slugParam] : []
const pageSlug = slugSegments.length ? slugSegments.join('/') : 'main'

const page = site.pages.find((p) => p.slug === pageSlug) as Page | undefined

if (!page) {
  throw createError({ statusCode: 404, statusMessage: 'Страница не найдена', fatal: true })
}

useSeoMeta({
  title: page.title || site.project_id,
})
</script>

<template>
  <div class="page">
    <SectionRenderer v-for="section in page!.sections" :key="section.id" :section="section" :editable="false" :theme="site.theme" />
  </div>
</template>
