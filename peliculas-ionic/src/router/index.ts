import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { getToken } from '@/services/http';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    component: () => import('@/views/AuthPage.vue'),
  },
  {
    path: '/peliculas',
    component: () => import('@/views/Tab1Page.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const token = await getToken();
  const requiresAuth = to.path === '/peliculas';

  if (requiresAuth && !token) {
    return '/auth';
  }

  if (to.path === '/auth' && token) {
    return '/peliculas';
  }

  return true;
});

export default router
