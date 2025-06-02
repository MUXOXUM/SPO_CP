<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Music CRM</h1>
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          Вход
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          Регистрация
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email:</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            required
            placeholder="Введите email"
          >
        </div>
        <div class="form-group">
          <label for="login-password">Пароль:</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            required
            placeholder="Введите пароль"
          >
        </div>
        <button type="submit" class="submit-btn">
          <span>Войти</span>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="register-first-name">Имя:</label>
          <input
            id="register-first-name"
            v-model="registerForm.first_name"
            type="text"
            required
            placeholder="Введите имя"
          >
        </div>
        <div class="form-group">
          <label for="register-last-name">Фамилия:</label>
          <input
            id="register-last-name"
            v-model="registerForm.last_name"
            type="text"
            required
            placeholder="Введите фамилию"
          >
        </div>
        <div class="form-group">
          <label for="register-email">Email:</label>
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            required
            placeholder="Введите email"
          >
        </div>
        <div class="form-group">
          <label for="register-password">Пароль:</label>
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Введите пароль"
          >
        </div>
        <button type="submit" class="submit-btn">
          <span>Зарегистрироваться</span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('login');
const error = ref('');

const loginForm = ref({
  email: '',
  password: ''
});

const registerForm = ref({
  email: '',
  password: '',
  first_name: '',
  last_name: ''
});

const handleLogin = async () => {
  error.value = '';
  const result = await authStore.login(loginForm.value.email, loginForm.value.password);
  
  if (result.success) {
    if (result.role === 'manager') {
      router.push('/manager');
    } else {
      router.push('/catalog');
    }
  } else {
    error.value = result.error;
  }
};

const handleRegister = async () => {
  error.value = '';
  const result = await authStore.register(registerForm.value);
  
  if (result.success) {
    activeTab.value = 'login';
    registerForm.value = { email: '', password: '', first_name: '', last_name: '' };
  } else {
    error.value = result.error;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: white;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.auth-title {
  text-align: center;
  color: #2e7d32;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  gap: 1rem;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.tab-btn.active {
  color: #2e7d32;
  border-bottom: 2px solid #2e7d32;
  font-weight: 600;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  padding: 0.875rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.submit-btn {
  background-color: #2e7d32;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  background-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.submit-btn:active {
  transform: translateY(0);
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 8px;
  color: #d32f2f;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style> 