<template>
  <div class="manager-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Music CRM</h2>
        <p class="role-badge">Менеджер</p>
      </div>
      <nav class="sidebar-nav">
        <router-link 
          to="/manager/dashboard" 
          class="nav-link"
          active-class="active"
        >
          <span class="material-icons">dashboard</span>
          <span>Дашборд</span>
        </router-link>
        <router-link 
          to="/manager/catalog" 
          class="nav-link"
          active-class="active"
        >
          <span class="material-icons">album</span>
          <span>Каталог товаров</span>
        </router-link>
        <router-link 
          to="/manager/employees" 
          class="nav-link"
          active-class="active"
        >
          <span class="material-icons">people</span>
          <span>Сотрудники</span>
        </router-link>
        <router-link 
          to="/manager/customers" 
          class="nav-link"
          active-class="active"
        >
          <span class="material-icons">person</span>
          <span>Покупатели</span>
        </router-link>
        <router-link 
          to="/manager/orders" 
          class="nav-link"
          active-class="active"
        >
          <span class="material-icons">shopping_cart</span>
          <span>Заказы</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span class="material-icons">logout</span>
          <span>Выйти из системы</span>
        </button>
      </div>
    </aside>
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/auth');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.manager-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.sidebar {
  width: 280px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-header {
  padding: 2rem;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.role-badge {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: inline-block;
}

.sidebar-nav {
  padding: 1.5rem 0;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

.nav-link .material-icons {
  font-size: 1.25rem;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #2e7d32;
}

.nav-link.active {
  color: #2e7d32;
  background-color: #e8f5e9;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #2e7d32;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.logout-btn {
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.logout-btn:hover {
  background-color: #ffebee;
  border-color: #d32f2f;
  color: #d32f2f;
}

.logout-btn .material-icons {
  font-size: 1.25rem;
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .content {
    padding: 1rem;
  }
}
</style> 