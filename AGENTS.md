# AGENTS.md

Guide pour les agents IA (et les nouveaux développeurs) travaillant sur **GestSIS Mobile**.

## Vue d'ensemble

Application mobile pour les sapeurs-pompiers suisses (SIS = Service d'Incendie et de
Secours). Elle permet de saisir sur le terrain les **interventions** et les **exercices**
(présences, missions, matériel, quittances), puis de les **synchroniser** avec le backend
GestSIS. L'app est **offline-first** : tout est mis en cache localement et synchronisé
quand une connexion est disponible.

- **Domaine et langue** : français (Suisse). Les textes visibles par l'utilisateur, la
  plupart des commentaires et les messages de commit sont en français. Tout nouveau texte
  UI doit être en français.
- **Plateforme** : Capacitor **Android uniquement** (pas de plateforme iOS dans le repo).
  Le contenu web tourne dans la WebView Android.

## Stack technique

| Domaine | Choix |
|---|---|
| UI | Vue 3 (Composition API), Ionic Vue 8, Ionicons |
| Routing | `@ionic/vue-router` (Vue Router 5) |
| Natif | Capacitor 8 (`@capacitor/android`) |
| Build | Vite 8 |
| Langage | TypeScript 6 (`moduleResolution: nodenext`) |
| HTTP | axios (via `src/http/Request.ts`) |
| Persistance locale | `@ionic/storage` (localforage → IndexedDB dans la WebView) |
| Dates | Luxon (format SQL) |
| Auth | JWT (`jwt-decode`) + refresh token |
| Gestionnaire de paquets | **Yarn 4.9.2** (champ `packageManager`) |

> ⚠️ `vuex` figure dans les dépendances mais **n'est pas utilisé** : l'état est géré par un
> pattern maison de composables (voir « Stores »). Ne pas introduire de Vuex.

## Commandes

```sh
yarn install         # installer les dépendances (Yarn 4 / berry)
yarn dev             # serveur de dev Vite
yarn ionic:serve     # idem, sur --port 8100 --host (pour appareil/émulateur)
yarn build           # build de production (sortie dans dist/)
yarn lint            # ESLint (flat config)
```

- **Variables d'environnement requises** (dans `.env.local` / `.env.production`) :
  `VITE_APP_API_ENDPOINT` (API GestSIS) et `VITE_APP_AUTH_ENDPOINT` (service d'auth).
  Sans elles, l'app ne peut ni s'authentifier ni synchroniser.
- **Build Android** : via Docker, voir `README.md`. Penser à incrémenter `versionCode` et
  `versionName` dans `android/app/build.gradle` avant un build de release.

### Tests

Il n'existe **pas** de script de test fonctionnel. Un `jest.config.js` hérité et un
`tests/unit/example.spec.ts` subsistent, mais le preset Jest (`@vue/cli-plugin-unit-jest`)
n'est pas installé, donc les tests ne s'exécutent pas en l'état. Cypress est présent en
devDependency mais sans fichier de configuration. **Vérifier les changements via
`yarn lint`, `yarn build` et un test manuel** (parcours dans l'app), pas via une suite de
tests automatisés.

## Conventions de code

- **Extension `.ts`/`.vue` explicite dans les imports relatifs.** À cause de
  `moduleResolution: nodenext`, les imports internes s'écrivent avec l'extension :
  `import useAuth from "../store/useAuth.ts";`, `import Foo from "./Foo.vue";`.
  Omettre l'extension casse la résolution. **Toujours respecter ce style.**
- **Composition API** partout ; composables nommés `useXxx`, un par fichier.
- **Services** : objet littéral en export par défaut, une méthode par endpoint, retournant
  directement `Api.api().get/post/...` (voir `src/services/ExerciceService.ts`).
- **Style** : 2 espaces d'indentation, guillemets doubles, points-virgules, virgules
  finales. ESLint flat config dans `eslint.config.js` (`vue/flat/recommended` +
  `vueTsConfigs.recommended`). Pas de Prettier configuré — s'aligner sur le code existant.
- Composants de page dans `src/views/Gs*.vue` ; composants réutilisables dans
  `src/components/` (`base/`, `intervention/`, `modals/`).

## Architecture

```
src/
  http/Request.ts        # wrapper axios : Api.api() (API) et Api.auth() (auth)
  services/*Service.ts   # accès API par entité (thin, un objet par domaine)
  store/*.ts             # stores composables (état singleton + useBasicStore)
  store/useBasicStore.ts # factory : cache local + sync + persist
  store/useStore.ts      # orchestration syncAll / persist / reset de tous les modules
  models/*.ts            # types du domaine (classes ou interfaces)
  views/Gs*.vue          # pages (lazy-loaded dans le router)
  components/            # base/, intervention/, modals/
  router/index.ts        # routes + garde d'auth (redirige vers /login)
  hooks/                 # usePersistentStore (Ionic Storage), useTheme
  tools/                 # useDateFormatter (Luxon), useToast (useNotify)
  theme/                 # variables.css, SCSS
```

### Couche HTTP (`src/http/Request.ts`)

- `Api.api()` cible l'API métier ; `Api.auth()` le service d'authentification.
- L'intercepteur de **réponse** déballe le payload : il retourne `response.data.data`
  (ou `response.data`) et **lève** `response.data.error` s'il est présent. Les services
  reçoivent donc directement les données utiles, pas l'objet axios.
- **Refresh JWT en single-flight** : quand l'access token expire, un seul appel de refresh
  est émis ; les requêtes concurrentes attendent la même promesse. Un échec 401 déclenche
  `auth.loginExpired()`.
- En-têtes gérés automatiquement : `Authorization: Bearer <token>` et `Sis-Key`.

### Stores composables (pattern maison)

Chaque store est un module singleton : un `ref` défini au niveau module + la factory
`useBasicStore(state, loader, persistKey)` qui fournit `{ syncStatus, lastSync, ready,
reset, persist, sync }`. Le store de domaine l'étend avec ses méthodes métier.

- `sync()` attend `ready` (chargement du cache) **avant** de charger depuis l'API, puis
  écrase l'état et persiste.
- L'état est persisté dans IndexedDB en JSON (avec gestion des `Set`/`Map`).
- `useStore.syncAll()` synchronise tous les modules avec `Promise.allSettled` (un échec
  n'interrompt pas les autres) et applique un filtrage par permission.

### Modèle offline-first / synchronisation (logique métier clé)

- Les enregistrements **créés/édités localement** (interventions, exercices) portent un
  `localUuid` et un `localStatus` : `"in_progress"` ou `"validated"`.
- Seuls les enregistrements `"validated"` sont **exportés** lors de la synchro ; les autres
  restent des brouillons éditables. En cas d'échec d'export, l'enregistrement reste en file
  pour la prochaine synchro (pas de perte de données).
- La synchro **fusionne** les éditions locales avec le distant (résolution de conflits dans
  `useExercices.ts` et `useInterventions.ts`). Une saisie locale ne doit jamais être écrasée
  par le distant.
- ⚠️ **Piège** : le modèle `Intervention` génère automatiquement un `localUuid` à la
  construction. Un enregistrement créé localement doit être **inséré** dans `state.value`
  du store (upsert), sinon il ne vit que dans la ref « active » et est perdu au
  rechargement / à la synchro.

### Dates

- Stockées et manipulées au **format SQL** `"yyyy-MM-dd HH:mm"` via Luxon
  (`DateTime.fromSQL(...)`, `toSQL({ includeOffset: false })`).
- Affichage via `useDateFormatter().formatDate(date, "dd.LL.yy")`.
- Attention aux tokens Luxon : `dd` = jour du mois sur 2 chiffres, `DD` = date localisée
  complète (ne pas confondre).

### Authentification & multi-SIS (multi-tenant)

- Auth par **JWT** (access + refresh), refresh géré dans `Request.ts`.
- Multi-tenant : chaque **SIS** est identifié par sa clé `api_key`, envoyée dans l'en-tête
  **`Sis-Key`**. `activeSisKey` sélectionne le SIS courant.
- **Permissions** : `activePermissions` (par SIS) ; `hasPermission(p)` renvoie vrai si la
  permission est présente **ou** si l'utilisateur est admin (`state.data.admin`).
- Un **admin** contourne les vérifications de permission et peut basculer sur n'importe quel
  SIS (le backend l'autorise via le flag `admin` du JWT).

## À éviter

- ❌ Écrire des imports relatifs sans l'extension `.ts`/`.vue`.
- ❌ Introduire Vuex ou une autre lib d'état — suivre le pattern des stores composables.
- ❌ Créer localement une intervention/un exercice sans l'insérer (upsert) dans le store.
- ❌ Ajouter des textes UI en anglais — le domaine est francophone.
- ❌ Mélanger les formats de date : rester sur le format SQL + Luxon.
