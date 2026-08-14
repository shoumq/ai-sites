import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// site-renderer собирает ПОЛНОСТЬЮ статический сайт: никаких рантайм-фетчей,
// весь site.json инлайнится в бандл на этапе сборки (см. pages/[...slug].vue).
// Здесь, в Node-контексте самого nuxt.config.ts (выполняется на этапе сборки,
// а не в браузере), синхронно читаем тот же файл, чтобы заполнить
// nitro.prerender.routes реальными путями страниц — без этого Nuxt не будет
// знать, какие URL генерировать для catch-all страницы [...slug].vue.
const siteDataPath = fileURLToPath(new URL('./data/site.json', import.meta.url))

interface MinimalSitePage {
  slug: string
}

interface MinimalSiteData {
  pages?: MinimalSitePage[]
}

function loadPrerenderRoutes(): string[] {
  if (!existsSync(siteDataPath)) {
    // Первый запуск до того, как site-builder положит реальный site.json —
    // не должны падать на пустом месте, генерируем хотя бы корень.
    return ['/']
  }

  try {
    const raw = readFileSync(siteDataPath, 'utf-8')
    const data = JSON.parse(raw) as MinimalSiteData
    const pages = data.pages ?? []

    if (!pages.length) return ['/']

    return pages.map((page) => (page.slug === 'main' || !page.slug ? '/' : `/${page.slug}`))
  } catch {
    // Битый/неполный JSON на этапе сборки — не роняем конфиг, генерируем корень,
    // ошибка валидации всё равно всплывёт раньше (на бэкенде через parse_site()).
    return ['/']
  }
}

export default defineNuxtConfig({
  extends: ['../site-blocks'],

  ssr: true,

  compatibilityDate: '2025-01-01',

  devtools: { enabled: false },

  nitro: {
    preset: 'static',
    prerender: {
      routes: loadPrerenderRoutes(),
      crawlLinks: false,
      failOnError: true,
    },
  },
})
