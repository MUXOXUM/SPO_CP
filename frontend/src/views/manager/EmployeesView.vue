<template>
  <div class="employees">
    <div class="page-header">
      <div class="header-content">
        <h1>Управление сотрудниками</h1>
        <button @click="showAddModal = true" class="add-btn">
          <span class="material-icons">add</span>
          <span>Добавить сотрудника</span>
        </button>
      </div>
    </div>

    <div class="employees-content">
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
              <td>{{ `${employee.firstName} ${employee.lastName}` }}</td>
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
                <button @click="editEmployee(employee)" class="icon-btn edit-btn" title="Изменить">
                  <span class="material-icons">edit</span>
                </button>
                <button 
                  v-if="employee.role !== 'admin'"
                  @click="confirmDelete(employee)" 
                  class="icon-btn delete-btn"
                  title="Удалить"
                >
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal || editingEmployee" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}</h2>
            <button @click="closeModal" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="employee-form">
            <div class="form-row">
              <div class="form-group">
                <label>Имя:</label>
                <input v-model="employeeForm.firstName" required placeholder="Введите имя">
              </div>
              <div class="form-group">
                <label>Фамилия:</label>
                <input v-model="employeeForm.lastName" required placeholder="Введите фамилию">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email:</label>
                <input 
                  v-model="employeeForm.email" 
                  type="email" 
                  required
                  :disabled="editingEmployee"
                  placeholder="Введите email"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Роль:</label>
                <div class="select-container">
                  <select v-model="employeeForm.role" required>
                    <option value="" disabled selected>Выберите роль</option>
                    <option value="admin">Администратор</option>
                    <option value="manager">Менеджер</option>
                  </select>
                  <span class="material-icons select-icon">expand_more</span>
                </div>
              </div>
              <div v-if="!editingEmployee" class="form-group">
                <label>Пароль:</label>
                <input v-model="employeeForm.password" type="password" required placeholder="Введите пароль">
              </div>
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
                <span>Отмена</span>
              </button>
              <button type="submit" class="save-btn">
                <span class="material-icons">{{ editingEmployee ? 'save' : 'add' }}</span>
                <span>{{ editingEmployee ? 'Сохранить' : 'Добавить' }}</span>
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
            <button @click="showDeleteModal = false" class="close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-content">
            <div class="warning-message">
              <span class="material-icons warning-icon">warning</span>
              <p>Вы уверены, что хотите удалить сотрудника "{{ employeeToDelete?.firstName }} {{ employeeToDelete?.lastName }}"?</p>
              <p class="warning-subtext">Это действие нельзя отменить.</p>
            </div>
            <div class="modal-actions">
              <button @click="showDeleteModal = false" class="cancel-btn">
                <span>Отмена</span>
              </button>
              <button @click="deleteEmployee" class="delete-btn">
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
const employees = ref([]);
const searchQuery = ref('');
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingEmployee = ref(null);
const employeeToDelete = ref(null);

const employeeForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  password: '',
  isActive: true
});

// Computed
const filteredEmployees = computed(() => {
  return employees.value.filter(employee => {
    const searchTerm = searchQuery.value.toLowerCase();
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchTerm) ||
           employee.email.toLowerCase().includes(searchTerm);
  });
});

const getRoleName = (role) => {
  const roles = {
    'admin': 'Администратор',
    'manager': 'Менеджер'
  };
  return roles[role] || role;
};

// Methods
const fetchEmployees = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/manager/employees');
    employees.value = response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};

const editEmployee = (employee) => {
  editingEmployee.value = employee;
  employeeForm.value = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    isActive: employee.isActive
  };
  showAddModal.value = true;
};

const handleSubmit = async () => {
  try {
    if (editingEmployee.value) {
      await axios.put(`http://localhost:3000/api/manager/employees/${editingEmployee.value.id}`, {
        firstName: employeeForm.value.firstName,
        lastName: employeeForm.value.lastName,
        role: employeeForm.value.role,
        isActive: employeeForm.value.isActive
      });
    } else {
      await axios.post('http://localhost:3000/api/manager/employees', {
        firstName: employeeForm.value.firstName,
        lastName: employeeForm.value.lastName,
        email: employeeForm.value.email,
        password: employeeForm.value.password,
        role: employeeForm.value.role
      });
    }
    await fetchEmployees();
    closeModal();
  } catch (error) {
    console.error('Error submitting employee:', error);
  }
};

const confirmDelete = (employee) => {
  employeeToDelete.value = employee;
  showDeleteModal.value = true;
};

const deleteEmployee = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/manager/employees/${employeeToDelete.value.id}`);
    await fetchEmployees();
    showDeleteModal.value = false;
    employeeToDelete.value = null;
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingEmployee.value = null;
  employeeForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    isActive: true
  };
};

onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.employees {
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

.employees-content {
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

.employees-table {
  width: 100%;
  border-collapse: collapse;
}

.employees-table th,
.employees-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.employees-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.role-badge.admin {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.role-badge.manager {
  background-color: #f5f5f5;
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

.employee-form {
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

.form-group input,
.form-group select {
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.select-container {
  position: relative;
}

.select-container select {
  width: 100%;
  padding-right: 2.5rem;
  appearance: none;
  background-color: white;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
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

.modal-content {
  padding: 1.5rem;
}

.warning-message {
  text-align: center;
  color: #333;
}

.warning-icon {
  font-size: 48px;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.warning-subtext {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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