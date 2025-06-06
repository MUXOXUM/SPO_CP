<template>
  <div class="cart-widget">
    <button @click="showCart = true" class="cart-btn" :class="{ 'has-items': totalItems > 0 }">
      <span class="material-icons">shopping_cart</span>
      <span v-if="totalItems" class="cart-count">{{ totalItems }}</span>
    </button>

    <!-- Cart Modal -->
    <div v-if="showCart" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Корзина</h2>
          <button @click="showCart = false" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="material-icons">shopping_cart</span>
          <p>Корзина пуста</p>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id + item.formatId" class="cart-item">
              <div class="item-info">
                <h3>{{ item.title }}</h3>
                <p class="artist">{{ item.artist }}</p>
                <p class="format">{{ getFormatName(item.formatId) }}</p>
              </div>
              <div class="item-controls">
                <div class="quantity-controls">
                  <button @click="updateQuantity(item.id, item.formatId, item.quantity - 1)" 
                          :disabled="item.quantity <= 1">
                    <span class="material-icons">remove</span>
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.formatId, item.quantity + 1)">
                    <span class="material-icons">add</span>
                  </button>
                </div>
                <p class="price">{{ formatPrice(item.price * item.quantity) }} ₽</p>
                <button @click="removeFromCart(item.id, item.formatId)" class="remove-btn">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-footer">
            <div class="total">
              <span>Итого:</span>
              <span class="total-amount">{{ formatPrice(totalAmount) }} ₽</span>
            </div>
            <button @click="showOrderForm = true" class="checkout-btn">
              <span class="material-icons">shopping_bag</span>
              <span>Оформить заказ</span>
            </button>
          </div>
        </div>

        <!-- Order Form -->
        <div v-if="showOrderForm" class="order-form">
          <h3>Оформление заказа</h3>
          <form @submit.prevent="placeOrder">
            <div class="form-group">
              <label>Способ оплаты:</label>
              <select v-model="orderForm.paymentMethod" required>
                <option value="card">Банковская карта</option>
                <option value="cash">Наличные при получении</option>
              </select>
            </div>
            <div class="form-group">
              <label>Адрес доставки:</label>
              <textarea 
                v-model="orderForm.shippingAddress" 
                required 
                placeholder="Введите полный адрес доставки"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showOrderForm = false" class="cancel-btn">
                Отмена
              </button>
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span class="material-icons">check</span>
                <span>Подтвердить заказ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import axios from 'axios';

const cartStore = useCartStore();
const showCart = ref(false);
const showOrderForm = ref(false);
const isSubmitting = ref(false);

const orderForm = ref({
  paymentMethod: 'card',
  shippingAddress: ''
});

const totalItems = computed(() => cartStore.totalItems);
const totalAmount = computed(() => cartStore.totalAmount);
const cartItems = computed(() => cartStore.cartItems);

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const getFormatName = (formatId) => {
  switch (formatId.toLowerCase()) {
    case 'cd':
      return 'CD';
    case 'vinyl':
    case 'винил':
      return 'Винил';
    case 'cassette':
    case 'кассета':
      return 'Кассета';
    case 'digital':
    case 'цифровой':
      return 'Цифровая запись';
    default:
      return formatId;
  }
};

const updateQuantity = (itemId, formatId, quantity) => {
  cartStore.updateQuantity(itemId, formatId, quantity);
};

const removeFromCart = (itemId, formatId) => {
  cartStore.removeFromCart(itemId, formatId);
};

const placeOrder = async () => {
  try {
    isSubmitting.value = true;
    
    const orderData = {
      items: cartItems.value.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: orderForm.value.paymentMethod,
      shippingAddress: orderForm.value.shippingAddress
    };

    const response = await axios.post('/api/orders', orderData);
    
    if (response.data.orderId) {
      cartStore.clearCart();
      showOrderForm.value = false;
      showCart.value = false;
      alert('Заказ успешно оформлен!');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Ошибка при оформлении заказа. Попробуйте позже.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.cart-widget {
  position: relative;
}

.cart-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: none;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.cart-btn.has-items {
  border-color: #2e7d32;
  color: #2e7d32;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #2e7d32;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-cart .material-icons {
  font-size: 4rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
}

.cart-content {
  padding: 1.5rem;
}

.cart-items {
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.item-info .artist {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.item-info .format {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  background-color: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-controls button {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  color: #666;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price {
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 0.25rem;
}

.cart-footer {
  border-top: 1px solid #e0e0e0;
  padding-top: 1.5rem;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.total-amount {
  font-weight: 600;
  color: #2e7d32;
}

.checkout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.checkout-btn:hover {
  background-color: #1b5e20;
}

.order-form {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.order-form h3 {
  margin: 0 0 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: white;
  border: 1.5px solid #e0e0e0;
  color: #666;
}

.submit-btn {
  background-color: #2e7d32;
  border: none;
  color: white;
}

.submit-btn:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 