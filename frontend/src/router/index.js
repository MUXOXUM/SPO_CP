import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthForm from '../components/AuthForm.vue';

const routes = [
    {
        path: '/auth',
        name: 'Auth',
        component: AuthForm,
        meta: { requiresGuest: true }
    },
    {
        path: '/',
        redirect: '/auth'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/');
    } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/auth');
    } else {
        next();
    }
});

export default router; 