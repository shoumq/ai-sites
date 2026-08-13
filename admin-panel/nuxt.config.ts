// admin-panel — Nuxt 4 SPA, внутренняя админка AI-конструктора сайтов.
// extends site-blocks ради <SectionRenderer>/<EditableText>/блоков превью —
// тот же движок рендера, что видит конечный пользователь на публикации.
export default defineNuxtConfig({
  extends: ['../site-blocks'],

  // Авторизованный внутренний инструмент: SPA-режим проще для guard'ов на
  // токен и не требует SSR-хостинга рядом с FastAPI-бэкендом.
  ssr: false,

  compatibilityDate: '2025-01-01',

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxt/icon', '@vueuse/motion/nuxt'],

  css: [
    '~/assets/styles/tokens.css',
    '~/assets/styles/global.css',
  ],

  icon: {
    // Единый набор иконок по ТЗ — держим бандл маленьким, без подключения
    // остальных коллекций Iconify.
    serverBundle: {
      collections: ['lucide'],
    },
  },

  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  runtimeConfig: {
    public: {
      // Переопределяются через NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_WS_BASE
      // (будущий docker-compose пробросит их как env админки).
      apiBase: 'http://localhost:8000/api/v1',
      wsBase: 'ws://localhost:8000/api/v1',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'AI Sites — админка',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
