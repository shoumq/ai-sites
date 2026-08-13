<script setup lang="ts">
import { COLOR_PRESETS, FONT_OPTIONS, SECTION_VARIANTS, SECTION_VARIANT_LABELS } from '~/types/site'
import type {
  ContactMapSection,
  FooterSection,
  Grid3ColSection,
  HeaderSection,
  HeroSection,
  PricingSection,
  SectionType,
  TestimonialsSection,
  Theme,
} from '~/types/site'

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

function variantOptions(type: Exclude<SectionType, 'text_image'>) {
  return SECTION_VARIANTS[type].map((v) => ({ value: v, label: SECTION_VARIANT_LABELS[v] ?? v }))
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
      <!-- header -->
      <template v-if="section.type === 'header'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('header')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Логотип (текст)" :model-value="(section as HeaderSection).logo_text" @update:model-value="patch({ logo_text: $event })" />
        <BaseInput label="Текст кнопки" :model-value="(section as HeaderSection).cta_text" @update:model-value="patch({ cta_text: $event })" />
        <label class="checkbox-row">
          <input type="checkbox" :checked="(section as HeaderSection).sticky" @change="patch({ sticky: ($event.target as HTMLInputElement).checked })">
          Липкая шапка (position: sticky)
        </label>
        <div class="field-label">Пункты меню</div>
        <ListEditor
          :items="(section as HeaderSection).nav_items"
          add-label="пункт меню"
          :new-item="() => ({ label: 'Пункт', href: '#' })"
          @update:items="patch({ nav_items: $event })"
        >
          <template #default="{ item, update }">
            <BaseInput placeholder="Название" :model-value="item.label" @update:model-value="update({ label: $event })" />
            <BaseInput placeholder="Ссылка" :model-value="item.href" @update:model-value="update({ href: $event })" />
          </template>
        </ListEditor>
      </template>

      <!-- hero -->
      <template v-else-if="section.type === 'hero'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('hero')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Заголовок (H1)" :model-value="(section as HeroSection).title" @update:model-value="patch({ title: $event })" />
        <BaseTextarea label="Подзаголовок" :model-value="(section as HeroSection).subtitle" @update:model-value="patch({ subtitle: $event })" />
        <BaseInput label="Текст кнопки" :model-value="(section as HeroSection).cta_text" @update:model-value="patch({ cta_text: $event })" />
        <BaseInput label="Ссылка кнопки" :model-value="(section as HeroSection).cta_href" @update:model-value="patch({ cta_href: $event })" />
      </template>

      <!-- text_image -->
      <template v-else-if="section.type === 'text_image'">
        <BaseInput label="Заголовок" :model-value="section.title" @update:model-value="patch({ title: $event })" />
        <BaseTextarea label="Текст" :model-value="section.text" @update:model-value="patch({ text: $event })" />
        <BaseSelect
          label="Позиция картинки"
          :model-value="section.image_position"
          :options="[{ value: 'left', label: 'Слева' }, { value: 'right', label: 'Справа' }]"
          @update:model-value="patch({ image_position: $event })"
        />
      </template>

      <!-- grid_3col -->
      <template v-else-if="section.type === 'grid_3col'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('grid_3col')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Заголовок секции" :model-value="(section as Grid3ColSection).title" @update:model-value="patch({ title: $event })" />
        <BaseInput label="Текст кнопки под сеткой (необязательно)" :model-value="(section as Grid3ColSection).cta_text" @update:model-value="patch({ cta_text: $event })" />
        <div class="field-label">Список услуг</div>
        <ListEditor
          :items="(section as Grid3ColSection).items"
          add-label="услугу"
          :new-item="() => ({ name: 'Услуга', description: '', price: '', icon: '' })"
          @update:items="patch({ items: $event })"
        >
          <template #default="{ item, update }">
            <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
            <BaseInput placeholder="Описание" :model-value="item.description" @update:model-value="update({ description: $event })" />
            <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
            <BaseInput placeholder="Иконка-эмодзи (для варианта «С иконкой»)" :model-value="item.icon" @update:model-value="update({ icon: $event })" />
          </template>
        </ListEditor>
      </template>

      <!-- pricing -->
      <template v-else-if="section.type === 'pricing'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('pricing')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Заголовок секции" :model-value="(section as PricingSection).title" @update:model-value="patch({ title: $event })" />
        <div class="field-label">Тарифные планы</div>
        <ListEditor
          :items="(section as PricingSection).plans"
          add-label="тариф"
          :new-item="() => ({ name: 'Тариф', price: '0', period: 'мес', features: [], highlighted: false })"
          @update:items="patch({ plans: $event })"
        >
          <template #default="{ item, update }">
            <BaseInput placeholder="Название" :model-value="item.name" @update:model-value="update({ name: $event })" />
            <BaseInput placeholder="Цена" :model-value="item.price" @update:model-value="update({ price: $event })" />
            <BaseInput placeholder="Период (мес/год)" :model-value="item.period" @update:model-value="update({ period: $event })" />
            <BaseTextarea placeholder="Опции — каждая с новой строки" :model-value="item.features.join('\n')" @update:model-value="update({ features: $event.split('\n') })" />
            <label class="checkbox-row">
              <input type="checkbox" :checked="item.highlighted" @change="update({ highlighted: ($event.target as HTMLInputElement).checked })">
              Выделить тариф
            </label>
          </template>
        </ListEditor>
      </template>

      <!-- testimonials -->
      <template v-else-if="section.type === 'testimonials'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('testimonials')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Заголовок секции" :model-value="(section as TestimonialsSection).title" @update:model-value="patch({ title: $event })" />
        <div class="field-label">Отзывы</div>
        <ListEditor
          :items="(section as TestimonialsSection).items"
          add-label="отзыв"
          :new-item="() => ({ author: 'Имя', text: '', avatar: '', rating: 5 })"
          @update:items="patch({ items: $event })"
        >
          <template #default="{ item, update }">
            <BaseInput placeholder="Автор" :model-value="item.author" @update:model-value="update({ author: $event })" />
            <BaseTextarea placeholder="Текст отзыва" :model-value="item.text" @update:model-value="update({ text: $event })" />
          </template>
        </ListEditor>
      </template>

      <!-- contact_map -->
      <template v-else-if="section.type === 'contact_map'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('contact_map')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Адрес" :model-value="(section as ContactMapSection).address" @update:model-value="patch({ address: $event })" />
        <BaseInput label="Телефон" :model-value="(section as ContactMapSection).phone" @update:model-value="patch({ phone: $event })" />
        <BaseInput label="Email" :model-value="(section as ContactMapSection).email" @update:model-value="patch({ email: $event })" />
        <BaseInput label="2ГИС / карта — embed URL" :model-value="(section as ContactMapSection).map_embed_url" @update:model-value="patch({ map_embed_url: $event })" />
      </template>

      <!-- footer -->
      <template v-else-if="section.type === 'footer'">
        <BaseSelect label="Вариант блока" :model-value="section.variant" :options="variantOptions('footer')" @update:model-value="patch({ variant: $event })" />
        <BaseInput label="Название компании" :model-value="(section as FooterSection).company_name" @update:model-value="patch({ company_name: $event })" />
        <BaseInput label="Копирайт" :model-value="(section as FooterSection).copyright_text" @update:model-value="patch({ copyright_text: $event })" />
        <div class="field-label">Ссылки в футере</div>
        <ListEditor
          :items="(section as FooterSection).links"
          add-label="ссылку"
          :new-item="() => ({ label: 'Ссылка', href: '#' })"
          @update:items="patch({ links: $event })"
        >
          <template #default="{ item, update }">
            <BaseInput placeholder="Название" :model-value="item.label" @update:model-value="update({ label: $event })" />
            <BaseInput placeholder="URL" :model-value="item.href" @update:model-value="update({ href: $event })" />
          </template>
        </ListEditor>
      </template>

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

      <BaseSelect label="Шрифт" :model-value="theme.font" :options="FONT_OPTIONS.map((f) => ({ value: f, label: f }))" @update:model-value="patchTheme({ font: $event as Theme['font'] })" />

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

.field-label {
  font-size: var(--a-fs-xs);
  font-weight: 600;
  color: var(--a-text-muted);
  letter-spacing: 0.02em;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  font-size: var(--a-fs-sm);
  color: var(--a-text-muted);
  cursor: pointer;
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
  border-color: #fff;
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
