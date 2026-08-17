<script setup lang="ts">
import { COLOR_PRESETS, FONT_OPTIONS, THEME_AXES, THEME_AXIS_LABELS, THEME_AXIS_VALUE_LABELS } from '~/types/site'
import type { Theme } from '~/types/site'
import { EDITOR_COMPONENT_MAP } from './editors/editorRegistry'

const store = useEditorStore()
const toast = useToast()
const { confirm } = useConfirm()

const section = computed(() => store.selectedSection)
const theme = computed(() => store.site?.theme ?? null)

function patch(p: Record<string, unknown>) {
  if (store.selectedSection) store.updateSection(store.selectedSection.id, p)
}

function patchTheme(p: Partial<Theme>) {
  store.updateTheme(p)
}

async function handleDelete() {
  if (!store.selectedSection) return
  const ok = await confirm({
    title: 'Удалить блок?',
    message: 'Блок будет убран со страницы. Это действие можно отменить через Ctrl+Z.',
    confirmLabel: 'Удалить',
    danger: true,
  })
  if (ok) store.deleteSection(store.selectedSection.id)
}

const IMAGE_STYLE_LABELS: Record<Theme['style'], string> = {
  business: 'Деловой',
  warm: 'Тёплый',
  techno: 'Техно',
  custom: 'Свой стиль',
}

// -- генерация картинки для hero/text_image --
const api = useApi()
const imageGenerating = ref(false)
const remainingToday = ref<number | null>(null)

const imageField = computed<'bg_image' | 'image' | null>(() => {
  if (section.value?.type === 'hero') return 'bg_image'
  if (section.value?.type === 'text_image') return 'image'
  return null
})

const hasGeneratedImage = computed(() => {
  const s = section.value
  if (!s) return false
  if (s.type === 'hero') return !!s.bg_image
  if (s.type === 'text_image') return !!s.image
  return false
})

async function generateImage() {
  const field = imageField.value
  if (!field || !section.value || !store.projectId) return
  imageGenerating.value = true
  try {
    const titleHint = 'title' in section.value ? section.value.title : ''
    const prompt = `${titleHint || store.project?.name || 'сайт'}, ${store.site?.theme.style ?? 'business'} style`
    const result = await api.post<{ url: string; remaining_today: number }>(`/projects/${store.projectId}/images`, { prompt })
    patch({ [field]: result.url })
    remainingToday.value = result.remaining_today
    toast.success(`Картинка сгенерирована. Осталось генераций сегодня: ${result.remaining_today}`)
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : 'Не удалось сгенерировать изображение')
  } finally {
    imageGenerating.value = false
  }
}

</script>

<template>
  <div class="constructor-panel">
    <div class="constructor-panel__title">Контент</div>

    <div v-if="!section" class="no-selection">
      <Icon name="lucide:mouse-pointer-click" />
      <p>Выберите блок на превью слева, чтобы отредактировать его содержимое</p>
    </div>

    <template v-else>
      <component :is="EDITOR_COMPONENT_MAP[section.type]" :section="section" @patch="patch" />

      <div class="field-label">Фон блока</div>
      <div class="bg-picker">
        <label class="bg-picker__swatch" :style="{ background: section.bg_color || 'var(--surface)' }" title="Свой цвет фона блока">
          <input type="color" class="bg-picker__input" :value="section.bg_color || '#ffffff'" @input="patch({ bg_color: ($event.target as HTMLInputElement).value })">
        </label>
        <BaseButton v-if="section.bg_color" variant="ghost" size="sm" icon="lucide:rotate-ccw" @click="patch({ bg_color: '' })">
          Сбросить
        </BaseButton>
        <span v-else class="bg-picker__hint">По умолчанию (фон сайта)</span>
      </div>

      <div v-if="imageField" class="image-generate">
        <BaseButton variant="secondary" block :loading="imageGenerating" icon="lucide:sparkles" @click="generateImage">
          Сгенерировать изображение
        </BaseButton>
        <p v-if="hasGeneratedImage" class="image-generate__hint is-ok">
          <Icon name="lucide:check" /> Картинка уже сгенерирована
        </p>
        <p v-if="remainingToday !== null" class="image-generate__hint">Осталось генераций сегодня: {{ remainingToday }}</p>
      </div>

      <BaseButton variant="danger" block icon="lucide:trash-2" class="delete-btn" @click="handleDelete">
        Удалить блок
      </BaseButton>
    </template>

    <!-- Внешний вид темы — не привязан к выбранному блоку -->
    <div class="constructor-panel__title">Внешний вид</div>
    <div v-if="theme" class="appearance">
      <div class="field-label">Цветовой пресет</div>
      <div class="color-presets">
        <button
          v-for="style in (Object.keys(COLOR_PRESETS) as Theme['style'][])"
          :key="style"
          type="button"
          class="color-swatch"
          :class="{ 'is-selected': theme.style === style }"
          :style="{ background: COLOR_PRESETS[style] }"
          :title="IMAGE_STYLE_LABELS[style]"
          @click="patchTheme({ style, primary_color: COLOR_PRESETS[style] })"
        />
        <label class="color-swatch color-swatch--custom" :style="{ background: theme.primary_color }" title="Свой HEX-цвет">
          <input type="color" class="color-swatch__input" :value="theme.primary_color" @input="patchTheme({ style: 'custom', primary_color: ($event.target as HTMLInputElement).value })">
        </label>
      </div>

      <div class="field-label">Фон сайта</div>
      <div class="bg-picker">
        <label class="bg-picker__swatch" :style="{ background: theme.bg_color || 'var(--surface)' }" title="Свой цвет фона сайта">
          <input type="color" class="bg-picker__input" :value="theme.bg_color || '#ffffff'" @input="patchTheme({ bg_color: ($event.target as HTMLInputElement).value })">
        </label>
        <BaseButton v-if="theme.bg_color" variant="ghost" size="sm" icon="lucide:rotate-ccw" @click="patchTheme({ bg_color: '' })">
          Сбросить
        </BaseButton>
        <span v-else class="bg-picker__hint">По умолчанию (белый)</span>
      </div>

      <BaseSelect label="Шрифт" :model-value="theme.font" :options="FONT_OPTIONS.map((f) => ({ value: f, label: f }))" @update:model-value="patchTheme({ font: $event as Theme['font'] })" />

      <!-- Оси вёрстки: меняют пропорции и характер всех блоков сайта сразу,
           без пересборки схемы (см. site-blocks/composables/useSiteTheme.ts). -->
      <div class="field-label">Характер вёрстки</div>
      <BaseSelect
        v-for="(values, axis) in THEME_AXES"
        :key="axis"
        :label="THEME_AXIS_LABELS[axis] ?? axis"
        :model-value="(theme as any)[axis] ?? values[0]"
        :options="values.map((v) => ({ value: v, label: THEME_AXIS_VALUE_LABELS[v] ?? v }))"
        @update:model-value="patchTheme({ [axis]: $event } as Partial<Theme>)"
      />

      <BaseInput label="Логотип — URL картинки" placeholder="https://…/logo.svg" :model-value="theme.logo_url" @update:model-value="patchTheme({ logo_url: $event })" />
      <div v-if="theme.logo_url" class="logo-preview">
        <img :src="theme.logo_url" alt="Логотип" referrerpolicy="no-referrer">
      </div>

      <BaseTextarea
        label="Свой CSS (для продвинутых)"
        :rows="5"
        placeholder=".site-section { ... }"
        :model-value="theme.custom_css"
        @update:model-value="patchTheme({ custom_css: $event })"
      />
      <p class="custom-css-warning">
        <Icon name="lucide:alert-triangle" /> Произвольный CSS применяется как есть — ошибка в селекторах может сломать вёрстку сайта.
      </p>
    </div>
  </div>
</template>

<style scoped>
.constructor-panel {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
}

.constructor-panel__title {
  font-size: var(--a-fs-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--a-text-faint);
  margin-top: var(--a-space-4);
}
.constructor-panel__title:first-child {
  margin-top: 0;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--a-space-3);
  padding: var(--a-space-7) var(--a-space-4);
  text-align: center;
  color: var(--a-text-faint);
  font-size: var(--a-fs-sm);
}
.no-selection :deep(svg) {
  font-size: 1.75rem;
}

.image-generate {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-2);
  padding-top: var(--a-space-2);
}
.image-generate__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
  display: flex;
  align-items: center;
  gap: 4px;
}
.image-generate__hint.is-ok {
  color: var(--a-success);
}

.delete-btn {
  margin-top: var(--a-space-2);
}

.appearance {
  display: flex;
  flex-direction: column;
  gap: var(--a-space-3);
}

.color-presets {
  display: flex;
  gap: var(--a-space-2);
  flex-wrap: wrap;
}

.color-swatch {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: var(--a-radius-full);
  border: 2px solid var(--a-border);
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: transform var(--a-transition-fast), border-color var(--a-transition-fast);
}
.color-swatch:hover {
  transform: scale(1.08);
}
.color-swatch.is-selected {
  border-color: var(--a-bg-elevated);
  box-shadow: 0 0 0 2px var(--a-accent);
}
.color-swatch--custom {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
}
.color-swatch__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.bg-picker {
  display: flex;
  align-items: center;
  gap: var(--a-space-3);
}

.bg-picker__swatch {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: var(--a-radius-md);
  border: 2px solid var(--a-border-strong);
  cursor: pointer;
  overflow: hidden;
  background-image:
    linear-gradient(45deg, var(--a-border) 25%, transparent 25%),
    linear-gradient(-45deg, var(--a-border) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--a-border) 75%),
    linear-gradient(-45deg, transparent 75%, var(--a-border) 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  transition: transform var(--a-transition-fast);
}
.bg-picker__swatch:hover {
  transform: scale(1.06);
}

.bg-picker__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.bg-picker__hint {
  font-size: var(--a-fs-xs);
  color: var(--a-text-faint);
}

.logo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--a-space-3);
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--a-radius-md);
  max-height: 88px;
}
.logo-preview img {
  max-height: 56px;
  object-fit: contain;
}

.custom-css-warning {
  display: flex;
  gap: var(--a-space-2);
  align-items: flex-start;
  font-size: var(--a-fs-xs);
  color: var(--a-warning);
  line-height: 1.5;
}
</style>
