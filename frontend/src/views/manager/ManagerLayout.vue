<template>
  <div class="manager-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Панель управления</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link 
          to="/manager/dashboard" 
          class="nav-link"
          active-class="active"
        >
          Дашборд
        </router-link>
        <router-link 
          to="/manager/catalog" 
          class="nav-link"
          active-class="active"
        >
          Каталог товаров
        </router-link>
        <router-link 
          to="/manager/employees" 
          class="nav-link"
          active-class="active"
        >
          Сотрудники
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          Выйти
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
.manager-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  color: #2e7d32;
  margin: 0;
  font-size: 1.25rem;
}

.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: #2e7d32;
}

.nav-link.active {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-right: 3px solid #2e7d32;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #e0e0e0;
  color: #d32f2f;
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
  overflow-y: auto;
}
</style> 