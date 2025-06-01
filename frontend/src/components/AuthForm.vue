<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: isLogin }]" 
          @click="isLogin = true"
        >
          Вход
        </button>
        <button 
          :class="['tab-btn', { active: !isLogin }]" 
          @click="isLogin = false"
        >
          Регистрация
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <template v-if="!isLogin">
          <div class="form-group">
            <label>Имя</label>
            <input 
              v-model="form.first_name"
              type="text"
              placeholder="Введите имя"
              required
            />
          </div>

          <div class="form-group">
            <label>Фамилия</label>
            <input 
              v-model="form.last_name"
              type="text"
              placeholder="Введите фамилию"
              required
            />
          </div>

          <div class="form-group">
            <label>Телефон</label>
            <input 
              v-model="form.phone"
              type="tel"
              placeholder="Введите телефон"
            />
          </div>

          <div class="form-group">
            <label>Адрес</label>
            <textarea 
              v-model="form.address"
              placeholder="Введите адрес"
              rows="2"
            ></textarea>
          </div>
        </template>

        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="form.email"
            type="email"
            placeholder="Введите email"
            required
          />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="form.password"
            type="password"
            placeholder="Введите пароль"
            required
          />
        </div>

        <button type="submit" class="submit-btn">
          {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const error = ref('');
const form = reactive({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: ''
});

const handleSubmit = async () => {
  try {
    error.value = '';
    if (isLogin.value) {
      await authStore.login(form.email, form.password);
    } else {
      await authStore.register(form);
    }
    router.push('/');
  } catch (err) {
    error.value = err.toString();
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.auth-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #2e7d32;
  border-bottom: 2px solid #2e7d32;
  margin-bottom: -2px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #2e7d32;
  outline: none;
}

.submit-btn {
  background-color: #2e7d32;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #1b5e20;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}
</style> 