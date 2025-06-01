import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isManager: (state) => state.user?.role === 'manager'
    },

    actions: {
        async login(email, password) {
            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email,
                    password
                });
                
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                
                return response.data;
            } catch (error) {
                throw error.response?.data?.error || 'An error occurred';
            }
        },

        async register(userData) {
            try {
                const response = await axios.post(`${API_URL}/auth/register`, userData);
                
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                
                return response.data;
            } catch (error) {
                throw error.response?.data?.error || 'An error occurred';
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
        }
    }
}); 