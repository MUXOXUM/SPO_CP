import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/AuthView.vue')
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('../views/CatalogView.vue'),
    meta: { requiresAuth: true, roles: ['customer', 'manager'] }
  },
  {
    path: '/manager',
    name: 'ManagerLayout',
    component: () => import('../views/manager/ManagerLayout.vue'),
    meta: { requiresAuth: true, roles: ['manager'] },
    children: [
      {
        path: '',
        redirect: '/manager/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/manager/DashboardView.vue')
      },
      {
        path: 'catalog',
        name: 'ManagerCatalog',
        component: () => import('../views/manager/CatalogView.vue')
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('../views/manager/EmployeesView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth');
    return;
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    if (authStore.userRole === 'customer') {
      next('/catalog');
    } else if (authStore.userRole === 'manager') {
      next('/manager');
    } else {
      next('/auth');
    }
    return;
  }

  next();
});

export default router; 