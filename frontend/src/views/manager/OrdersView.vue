<template>
  <div class="orders">
    <div class="page-header">
      <div class="header-content">
        <h1>Управление заказами</h1>
      </div>
    </div>

    <div class="orders-content">
      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-container">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по номеру заказа..."
            class="search-input"
          >
        </div>
      </div>

      <!-- Orders Table -->
      <div class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>№ Заказа</th>
              <th>Покупатель</th>
              <th>Дата заказа</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ `${order.customer.firstName} ${order.customer.lastName}` }}</td>
              <td>{{ formatDate(order.orderDate) }}</td>
              <td>{{ formatPrice(order.totalAmount) }} ₽</td>
              <td>
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="actions">
                <button @click="viewOrderDetails(order)" class="icon-btn view-btn" title="Просмотр">
                  <span class="material-icons">visibility</span>
                </button>
                <button @click="editOrder(order)" class="icon-btn edit-btn" title="Изменить">
                  <span class="material-icons">edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Order Details Modal -->
      <div v-if="showDetailsModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Детали заказа #{{ selectedOrder?.id }}</h2>
            <button @click="closeModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="order-details">
            <div class="details-section">
              <h3>Информация о заказе</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Дата заказа:</span>
                  <span>{{ formatDate(selectedOrder?.orderDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Статус:</span>
                  <span :class="getStatusClass(selectedOrder?.status)">
                    {{ getStatusText(selectedOrder?.status) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Сумма заказа:</span>
                  <span>{{ formatPrice(selectedOrder?.totalAmount) }} ₽</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Информация о покупателе</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">ФИО:</span>
                  <span>{{ `${selectedOrder?.customer.firstName} ${selectedOrder?.customer.lastName}` }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span>{{ selectedOrder?.customer.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Телефон:</span>
                  <span>{{ selectedOrder?.customer.phone || 'Не указан' }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Товары</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Количество</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder?.items" :key="item.id">
                    <td>{{ item.product.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatPrice(item.price) }} ₽</td>
                    <td>{{ formatPrice(item.price * item.quantity) }} ₽</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Изменить статус заказа #{{ selectedOrder?.id }}</h2>
            <button @click="closeModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="order-form">
            <div class="form-group">
              <label>Статус заказа:</label>
              <select v-model="orderForm.status">
                <option value="new">Новый</option>
                <option value="processing">В обработке</option>
                <option value="shipped">Отправлен</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменён</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                <span>Отмена</span>
              </button>
              <button type="submit" class="save-btn">
                <span class="material-icons">save</span>
                <span>Сохранить</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Data
const orders = ref([]);
const searchQuery = ref('');
const showDetailsModal = ref(false);
const showEditModal = ref(false);
const selectedOrder = ref(null);

const orderForm = ref({
  status: ''
});

// Computed
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const searchTerm = searchQuery.value.toLowerCase();
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
    const orderId = order.id.toString();
    return customerName.includes(searchTerm) || orderId.includes(searchTerm);
  });
});

// Methods
const fetchOrders = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/manager/orders');
    orders.value = response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return price.toLocaleString('ru-RU');
};

const getStatusClass = (status) => {
  const statusClasses = {
    new: 'status-new',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return statusClasses[status] || '';
};

const getStatusText = (status) => {
  const statusTexts = {
    new: 'Новый',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён'
  };
  return statusTexts[status] || status;
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

const editOrder = (order) => {
  selectedOrder.value = order;
  orderForm.value.status = order.status;
  showEditModal.value = true;
};

const handleSubmit = async () => {
  try {
    await axios.put(`http://localhost:3000/api/manager/orders/${selectedOrder.value.id}/status`, {
      status: orderForm.value.status
    });
    await fetchOrders();
    closeModal();
  } catch (error) {
    console.error('Error updating order:', error);
  }
};

const closeModal = () => {
  showDetailsModal.value = false;
  showEditModal.value = false;
  selectedOrder.value = null;
  orderForm.value.status = '';
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.orders {
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.page-header {
.page-header {
  background-color: white;
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header h1 {
.page-header h1 {
  color: #2e7d32;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.orders-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.filters {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
}

.search-container {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-new {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-processing {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-shipped {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-delivered {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
}

.icon-btn .material-icons {
  font-size: 20px;
}

.view-btn {
  color: #1976d2;
}

.view-btn:hover {
  background-color: #e3f2fd;
}

.edit-btn {
  color: #2e7d32;
}

.edit-btn:hover {
  background-color: #e8f5e9;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.order-details {
  padding: 1.5rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section h3 {
  color: #333;
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  color: #666;
  font-size: 0.875rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.items-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.order-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-group select {
  width: 100%;
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
}

.form-group select:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.cancel-btn {
  background: none;
  border: 1.5px solid #e0e0e0;
  color: #666;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.save-btn {
  background-color: #2e7d32;
  border: none;
  color: white;
}

.save-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

@media (max-width: 768px) {
  .header-content,
  .header-content,
  .filters,
  .table-container {
    padding: 0 1rem;
  }

  .modal {
    margin: 1rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style> 