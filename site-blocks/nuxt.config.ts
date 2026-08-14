// site-blocks — Nuxt 4 layer (НЕ отдельное приложение, НЕТ package.json/node_modules).
// Подключается приложениями (site-renderer, admin-panel) через:
//   extends: ['../site-blocks']
// Все npm-зависимости, которые тут упоминаются (@vueuse/motion, @fontsource/*),
// должны быть объявлены в package.json приложения, которое расширяет этот layer —
// Nuxt резолвит module/css bare-спецификаторы слоя относительно node_modules
// корневого проекта, который его extends'ит.
//
// ВАЖНО: `~`/`@` внутри css/components-путей layer-конфига резолвятся относительно
// srcDir ПОТРЕБЛЯЮЩЕГО приложения, а не самого layer'а (проверено сборкой:
// `~/assets/tokens.css` резолвился в site-renderer/assets/tokens.css и не находился).
// Поэтому здесь используем абсолютные пути через import.meta.url, которые всегда
// указывают на файлы внутри site-blocks независимо от того, кто его extends'ит.
import { fileURLToPath } from 'node:url'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  modules: ['@vueuse/motion/nuxt'],

  css: [
    // design-токены генерируемого сайта
    `${currentDir}assets/tokens.css`,
    // self-hosted шрифты (см. useSiteTheme.ts) — офлайн-безопасно для `nuxi generate`,
    // без обращений к Google Fonts на этапе сборки. Импортируем только реально
    // используемые начертания (400 текст, 500/600 акценты, 700 заголовки/кнопки).
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
    '@fontsource/roboto/400.css',
    '@fontsource/roboto/500.css',
    '@fontsource/roboto/700.css',
    '@fontsource/pt-sans/400.css',
    '@fontsource/pt-sans/700.css',
    '@fontsource/montserrat/400.css',
    '@fontsource/montserrat/500.css',
    '@fontsource/montserrat/600.css',
    '@fontsource/montserrat/700.css',
  ],

  // Плоские имена компонентов вместо Nuxt-дефолта с префиксом по пути папок:
  // components/EditableText.vue          -> <EditableText>
  // components/SectionRenderer.vue       -> <SectionRenderer>
  // components/blocks/Header/Header.vue  -> <Header>                (не <BlocksHeader>)
  // components/blocks/Header/variants/HeaderStandard.vue -> <HeaderStandard>
  // Безопасно: все имена файлов внутри components/ уникальны по всему дереву.
  components: [
    { path: `${currentDir}components`, pathPrefix: false },
  ],
})
