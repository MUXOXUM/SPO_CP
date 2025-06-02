<template>
  <div class="suppliers">
    <div class="page-header">
      <div class="header-content">
        <h1>Управление поставщиками</h1>
        <button @click="openAddModal" class="add-btn">
          <span class="material-icons">add</span>
          <span>Добавить поставщика</span>
        </button>
      </div>
    </div>

    <div class="suppliers-content">
      <!-- Search -->
      <div class="filters">
        <div class="search-container">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по названию или контактному лицу..."
            class="search-input"
          >
        </div>
      </div>

      <!-- Suppliers Table -->
      <div class="table-container">
        <table class="suppliers-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Контактное лицо</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Адрес</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id">
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.contactPerson }}</td>
              <td>{{ supplier.email }}</td>
              <td>{{ supplier.phone }}</td>
              <td>{{ supplier.address }}</td>
              <td class="actions">
                <button @click="editSupplier(supplier)" class="icon-btn edit-btn" title="Изменить">
                  <span class="material-icons">edit</span>
                </button>
                <button @click="deleteSupplier(supplier)" class="icon-btn delete-btn" title="Удалить">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Редактировать поставщика' : 'Добавить поставщика' }}</h2>
            <button @click="closeModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="supplier-form">
            <div class="form-group">
              <label>Название компании:</label>
              <input 
                v-model="supplierForm.name"
                required
                placeholder="Введите название компании"
              >
            </div>
            <div class="form-group">
              <label>Контактное лицо:</label>
              <input 
                v-model="supplierForm.contactPerson"
                required
                placeholder="Введите ФИО контактного лица"
              >
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email:</label>
                <input 
                  v-model="supplierForm.email"
                  type="email"
                  required
                  placeholder="Введите email"
                >
              </div>
              <div class="form-group">
                <label>Телефон:</label>
                <input 
                  v-model="supplierForm.phone"
                  type="tel"
                  required
                  placeholder="Введите телефон"
                >
              </div>
            </div>
            <div class="form-group">
              <label>Адрес:</label>
              <textarea 
                v-model="supplierForm.address"
                required
                placeholder="Введите адрес"
                rows="3"
              ></textarea>
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

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Подтверждение удаления</h2>
            <button @click="closeDeleteModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="delete-confirmation">
            <p>Вы действительно хотите удалить поставщика "{{ selectedSupplier?.name }}"?</p>
            <div class="modal-actions">
              <button @click="closeDeleteModal" class="cancel-btn">
                <span>Отмена</span>
              </button>
              <button @click="confirmDelete" class="delete-btn">
                <span class="material-icons">delete</span>
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Data
const suppliers = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedSupplier = ref(null);

const supplierForm = ref({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: ''
});

// Computed
const filteredSuppliers = computed(() => {
  return suppliers.value.filter(supplier => {
    const searchTerm = searchQuery.value.toLowerCase();
    return supplier.name.toLowerCase().includes(searchTerm) ||
           supplier.contactPerson.toLowerCase().includes(searchTerm);
  });
});

// Methods
const fetchSuppliers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/manager/suppliers');
    suppliers.value = response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
  }
};

const openAddModal = () => {
  isEditing.value = false;
  supplierForm.value = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  };
  showModal.value = true;
};

const editSupplier = (supplier) => {
  isEditing.value = true;
  selectedSupplier.value = supplier;
  supplierForm.value = {
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address
  };
  showModal.value = true;
};

const deleteSupplier = (supplier) => {
  selectedSupplier.value = supplier;
  showDeleteModal.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`http://localhost:3000/api/manager/suppliers/${selectedSupplier.value.id}`, supplierForm.value);
    } else {
      await axios.post('http://localhost:3000/api/manager/suppliers', supplierForm.value);
    }
    await fetchSuppliers();
    closeModal();
  } catch (error) {
    console.error('Error saving supplier:', error);
  }
};

const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/manager/suppliers/${selectedSupplier.value.id}`);
    await fetchSuppliers();
    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting supplier:', error);
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedSupplier.value = null;
  supplierForm.value = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  };
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedSupplier.value = null;
};

onMounted(() => {
  fetchSuppliers();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.suppliers {
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

.suppliers-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.add-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
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

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table th,
.suppliers-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.suppliers-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
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

.delete-btn {
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffebee;
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

.supplier-form {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.delete-confirmation {
  padding: 1.5rem;
}

.delete-confirmation p {
  margin: 0 0 1.5rem;
  color: #333;
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