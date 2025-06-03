<template>
  <div class="cart-widget" ref="cartRef">
    <button 
      class="cart-button" 
      type="button" 
      @click="toggleCart"
      @mousedown.stop
      @touchstart.stop
    >
      <span class="material-icons">shopping_cart</span>
      <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
    </button>

    <Transition name="fade">
      <div 
        v-if="isCartVisible" 
        class="cart-dropdown"
        @mousedown.stop
        @touchstart.stop
      >
        <div class="cart-header">
          <h3>Корзина</h3>
          <button @click="closeCart" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div v-if="totalItems === 0" class="empty-cart">
          <span class="material-icons">shopping_cart</span>
          <p>Корзина пуста</p>
        </div>

        <div v-else class="cart-items">
          <div 
            v-for="item in cartItems" 
            :key="item.id + '-' + item.formatId" 
            class="cart-item"
          >
            <div class="item-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.artist }}</p>
              <small class="format-info">{{ item.format }}</small>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item)" class="quantity-btn">
                <span class="material-icons">remove</span>
              </button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" class="quantity-btn">
                <span class="material-icons">add</span>
              </button>
            </div>
            <div class="item-price">{{ formatPrice(item.price * item.quantity) }} ₽</div>
            <button @click="removeItem(item)" class="remove-btn">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>

        <div v-if="totalItems > 0" class="cart-footer">
          <div class="total">
            <span>Итого:</span>
            <span>{{ formatPrice(totalPrice) }} ₽</span>
          </div>
          <button @click="goToCheckout" class="checkout-btn">
            <span class="material-icons">shopping_bag</span>
            <span>Оформить заказ</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const cartStore = useCartStore();
const { items } = storeToRefs(cartStore);

// Reactive refs
const cartRef = ref(null);
const isCartVisible = ref(false);

// Computed properties
const cartItems = computed(() => items.value);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);

// Methods
const toggleCart = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isCartVisible.value = !isCartVisible.value;
  console.log('Cart toggled:', isCartVisible.value, 'Items:', totalItems.value);
};

const closeCart = () => {
  isCartVisible.value = false;
};

const handleClickOutside = (event) => {
  if (cartRef.value && !cartRef.value.contains(event.target)) {
    isCartVisible.value = false;
  }
};

const removeItem = (item) => {
  cartStore.removeFromCart(item.id, item.formatId);
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.formatId, item.quantity - 1);
  }
};

const increaseQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.formatId, item.quantity + 1);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const goToCheckout = () => {
  isCartVisible.value = false;
  router.push('/checkout');
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('touchstart', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('touchstart', handleClickOutside);
});
</script>

<style scoped>
.cart-widget {
  position: relative;
  z-index: 1000;
}

.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background-color: #2e7d32;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-button:hover {
  background-color: #1b5e20;
  transform: translateY(-2px);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #d32f2f;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
}

.cart-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #666;
}

.empty-cart .material-icons {
  font-size: 48px;
  margin-bottom: 1rem;
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.item-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #666;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.item-price {
  font-weight: 500;
  color: #333;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: none;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: #ffebee;
}

.cart-footer {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #333;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
}

.format-info {
  display: block;
  color: #666;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .cart-dropdown {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .cart-items {
    max-height: calc(100vh - 160px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 