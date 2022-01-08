import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component : () => import('../views/GsLogin.vue')
  },
  {
    path: '/',
    name: 'accueil',
    component : () => import('../views/GsHome.vue')
  },
  {
    path: '/interventions',
    name: 'interventions',
    component : () => import('../views/GsInterventions.vue')
  },
  {
    path: '/exercices',
    name: 'exercices',
    component : () => import('../views/GsExercices.vue')
  },
  {
    path: '/synchronisation',
    name: 'synchronisation',
    component : () => import('../views/GsSynchronisation.vue')
  },
  {
    path: '/parametres',
    name: 'parametres',
    component : () => import('../views/GsParametres.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
