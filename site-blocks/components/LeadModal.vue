<script setup lang="ts">
/**
 * Модальная форма «Оставить заявку» с контекстом товара.
 *
 * Ровно то, чего не хватало каталогу без корзины (автосалон, недвижимость,
 * услуги): посетитель жмёт кнопку на карточке конкретной позиции, и в заявку
 * уезжает, о какой именно позиции речь — а не безымянное «оставил заявку».
 * Рендерится один раз на сайт (см. SiteOverlays.vue), открывается любым блоком
 * через useLeadModal().
 */
const { leadModal, closeLeadModal } = useLeadModal()

const MODAL_FIELDS = [
  { name: 'name', label: 'Ваше имя', type: 'text' as const, required: true, placeholder: 'Иван', options: [] },
  { name: 'phone', label: 'Телефон', type: 'tel' as const, required: true, placeholder: '+7 (___) ___-__-__', options: [] },
  { name: 'message', label: 'Комментарий', type: 'textarea' as const, required: false, placeholder: 'Что вас интересует?', options: [] },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="lead-modal">
      <div v-if="leadModal.open" class="lead-modal-backdrop" @click.self="closeLeadModal">
        <div class="lead-modal" role="dialog" aria-modal="true">
          <header class="lead-modal__head">
            <h2 class="lead-modal__title">{{ leadModal.title }}</h2>
            <button class="lead-modal__close" type="button" aria-label="Закрыть" @click="closeLeadModal">×</button>
          </header>

          <LeadFormFields
            :fields="MODAL_FIELDS"
            :subject="leadModal.subject"
            :sku="leadModal.sku"
            submit-text="Отправить заявку"
            source-block="lead-modal"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lead-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: rgba(15, 23, 42, 0.5);
  font-family: var(--font-family);
}

.lead-modal {
  width: min(460px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  border-radius: var(--radius-block);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-lg);
}

.lead-modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.lead-modal__title {
  font-size: var(--fs-xl);
  font-weight: 700;
  margin: 0;
}

.lead-modal__close {
  border: none;
  background: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.lead-modal-enter-active,
.lead-modal-leave-active {
  transition: opacity var(--transition-base);
}
.lead-modal-enter-from,
.lead-modal-leave-to {
  opacity: 0;
}
</style>
