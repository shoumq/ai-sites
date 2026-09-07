<script setup lang="ts">
import type { GenerationPreferences } from '~/types/api'
withDefaults(defineProps<{ direction?: GenerationPreferences['design_direction']; brand?: string; dark?: boolean; accent?: string }>(), { direction: 'minimal', brand: 'Your next chapter.', dark: false, accent: '#596753' })
</script>

<template>
  <div class="design-preview" :class="[`direction-${direction}`, { 'preview-dark': dark }]" :style="{ '--preview-accent': accent }" aria-label="Эскиз визуального направления">
    <div class="design-preview__nav"><strong>{{ brand || 'Your next chapter.' }}</strong><span>О нас &nbsp; Коллекция <i>Связаться ↗</i></span></div>
    <div class="design-preview__hero"><div class="design-preview__copy"><span class="design-preview__eyebrow">СОЗДАНО С ХАРАКТЕРОМ</span><h3>Больше смысла.<br><em>В каждой детали.</em></h3><p>Пространство для того,<br>что делает вас особенными.</p><span class="design-preview__cta">Открыть новое <span>↗</span></span></div><div class="design-preview__art" aria-hidden="true"><div class="sculpture sculpture--back" /><div class="sculpture sculpture--front" /><span class="design-preview__art-label">FORM & FEEL — 01</span></div></div>
    <div class="design-preview__footer"><span>Продумано до мелочей.</span><span>Именно так, как вам близко. &nbsp; ↗</span></div>
  </div>
</template>

<style scoped>
.design-preview { --preview-bg: #f8f7f3; --preview-ink: #282e27; color: var(--preview-ink); background: var(--preview-bg); border: 1px solid rgba(128,128,128,.18); border-radius: 12px; overflow: hidden; box-shadow: 0 28px 60px -32px #0004; text-align: left; }
.design-preview__nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; gap: 15px; font-size: 8px; }
.design-preview__nav strong { font-size: 12px; letter-spacing: -.04em; max-width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.design-preview__nav > span { opacity: .75; white-space: nowrap; }
.design-preview__nav i { font-style: normal; margin-left: 16px; }
.design-preview__hero { padding: 32px 24px 38px; display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; min-height: 250px; gap: 10px; }
.design-preview__eyebrow { font-size: 6px; letter-spacing: .19em; opacity: .65; }
.design-preview h3 { font-size: clamp(20px, 2.4vw, 34px); font-weight: 500; line-height: 1.1; letter-spacing: -.055em; margin: 15px 0 12px; text-wrap: initial; }
.design-preview h3 em { font-family: Georgia, serif; font-weight: 400; }
.design-preview__copy p { font-size: 8px; line-height: 1.6; opacity: .65; }
.design-preview__cta { display: inline-flex; align-items: center; gap: 28px; font-size: 7px; background: var(--preview-accent); color: #fff; border-radius: 25px; margin-top: 20px; padding: 10px 13px; }
.design-preview__art { height: 215px; position: relative; overflow: hidden; border-radius: 48% 48% 8px 8px; background: radial-gradient(ellipse at 70% 35%, #e4e6d9, #c1c9b7 60%, #9aa68c); }
.sculpture { position: absolute; width: 82px; height: 145px; border-radius: 55px 55px 12px 12px; background: linear-gradient(100deg, #e6e7df, #f9f8f1 38%, #d4d5c9 78%, #acb49f); box-shadow: 10px 18px 22px #47554040, inset -5px 0 12px #6e785530; }
.sculpture--back { left: 17%; top: 27px; transform: rotate(-16deg); }
.sculpture--front { width: 98px; height: 120px; top: 95px; right: 7%; transform: rotate(13deg); border-radius: 50% 50% 8px 8px; background: linear-gradient(95deg, #63785c, #9cad8d 45%, #687b60 85%); }
.design-preview__art-label { position: absolute; bottom: 10px; left: 12px; font-size: 6px; letter-spacing: .15em; color: #263321; }
.design-preview__footer { border-top: 1px solid #80808025; padding: 16px 24px; display: flex; justify-content: space-between; gap: 12px; font-size: 7px; opacity: .65; }
.direction-editorial { --preview-bg: #f0eee8; --preview-ink: #2d2924; border-radius: 0; }
.direction-editorial h3 { font-family: Georgia, serif; letter-spacing: -.035em; }
.direction-editorial .design-preview__art { border-radius: 0; filter: grayscale(.8); }
.direction-editorial .design-preview__cta { border-radius: 0; background: transparent; color: inherit; border: 1px solid currentColor; }
.direction-bold { --preview-bg: #ebe8ff; --preview-ink: #352964; }
.direction-bold h3 { font-weight: 800; }
.direction-bold h3 em { font-family: inherit; }
.direction-bold .design-preview__art { border-radius: 18px; filter: hue-rotate(135deg); }
.direction-warm { --preview-bg: #fbefe3; --preview-ink: #553e2c; }
.direction-warm .design-preview__art { filter: sepia(.5); }
.preview-dark { --preview-bg: #20231f; --preview-ink: #f5f4ed; }
@media (max-width: 1000px) { .design-preview__nav i { display: none; } .design-preview__hero { padding: 18px; } .design-preview__art { height: 180px; } }
</style>
