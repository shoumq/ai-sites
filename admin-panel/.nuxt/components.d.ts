
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


export const BlockLibrary: typeof import("../components/BlockLibrary.vue")['default']
export const ChatPanel: typeof import("../components/ChatPanel.vue")['default']
export const ConfirmHost: typeof import("../components/ConfirmHost.vue")['default']
export const ConstructorPanel: typeof import("../components/ConstructorPanel.vue")['default']
export const IntroSplash: typeof import("../components/IntroSplash.vue")['default']
export const ListEditor: typeof import("../components/ListEditor.vue")['default']
export const PageCanvas: typeof import("../components/PageCanvas.vue")['default']
export const ThemeToggle: typeof import("../components/ThemeToggle.vue")['default']
export const ToastHost: typeof import("../components/ToastHost.vue")['default']
export const BaseBadge: typeof import("../components/base/BaseBadge.vue")['default']
export const BaseButton: typeof import("../components/base/BaseButton.vue")['default']
export const BaseConfirmDialog: typeof import("../components/base/BaseConfirmDialog.vue")['default']
export const BaseDropdown: typeof import("../components/base/BaseDropdown.vue")['default']
export const BaseInput: typeof import("../components/base/BaseInput.vue")['default']
export const BaseModal: typeof import("../components/base/BaseModal.vue")['default']
export const BaseSelect: typeof import("../components/base/BaseSelect.vue")['default']
export const BaseSkeleton: typeof import("../components/base/BaseSkeleton.vue")['default']
export const BaseTabs: typeof import("../components/base/BaseTabs.vue")['default']
export const BaseTextarea: typeof import("../components/base/BaseTextarea.vue")['default']
export const BaseToast: typeof import("../components/base/BaseToast.vue")['default']
export const EditorsCatalogFilterEditor: typeof import("../components/editors/CatalogFilterEditor.vue")['default']
export const EditorsContactMapEditor: typeof import("../components/editors/ContactMapEditor.vue")['default']
export const EditorsCustomContentEditor: typeof import("../components/editors/CustomContentEditor.vue")['default']
export const EditorsFaqEditor: typeof import("../components/editors/FaqEditor.vue")['default']
export const EditorsFooterEditor: typeof import("../components/editors/FooterEditor.vue")['default']
export const EditorsGalleryEditor: typeof import("../components/editors/GalleryEditor.vue")['default']
export const EditorsGrid3ColEditor: typeof import("../components/editors/Grid3ColEditor.vue")['default']
export const EditorsHeaderEditor: typeof import("../components/editors/HeaderEditor.vue")['default']
export const EditorsHeroEditor: typeof import("../components/editors/HeroEditor.vue")['default']
export const EditorsPricingEditor: typeof import("../components/editors/PricingEditor.vue")['default']
export const EditorsStatsEditor: typeof import("../components/editors/StatsEditor.vue")['default']
export const EditorsTestimonialsEditor: typeof import("../components/editors/TestimonialsEditor.vue")['default']
export const EditorsTextImageEditor: typeof import("../components/editors/TextImageEditor.vue")['default']
export const EditorsEditorRegistry: typeof import("../components/editors/editorRegistry")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Icon: typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
export const Motion: typeof import("@vueuse/motion")['MotionComponent']
export const MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyBlockLibrary: LazyComponent<typeof import("../components/BlockLibrary.vue")['default']>
export const LazyChatPanel: LazyComponent<typeof import("../components/ChatPanel.vue")['default']>
export const LazyConfirmHost: LazyComponent<typeof import("../components/ConfirmHost.vue")['default']>
export const LazyConstructorPanel: LazyComponent<typeof import("../components/ConstructorPanel.vue")['default']>
export const LazyIntroSplash: LazyComponent<typeof import("../components/IntroSplash.vue")['default']>
export const LazyListEditor: LazyComponent<typeof import("../components/ListEditor.vue")['default']>
export const LazyPageCanvas: LazyComponent<typeof import("../components/PageCanvas.vue")['default']>
export const LazyThemeToggle: LazyComponent<typeof import("../components/ThemeToggle.vue")['default']>
export const LazyToastHost: LazyComponent<typeof import("../components/ToastHost.vue")['default']>
export const LazyBaseBadge: LazyComponent<typeof import("../components/base/BaseBadge.vue")['default']>
export const LazyBaseButton: LazyComponent<typeof import("../components/base/BaseButton.vue")['default']>
export const LazyBaseConfirmDialog: LazyComponent<typeof import("../components/base/BaseConfirmDialog.vue")['default']>
export const LazyBaseDropdown: LazyComponent<typeof import("../components/base/BaseDropdown.vue")['default']>
export const LazyBaseInput: LazyComponent<typeof import("../components/base/BaseInput.vue")['default']>
export const LazyBaseModal: LazyComponent<typeof import("../components/base/BaseModal.vue")['default']>
export const LazyBaseSelect: LazyComponent<typeof import("../components/base/BaseSelect.vue")['default']>
export const LazyBaseSkeleton: LazyComponent<typeof import("../components/base/BaseSkeleton.vue")['default']>
export const LazyBaseTabs: LazyComponent<typeof import("../components/base/BaseTabs.vue")['default']>
export const LazyBaseTextarea: LazyComponent<typeof import("../components/base/BaseTextarea.vue")['default']>
export const LazyBaseToast: LazyComponent<typeof import("../components/base/BaseToast.vue")['default']>
export const LazyEditorsCatalogFilterEditor: LazyComponent<typeof import("../components/editors/CatalogFilterEditor.vue")['default']>
export const LazyEditorsContactMapEditor: LazyComponent<typeof import("../components/editors/ContactMapEditor.vue")['default']>
export const LazyEditorsCustomContentEditor: LazyComponent<typeof import("../components/editors/CustomContentEditor.vue")['default']>
export const LazyEditorsFaqEditor: LazyComponent<typeof import("../components/editors/FaqEditor.vue")['default']>
export const LazyEditorsFooterEditor: LazyComponent<typeof import("../components/editors/FooterEditor.vue")['default']>
export const LazyEditorsGalleryEditor: LazyComponent<typeof import("../components/editors/GalleryEditor.vue")['default']>
export const LazyEditorsGrid3ColEditor: LazyComponent<typeof import("../components/editors/Grid3ColEditor.vue")['default']>
export const LazyEditorsHeaderEditor: LazyComponent<typeof import("../components/editors/HeaderEditor.vue")['default']>
export const LazyEditorsHeroEditor: LazyComponent<typeof import("../components/editors/HeroEditor.vue")['default']>
export const LazyEditorsPricingEditor: LazyComponent<typeof import("../components/editors/PricingEditor.vue")['default']>
export const LazyEditorsStatsEditor: LazyComponent<typeof import("../components/editors/StatsEditor.vue")['default']>
export const LazyEditorsTestimonialsEditor: LazyComponent<typeof import("../components/editors/TestimonialsEditor.vue")['default']>
export const LazyEditorsTextImageEditor: LazyComponent<typeof import("../components/editors/TextImageEditor.vue")['default']>
export const LazyEditorsEditorRegistry: LazyComponent<typeof import("../components/editors/editorRegistry")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyIcon: LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
export const LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
export const LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
