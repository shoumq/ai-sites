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

  // Docker на Windows (bind-mount хостовой папки в контейнер) не пробрасывает
  // inotify-события при правке файлов с хоста — Vite ничего не видит без
  // polling. Без этого HMR тихо не срабатывает вообще (правки применяются
  // только после ручного restart контейнера).
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 300,
      },
    },
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
      script: [
        {
          // Выставляет data-theme СИНХРОННО, до первой отрисовки — иначе
          // при ssr:false страница на мгновение мелькнёт дефолтной темой,
          // прежде чем stores/theme.ts (Pinia, монтируется вместе с app.vue)
          // успеет её переопределить. Ключ 'ai-sites:theme' — тот же, что
          // читает/пишет useThemeStore, оба должны меняться синхронно.
          innerHTML: `(function(){try{var t=localStorage.getItem('ai-sites:theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
        },
      ],
    },
  },
})
