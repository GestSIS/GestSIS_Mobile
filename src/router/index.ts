import useAuth from "../store/useAuth.ts";
import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw, RouteLocationNormalized } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/GsLogin.vue"),
  },
  {
    path: "/",
    name: "accueil",
    component: () => import("../views/GsHome.vue"),
  },
  {
    path: "/annuaire",
    name: "annuaire",
    component: () => import("../views/GsAnnuaire.vue"),
  },
  {
    path: "/intervention",
    name: "intervention",
    component: () => import("../views/GsIntervention.vue"),
  },
  {
    path: "/interventions",
    name: "interventions",
    component: () => import("../views/GsInterventions.vue"),
  },
  {
    path: "/mission/:uuid",
    name: "mission",
    props: (route) => ({ uuid: route.params.uuid ?? "" }),
    component: () => import("../views/GsInterventionMission.vue"),
  },
  {
    path: "/sapeurs/:mode",
    name: "sapeurs",
    props: (route) => ({
      sapeursIds: route.params.sapeursIds ?? "",
      mode: route.params.mode ?? "",
    }),
    component: () => import("../views/GsInterventionSapeur.vue"),
  },
  {
    path: "/exercices",
    name: "exercices",
    component: () => import("../views/GsExercices.vue"),
  },
  {
    path: "/exercice/:uuid",
    name: "exercice",
    props: true,
    component: () => import("../views/GsExercice.vue"),
  },
  {
    path: "/materiel",
    name: "materiel",
    component: () => import("../views/GsMateriel.vue"),
  },
  {
    path: "/synchronisation",
    name: "synchronisation",
    component: () => import("../views/GsSynchronisation.vue"),
  },
  {
    path: "/parametres",
    name: "parametres",
    component: () => import("../views/GsParametres.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auth Navigation guard
const { isLoggedIn } = useAuth();
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
  if (to.name !== "login" && !isLoggedIn()) {
    // Redirect to login if not logged in
    return { name: "login" };
  } else if (to.name === "login" && isLoggedIn()) {
    // Redirect to accueil if logged in
    return { name: "accueil" };
  }
});

export default router;
