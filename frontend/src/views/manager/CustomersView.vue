<template>
  <div class="customers">
    <div class="page-header">
      <div class="header-content">
        <h1>Управление покупателями</h1>
      </div>
    </div>

    <div class="customers-content">
      <!-- Search -->
      <div class="filters">
        <div class="search-container">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по имени или email..."
            class="search-input"
          >
        </div>
      </div>

      <!-- Customers Table -->
      <div class="table-container">
        <table class="customers-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Адрес</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id">
              <td>{{ `${customer.firstName} ${customer.lastName}` }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.phone || 'Не указан' }}</td>
              <td>{{ customer.address || 'Не указан' }}</td>
              <td>
                <span class="status-badge" :class="{ active: customer.isActive }">
                  {{ customer.isActive ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              <td class="actions">
                <button @click="editCustomer(customer)" class="icon-btn edit-btn" title="Изменить">
                  <span class="material-icons">edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Редактировать покупателя</h2>
            <button @click="closeModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="customer-form">
            <div class="form-row">
              <div class="form-group">
                <label>Имя:</label>
                <input v-model="customerForm.firstName" required placeholder="Введите имя">
              </div>
              <div class="form-group">
                <label>Фамилия:</label>
                <input v-model="customerForm.lastName" required placeholder="Введите фамилию">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email:</label>
                <input 
                  v-model="customerForm.email" 
                  type="email" 
                  disabled
                  placeholder="Email"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Телефон:</label>
                <input 
                  v-model="customerForm.phone" 
                  type="tel"
                  placeholder="Введите телефон"
                >
              </div>
              <div class="form-group">
                <label>Адрес:</label>
                <input 
                  v-model="customerForm.address"
                  placeholder="Введите адрес"
                >
              </div>
            </div>
            <div class="form-group">
              <label>Статус:</label>
              <div class="toggle-container">
                <label class="toggle">
                  <input 
                    type="checkbox" 
                    v-model="customerForm.isActive"
                  >
                  <span class="slider"></span>
                </label>
                <span class="toggle-label">{{ customerForm.isActive ? 'Активен' : 'Неактивен' }}</span>
              </div>
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
const customers = ref([]);
const searchQuery = ref('');
const showEditModal = ref(false);
const editingCustomer = ref(null);

const customerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  isActive: true
});

// Computed
const filteredCustomers = computed(() => {
  return customers.value.filter(customer => {
    const searchTerm = searchQuery.value.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(searchTerm) ||
           customer.email.toLowerCase().includes(searchTerm) ||
           (customer.phone && customer.phone.toLowerCase().includes(searchTerm));
  });
});

// Methods
const fetchCustomers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/manager/customers');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

const editCustomer = (customer) => {
  editingCustomer.value = customer;
  customerForm.value = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    isActive: customer.isActive
  };
  showEditModal.value = true;
};

const handleSubmit = async () => {
  try {
    await axios.put(`http://localhost:3000/api/manager/customers/${editingCustomer.value.id}`, {
      firstName: customerForm.value.firstName,
      lastName: customerForm.value.lastName,
      phone: customerForm.value.phone,
      address: customerForm.value.address,
      is_active: customerForm.value.isActive
    });
    await fetchCustomers();
    closeModal();
  } catch (error) {
    console.error('Error updating customer:', error);
  }
};

const closeModal = () => {
  showEditModal.value = false;
  editingCustomer.value = null;
  customerForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    isActive: true
  };
};

onMounted(() => {
  fetchCustomers();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.customers {
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.page-header {
  background-color: white;
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header h1 {
  color: #2e7d32;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.customers-content {
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

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th,
.customers-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.customers-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: #ffebee;
  color: #d32f2f;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
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
  max-width: 600px;
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

.customer-form {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.form-group input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2e7d32;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-label {
  color: #666;
  font-size: 0.875rem;
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
  .filters,
  .table-container {
    padding: 0 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .modal {
    margin: 1rem;
  }
}
</style> 