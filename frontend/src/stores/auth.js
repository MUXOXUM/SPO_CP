import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          email,
          password,
        });
        
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        return { success: true, role: this.user.role };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.response?.data?.message || 'Ошибка входа' };
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/register', userData);
        return { success: true, message: 'Регистрация успешна' };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.response?.data?.message || 'Ошибка регистрации' };
      }
    },

    async fetchProfile() {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/profile');
        this.user = response.data;
        return { success: true };
      } catch (error) {
        console.error('Profile fetch error:', error);
        return { success: false, error: error.response?.data?.message || 'Ошибка получения профиля' };
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
}); 