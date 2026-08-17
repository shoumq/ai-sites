<script setup lang="ts">
/**
 * Единая точка монтирования всего, что живёт «поверх» страницы и не является
 * блоком схемы сайта: корзина, модалка заявки, плавающая кнопка WhatsApp,
 * водяной знак пробного тарифа.
 *
 * Рендерится ОДИН раз на приложение (site-renderer/app.vue и live-превью
 * админки), а не внутри блоков: блоков на странице много, а корзина и модалка
 * должны быть в единственном экземпляре, иначе получим несколько независимых
 * диалогов с рассинхронизированным состоянием.
 */
const props = withDefaults(
  defineProps<{
    /** Пробный тариф — на сайте показывается водяной знак платформы. */
    watermark?: boolean
    whatsappPhone?: string
    showWhatsapp?: boolean
  }>(),
  { watermark: false, whatsappPhone: '', showWhatsapp: false },
)

const runtime = useSiteRuntime()

// Гидратация корзины из localStorage и её сохранение — здесь, а не в useCart():
// этот компонент живёт всё время жизни страницы (см. комментарий у initCart).
initCart()

// Только цифры: wa.me не принимает +, скобки и пробелы.
const whatsappHref = computed(() => `https://wa.me/${props.whatsappPhone.replace(/\D/g, '')}`)
const showWhatsappButton = computed(() => props.showWhatsapp && props.whatsappPhone.replace(/\D/g, '').length >= 10)
</script>

<template>
  <CartDrawer v-if="runtime.cartEnabled" />
  <LeadModal />

  <a
    v-if="showWhatsappButton"
    class="site-whatsapp"
    :href="whatsappHref"
    target="_blank"
    rel="noopener"
    aria-label="Написать в WhatsApp"
  >
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.1-.8-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.2.3-.1.5.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.2.1.4.1.5-.1l.8-1c.2-.2.3-.2.5-.1l1.9.9c.2.1.4.2.4.3.1.2.1.6 0 1Z" />
    </svg>
  </a>

  <a
    v-if="watermark"
    class="site-watermark"
    href="https://github.com"
    target="_blank"
    rel="noopener"
  >
    Сделано в AI-конструкторе
  </a>
</template>

<style scoped>
.site-whatsapp {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 900;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  box-shadow: var(--shadow-md);
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.site-whatsapp:hover {
  transform: scale(1.06);
}

.site-watermark {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 900;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  font-family: var(--font-family);
  font-size: 12px;
  text-decoration: none;
  backdrop-filter: blur(6px);
}
</style>
