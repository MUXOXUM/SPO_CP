<template>
  <div class="employees">
    <div class="header">
      <h1>Управление сотрудниками</h1>
      <button @click="showAddModal = true" class="add-btn">
        Добавить сотрудника
      </button>
    </div>

    <!-- Search -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск по имени или email..."
        class="search-input"
      >
    </div>

    <!-- Employees Table -->
    <div class="table-container">
      <table class="employees-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in filteredEmployees" :key="employee.id">
            <td>{{ employee.name }}</td>
            <td>{{ employee.email }}</td>
            <td>
              <span class="role-badge" :class="employee.role">
                {{ getRoleName(employee.role) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="{ active: employee.isActive }">
                {{ employee.isActive ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editEmployee(employee)" class="edit-btn">
                Изменить
              </button>
              <button 
                v-if="employee.role !== 'manager'"
                @click="confirmDelete(employee)" 
                class="delete-btn"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingEmployee" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}</h2>
        <form @submit.prevent="handleSubmit" class="employee-form">
          <div class="form-group">
            <label>Имя:</label>
            <input v-model="employeeForm.name" required>
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input 
              v-model="employeeForm.email" 
              type="email" 
              required
              :disabled="editingEmployee"
            >
          </div>
          <div class="form-group">
            <label>Роль:</label>
            <select v-model="employeeForm.role" required>
              <option value="manager">Менеджер</option>
              <option value="employee">Сотрудник</option>
            </select>
          </div>
          <div v-if="!editingEmployee" class="form-group">
            <label>Пароль:</label>
            <input v-model="employeeForm.password" type="password" required>
          </div>
          <div v-if="editingEmployee" class="form-group">
            <label>Статус:</label>
            <div class="toggle-container">
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="employeeForm.isActive"
                >
                <span class="slider"></span>
              </label>
              <span class="toggle-label">{{ employeeForm.isActive ? 'Активен' : 'Неактивен' }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Отмена
            </button>
            <button type="submit" class="save-btn">
              {{ editingEmployee ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить сотрудника "{{ employeeToDelete?.name }}"?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">
            Отмена
          </button>
          <button @click="deleteEmployee" class="delete-btn">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Data
const employees = ref([]);
const searchQuery = ref('');
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingEmployee = ref(null);
const employeeToDelete = ref(null);

const employeeForm = ref({
  name: '',
  email: '',
  role: 'employee',
  password: '',
  isActive: true
});

// Computed
const filteredEmployees = computed(() => {
  return employees.value.filter(employee => {
    const searchTerm = searchQuery.value.toLowerCase();
    return employee.name.toLowerCase().includes(searchTerm) ||
           employee.email.toLowerCase().includes(searchTerm);
  });
});

// Methods
const fetchEmployees = async () => {
  try {
    const response = await axios.get('/api/manager/employees');
    employees.value = response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};

const getRoleName = (role) => {
  const roles = {
    manager: 'Менеджер',
    employee: 'Сотрудник'
  };
  return roles[role] || role;
};

const editEmployee = (employee) => {
  editingEmployee.value = employee;
  employeeForm.value = {
    ...employee,
    password: ''
  };
  showAddModal.value = true;
};

const confirmDelete = (employee) => {
  employeeToDelete.value = employee;
  showDeleteModal.value = true;
};

const deleteEmployee = async () => {
  try {
    await axios.delete(`/api/manager/employees/${employeeToDelete.value.id}`);
    await fetchEmployees();
    showDeleteModal.value = false;
    employeeToDelete.value = null;
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
};

const handleSubmit = async () => {
  try {
    if (editingEmployee.value) {
      await axios.put(`/api/manager/employees/${editingEmployee.value.id}`, employeeForm.value);
    } else {
      await axios.post('/api/manager/employees', employeeForm.value);
    }
    await fetchEmployees();
    closeModal();
  } catch (error) {
    console.error('Error saving employee:', error);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingEmployee.value = null;
  employeeForm.value = {
    name: '',
    email: '',
    role: 'employee',
    password: '',
    isActive: true
  };
};

// Lifecycle
onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
.employees {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #2e7d32;
  margin: 0;
}

.search-container {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.employees-table {
  width: 100%;
  border-collapse: collapse;
}

.employees-table th,
.employees-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.employees-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #666;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.role-badge.manager {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.role-badge.employee {
  background-color: #f5f5f5;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
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

.add-btn,
.edit-btn,
.delete-btn,
.save-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-btn,
.save-btn {
  background-color: #2e7d32;
  color: white;
}

.add-btn:hover,
.save-btn:hover {
  background-color: #1b5e20;
}

.edit-btn {
  background-color: #f5f5f5;
  color: #666;
}

.edit-btn:hover {
  background-color: #e0e0e0;
}

.delete-btn {
  background-color: #f5f5f5;
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

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
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal h2 {
  color: #2e7d32;
  margin-bottom: 1.5rem;
}

.employee-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }

  .modal {
    margin: 1rem;
  }
}
</style> 