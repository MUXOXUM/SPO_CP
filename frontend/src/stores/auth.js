import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
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
        this.persistUserData();
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        return { success: true, role: this.user.role };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.response?.data?.message || 'Ошибка входа' };
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/register', {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || null,
          address: userData.address || null
        });
        
        return { success: true, message: 'Регистрация успешна' };
      } catch (error) {
        console.error('Registration error:', error);
        return { 
          success: false, 
          error: error.response?.data?.error || 'Ошибка регистрации' 
        };
      }
    },

    async fetchProfile() {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/profile');
        this.user = response.data;
        this.persistUserData();
        return { success: true };
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (error.response?.status === 401) {
          this.logout();
        }
        return { success: false, error: error.response?.data?.message || 'Ошибка получения профиля' };
      }
    },

    persistUserData() {
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    clearUserData() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },

    logout() {
      this.user = null;
      this.token = null;
      this.clearUserData();
    },

    async initializeAuth() {
      if (this.token) {
        await this.fetchProfile();
      }
    }
  },
}); 