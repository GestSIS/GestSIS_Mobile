import useAuth from '@/store/useAuth';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/GsLogin.vue'),
  },
  {
    path: '/',
    name: 'accueil',
    component: () => import('../views/GsHome.vue'),
  },
  {
    path: '/intervention',
    name: 'intervention',
    component: () => import('../views/GsIntervention.vue'),
  },
  {
    path: '/interventions',
    name: 'interventions',
    component: () => import('../views/GsInterventions.vue'),
  },
  {
    path: '/exercices',
    name: 'exercices',
    component: () => import('../views/GsExercices.vue'),
  },
  {
    path: '/exercice',
    name: 'exercice',
    component: () => import('../views/GsExercice.vue'),
  },
  {
    path: '/synchronisation',
    name: 'synchronisation',
    component: () => import('../views/GsSynchronisation.vue'),
  },
  {
    path: '/parametres',
    name: 'parametres',
    component: () => import('../views/GsParametres.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Auth Navigation guard
const { isLoggedIn } = useAuth();
router.beforeEach((to, from, next) => {
  if (to.name != 'login' && !isLoggedIn()) {
    // Redirect to login if not logged in
    console.log('redirect to login')
    return next({
      name: 'login',
    });
  } else if (to.name == 'login' && isLoggedIn()) {
    // Redirect to accueil if logged in
    console.log('redirect to accueil')
    return next({
      name: 'accueil',
    });
  }
  console.log({to, from})
  next();
});

export default router;
