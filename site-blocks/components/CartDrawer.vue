<script setup lang="ts">
/**
 * Боковая панель корзины интернет-магазина: состав заказа, количество,
 * итоговая сумма и шаг оформления.
 *
 * Оформление заказа — та же форма заявки, что и везде (LeadFormFields), но с
 * kind="order" и приложенным составом корзины. Отдельного «чекаута» на
 * статическом сайте быть не может: серверной части у него нет, заказ уезжает
 * в платформу и (если у магазина заданы реквизиты ЮKassa) возвращает ссылку
 * на оплату.
 */
import { computed, ref, watch } from 'vue'
import { formatMoney } from '../composables/useCart'

const runtime = useSiteRuntime()
const { items, isOpen, count, total, hasTotal, setQty, remove, clear, close } = useCart()

const step = ref<'cart' | 'checkout'>('cart')
const paymentUrl = ref('')

const CHECKOUT_FIELDS = [
  { name: 'name', label: 'Ваше имя', type: 'text' as const, required: true, placeholder: 'Иван', options: [] },
  { name: 'phone', label: 'Телефон', type: 'tel' as const, required: true, placeholder: '+7 (___) ___-__-__', options: [] },
  { name: 'email', label: 'E-mail', type: 'email' as const, required: false, placeholder: 'mail@example.com', options: [] },
  { name: 'message', label: 'Комментарий к заказу', type: 'textarea' as const, required: false, placeholder: 'Адрес доставки, удобное время', options: [] },
]

const totalText = computed(() => formatMoney(total.value, runtime.value.currency))
const belowMinimum = computed(() => runtime.value.minOrderTotal > 0 && total.value < runtime.value.minOrderTotal)

// Возврат к списку товаров при закрытии — иначе повторное открытие корзины
// показывало бы форму оформления от прошлого раза.
watch(isOpen, (open) => {
  if (!open) {
    step.value = 'cart'
    paymentUrl.value = ''
  }
})

function onOrdered(url: string) {
  paymentUrl.value = url
  clear()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cart-fade">
      <div v-if="isOpen" class="cart-backdrop" @click.self="close">
        <aside class="cart" role="dialog" aria-label="Корзина">
          <header class="cart__head">
            <h2 class="cart__title">{{ step === 'cart' ? 'Корзина' : 'Оформление заказа' }}</h2>
            <button class="cart__close" type="button" aria-label="Закрыть" @click="close">×</button>
          </header>

          <div v-if="step === 'cart'" class="cart__body">
            <p v-if="!items.length" class="cart__empty">Корзина пуста — выберите товары в каталоге.</p>

            <ul v-else class="cart__list">
              <li v-for="item in items" :key="item.key" class="cart-line">
                <div class="cart-line__media">
                  <img v-if="item.image" :src="item.image" alt="" class="cart-line__img">
                  <span v-else class="cart-line__stub" aria-hidden="true">🛍️</span>
                </div>
                <div class="cart-line__info">
                  <span class="cart-line__name">{{ item.name }}</span>
                  <span v-if="item.price" class="cart-line__price">{{ item.price }}</span>
                </div>
                <div class="cart-line__qty">
                  <button type="button" aria-label="Меньше" @click="setQty(item.key, item.qty - 1)">−</button>
                  <span>{{ item.qty }}</span>
                  <button type="button" aria-label="Больше" @click="setQty(item.key, item.qty + 1)">+</button>
                </div>
                <button class="cart-line__remove" type="button" aria-label="Удалить" @click="remove(item.key)">×</button>
              </li>
            </ul>
          </div>

          <div v-else class="cart__body">
            <ul class="cart__summary">
              <li v-for="item in items" :key="item.key">
                <span>{{ item.name }} × {{ item.qty }}</span>
                <span>{{ item.price }}</span>
              </li>
            </ul>

            <LeadFormFields
              :fields="CHECKOUT_FIELDS"
              kind="order"
              :cart-items="items"
              :cart-total="hasTotal ? totalText : ''"
              :submit-text="runtime.checkoutMode === 'payment' ? 'Оформить и оплатить' : 'Оформить заказ'"
              :success-text="runtime.orderSuccessText"
              source-block="cart"
              @sent="onOrdered"
            />

            <a v-if="paymentUrl" class="cart__pay btn-primary" :href="paymentUrl">Перейти к оплате</a>
          </div>

          <footer v-if="items.length && step === 'cart'" class="cart__foot">
            <div v-if="hasTotal" class="cart__total">
              <span>Итого</span>
              <strong>{{ totalText }}</strong>
            </div>
            <p v-if="belowMinimum" class="cart__warning">
              Минимальная сумма заказа — {{ formatMoney(runtime.minOrderTotal, runtime.currency) }}
            </p>
            <button class="cart__checkout btn-primary" type="button" :disabled="belowMinimum" @click="step = 'checkout'">
              Оформить заказ
            </button>
            <button class="cart__clear" type="button" @click="clear">Очистить корзину</button>
          </footer>

          <footer v-else-if="step === 'checkout'" class="cart__foot">
            <button class="cart__clear" type="button" @click="step = 'cart'">← Вернуться к товарам</button>
          </footer>

          <p v-if="count" class="cart__count-sr" aria-live="polite">Товаров в корзине: {{ count }}</p>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: flex-end;
  font-family: var(--font-family);
}

.cart {
  display: flex;
  flex-direction: column;
  width: min(440px, 100%);
  height: 100%;
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-lg);
}

.cart__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-color);
}

.cart__title {
  font-size: var(--fs-xl);
  font-weight: 700;
  margin: 0;
}

.cart__close {
  border: none;
  background: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.cart__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cart__empty {
  color: var(--text-muted);
  text-align: center;
  padding: var(--space-7) 0;
}

.cart__list,
.cart__summary {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cart__summary li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.cart-line {
  display: grid;
  grid-template-columns: 56px 1fr auto auto;
  align-items: center;
  gap: var(--space-3);
}

.cart-line__media {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-control);
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--surface-muted);
}

.cart-line__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-line__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cart-line__name {
  font-weight: 600;
  font-size: var(--fs-sm);
}

.cart-line__price {
  font-size: var(--fs-sm);
  color: var(--primary);
  font-weight: 600;
}

.cart-line__qty {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-control);
  padding: 2px var(--space-2);
}

.cart-line__qty button {
  border: none;
  background: none;
  color: var(--text);
  font-size: var(--fs-lg);
  line-height: 1;
  cursor: pointer;
}

.cart-line__remove {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: var(--fs-lg);
  cursor: pointer;
}

.cart__foot {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-top: 1px solid var(--border-color);
}

.cart__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--fs-lg);
}

.cart__total strong {
  font-size: var(--fs-xl);
  color: var(--primary);
}

.cart__warning {
  font-size: var(--fs-sm);
  color: #b45309;
}

.cart__checkout,
.cart__pay {
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--primary);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.cart__checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart__clear {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.cart__count-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.cart-fade-enter-active,
.cart-fade-leave-active {
  transition: opacity var(--transition-base);
}
.cart-fade-enter-from,
.cart-fade-leave-to {
  opacity: 0;
}
</style>
