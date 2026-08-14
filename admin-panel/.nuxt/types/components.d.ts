
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  BlockLibrary: typeof import("../../components/BlockLibrary.vue")['default']
  ChatPanel: typeof import("../../components/ChatPanel.vue")['default']
  ConfirmHost: typeof import("../../components/ConfirmHost.vue")['default']
  ConstructorPanel: typeof import("../../components/ConstructorPanel.vue")['default']
  IntroSplash: typeof import("../../components/IntroSplash.vue")['default']
  ListEditor: typeof import("../../components/ListEditor.vue")['default']
  PageCanvas: typeof import("../../components/PageCanvas.vue")['default']
  ThemeToggle: typeof import("../../components/ThemeToggle.vue")['default']
  ToastHost: typeof import("../../components/ToastHost.vue")['default']
  BaseBadge: typeof import("../../components/base/BaseBadge.vue")['default']
  BaseButton: typeof import("../../components/base/BaseButton.vue")['default']
  BaseConfirmDialog: typeof import("../../components/base/BaseConfirmDialog.vue")['default']
  BaseDropdown: typeof import("../../components/base/BaseDropdown.vue")['default']
  BaseInput: typeof import("../../components/base/BaseInput.vue")['default']
  BaseModal: typeof import("../../components/base/BaseModal.vue")['default']
  BaseSelect: typeof import("../../components/base/BaseSelect.vue")['default']
  BaseSkeleton: typeof import("../../components/base/BaseSkeleton.vue")['default']
  BaseTabs: typeof import("../../components/base/BaseTabs.vue")['default']
  BaseTextarea: typeof import("../../components/base/BaseTextarea.vue")['default']
  BaseToast: typeof import("../../components/base/BaseToast.vue")['default']
  EditorsCatalogFilterEditor: typeof import("../../components/editors/CatalogFilterEditor.vue")['default']
  EditorsContactMapEditor: typeof import("../../components/editors/ContactMapEditor.vue")['default']
  EditorsCustomContentEditor: typeof import("../../components/editors/CustomContentEditor.vue")['default']
  EditorsFaqEditor: typeof import("../../components/editors/FaqEditor.vue")['default']
  EditorsFooterEditor: typeof import("../../components/editors/FooterEditor.vue")['default']
  EditorsGalleryEditor: typeof import("../../components/editors/GalleryEditor.vue")['default']
  EditorsGrid3ColEditor: typeof import("../../components/editors/Grid3ColEditor.vue")['default']
  EditorsHeaderEditor: typeof import("../../components/editors/HeaderEditor.vue")['default']
  EditorsHeroEditor: typeof import("../../components/editors/HeroEditor.vue")['default']
  EditorsPricingEditor: typeof import("../../components/editors/PricingEditor.vue")['default']
  EditorsStatsEditor: typeof import("../../components/editors/StatsEditor.vue")['default']
  EditorsTestimonialsEditor: typeof import("../../components/editors/TestimonialsEditor.vue")['default']
  EditorsTextImageEditor: typeof import("../../components/editors/TextImageEditor.vue")['default']
  EditorsEditorRegistry: typeof import("../../components/editors/editorRegistry")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  Icon: typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
  Motion: typeof import("@vueuse/motion")['MotionComponent']
  MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyBlockLibrary: LazyComponent<typeof import("../../components/BlockLibrary.vue")['default']>
  LazyChatPanel: LazyComponent<typeof import("../../components/ChatPanel.vue")['default']>
  LazyConfirmHost: LazyComponent<typeof import("../../components/ConfirmHost.vue")['default']>
  LazyConstructorPanel: LazyComponent<typeof import("../../components/ConstructorPanel.vue")['default']>
  LazyIntroSplash: LazyComponent<typeof import("../../components/IntroSplash.vue")['default']>
  LazyListEditor: LazyComponent<typeof import("../../components/ListEditor.vue")['default']>
  LazyPageCanvas: LazyComponent<typeof import("../../components/PageCanvas.vue")['default']>
  LazyThemeToggle: LazyComponent<typeof import("../../components/ThemeToggle.vue")['default']>
  LazyToastHost: LazyComponent<typeof import("../../components/ToastHost.vue")['default']>
  LazyBaseBadge: LazyComponent<typeof import("../../components/base/BaseBadge.vue")['default']>
  LazyBaseButton: LazyComponent<typeof import("../../components/base/BaseButton.vue")['default']>
  LazyBaseConfirmDialog: LazyComponent<typeof import("../../components/base/BaseConfirmDialog.vue")['default']>
  LazyBaseDropdown: LazyComponent<typeof import("../../components/base/BaseDropdown.vue")['default']>
  LazyBaseInput: LazyComponent<typeof import("../../components/base/BaseInput.vue")['default']>
  LazyBaseModal: LazyComponent<typeof import("../../components/base/BaseModal.vue")['default']>
  LazyBaseSelect: LazyComponent<typeof import("../../components/base/BaseSelect.vue")['default']>
  LazyBaseSkeleton: LazyComponent<typeof import("../../components/base/BaseSkeleton.vue")['default']>
  LazyBaseTabs: LazyComponent<typeof import("../../components/base/BaseTabs.vue")['default']>
  LazyBaseTextarea: LazyComponent<typeof import("../../components/base/BaseTextarea.vue")['default']>
  LazyBaseToast: LazyComponent<typeof import("../../components/base/BaseToast.vue")['default']>
  LazyEditorsCatalogFilterEditor: LazyComponent<typeof import("../../components/editors/CatalogFilterEditor.vue")['default']>
  LazyEditorsContactMapEditor: LazyComponent<typeof import("../../components/editors/ContactMapEditor.vue")['default']>
  LazyEditorsCustomContentEditor: LazyComponent<typeof import("../../components/editors/CustomContentEditor.vue")['default']>
  LazyEditorsFaqEditor: LazyComponent<typeof import("../../components/editors/FaqEditor.vue")['default']>
  LazyEditorsFooterEditor: LazyComponent<typeof import("../../components/editors/FooterEditor.vue")['default']>
  LazyEditorsGalleryEditor: LazyComponent<typeof import("../../components/editors/GalleryEditor.vue")['default']>
  LazyEditorsGrid3ColEditor: LazyComponent<typeof import("../../components/editors/Grid3ColEditor.vue")['default']>
  LazyEditorsHeaderEditor: LazyComponent<typeof import("../../components/editors/HeaderEditor.vue")['default']>
  LazyEditorsHeroEditor: LazyComponent<typeof import("../../components/editors/HeroEditor.vue")['default']>
  LazyEditorsPricingEditor: LazyComponent<typeof import("../../components/editors/PricingEditor.vue")['default']>
  LazyEditorsStatsEditor: LazyComponent<typeof import("../../components/editors/StatsEditor.vue")['default']>
  LazyEditorsTestimonialsEditor: LazyComponent<typeof import("../../components/editors/TestimonialsEditor.vue")['default']>
  LazyEditorsTextImageEditor: LazyComponent<typeof import("../../components/editors/TextImageEditor.vue")['default']>
  LazyEditorsEditorRegistry: LazyComponent<typeof import("../../components/editors/editorRegistry")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyIcon: LazyComponent<typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
  LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
  LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
