# SkyWalk — Documentation Technique

## 1. Présentation du Projet

**SkyWalk** est une plateforme web d'aide à l'expatriation. Elle accompagne les utilisateurs dans leur projet de vie à l'étranger : découverte de destinations, comparaison de pays, démarches administratives, coût de la vie, offres d'emploi, forum communautaire, blog et suivi de projet personnalisé.

| Élément | Détail |
|---------|--------|
| **Type** | Application web full-stack (SPA + API REST) |
| **Frontend** | React 19 · TypeScript · Vite 7 · Tailwind CSS 4 |
| **Backend** | NestJS 10 · TypeORM · PostgreSQL 15 |
| **Hébergement** | Frontend → Vercel · Backend → Heroku · BDD → Heroku PostgreSQL |
| **CI/CD** | GitHub Actions + GitLab CI |
| **Branche principale** | `develop` |

---

## 2. Architecture Générale

```
GPE_SKYWALK/
├── backend/                 # API NestJS (port 3001)
│   └── src/
│       ├── config/          # JWT, TypeORM
│       ├── db/              # Data source + migrations
│       ├── features/        # Modules métier (23 modules)
│       └── main.ts          # Point d'entrée
├── skywalk-frontend/        # SPA React (port 5173)
│   └── src/
│       ├── api/             # Clients API (Axios)
│       ├── components/      # Composants globaux
│       ├── contexts/        # AuthContext, CurrencyContext, etc.
│       ├── features/        # 15 feature modules
│       ├── layouts/         # MainLayout, AuthLayout
│       ├── locales/         # fr.json, en.json (i18n)
│       ├── routes/          # Routage SPA
│       └── types/           # Types TypeScript
├── .github/workflows/       # CI GitHub Actions
├── .gitlab-ci.yml           # CI GitLab
├── docker-compose.yml       # Conteneurisation
└── package.json             # Husky + Commitlint
```

---

## 3. Stack Technique

### 3.1 Frontend

| Technologie | Usage |
|------------|-------|
| **React 19** | Framework UI |
| **TypeScript 5.8** | Typage statique |
| **Vite 7** | Bundler / Dev server |
| **Tailwind CSS 4** | Styling utility-first |
| **React Router 7** | Routage SPA |
| **TanStack Query 5** | Gestion cache / requêtes API |
| **i18next** | Internationalisation (FR / EN) |
| **Lucide React** | Icônes |
| **react-hot-toast** | Notifications toast |
| **Axios** | Client HTTP |
| **@dnd-kit** | Drag & Drop (dashboard) |
| **Vitest** | Tests unitaires (48 tests) |

### 3.2 Backend

| Technologie | Usage |
|------------|-------|
| **NestJS 10** | Framework API REST |
| **TypeORM** | ORM PostgreSQL |
| **PostgreSQL 15** | Base de données |
| **Passport + JWT** | Authentification |
| **@nestjs/throttler** | Rate limiting (60 req/min) |
| **@nestjs/swagger** | Documentation API auto |
| **Helmet** | Sécurité HTTP headers |
| **OpenAI SDK** | Modération de contenu (forum) |
| **Bcrypt** | Hashage mots de passe |
| **Nodemailer** | Envoi d'emails |
| **node-cache** | Cache en mémoire |
| **Jest** | Tests unitaires |

### 3.3 Outils Projet

| Outil | Usage |
|-------|-------|
| **Husky** | Git hooks (pre-commit) |
| **Commitlint** | Convention de commits (Conventional Commits) |
| **ESLint + Prettier** | Linting + formatage |
| **Docker Compose** | Conteneurisation locale |
| **GitHub Actions** | Pipeline CI/CD |
| **GitLab CI** | Pipeline CI/CD alternatif |

---

## 4. Modules Backend (API REST)

23 modules NestJS organisés par domaine métier :

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/api/auth` | Register, Login, Logout, Refresh, Forgot/Reset Password |
| **User** | `/api/users` | Profil utilisateur (GET/PATCH/DELETE me) |
| **Country** | `/api/country` | CRUD pays (FR, CH, US, JP) |
| **City** | `/api/city` | CRUD villes |
| **Continent** | `/api/continent` | CRUD continents |
| **Destinations** | `/api/destinations` | Liste + détail destinations (slug) |
| **CityComparison** | `/api/city-comparison` | Comparaison de villes |
| **CostOfLiving** | `/api/cost-of-living` | Coût de la vie (API Numbeo) |
| **JobOffer** | `/api/job-offer` | Offres d'emploi (API Adzuna) |
| **ExpatriationProject** | `/api/expatriation-project` | Projets d'expatriation (CRUD + checklist) |
| **ForumTopic** | `/api/forum-topic` | Topics forum (CRUD + lock/pin/moderate) |
| **ForumMessage** | `/api/forum-message` | Messages forum (CRUD + report/moderate) |
| **Checklist** | `/api/checklist` | Checklists démarches |
| **Guide** | `/api/guide` | Guides pratiques |
| **Resource** | `/api/resource` | Ressources utiles |
| **AdminProcedure** | `/api/admin-procedure` | Procédures administratives |
| **ProcedureTracking** | `/api/procedure-tracking` | Suivi de procédures |
| **Notification** | `/api/notification` | Notifications utilisateur |
| **Experience** | `/api/experience` | Témoignages d'expérience |
| **BusinessSector** | `/api/business-sector` | Secteurs d'activité |
| **GlobalSearch** | `/api/global-search` | Recherche globale |
| **OecdMigration** | `/api/migration` | Données migration OCDE |
| **Housing** | — | Logement |

---

## 5. Features Frontend

### 5.1 Pages Publiques

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Page d'accueil (hero, how-it-works, testimonials, FAQ) |
| Destinations | `/destinations` | Catalogue pays avec filtres et cartes |
| Destination Détail | `/destinations/:slug` | Détail pays (tabs: aperçu, emploi, coût de vie, blog) |
| Comparaison | `/comparison` | Comparaison radar/bar chart entre pays |
| Forum | `/forum` | Liste des topics + détail + réponses |
| Blog | `/blog` | Articles de blog par pays |
| Recherche | `/search` | Recherche globale intelligente (NLP) |
| Services | `/services` | Index des services (visa, logement, emploi, santé…) |
| Coût de la vie | `/test/cost-of-living` | Comparateur coût de la vie |

### 5.2 Pages Authentifiées

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Dashboard avec widgets drag & drop |
| Dashboard perso | `/dashboard/personalized` | Widgets personnalisés (météo, heure, emploi…) |
| Mes Projets | `/projects` | Liste projets d'expatriation |
| Projet Détail | `/projects/:id` | Détail + checklist + progression |
| Profil | `/profile` | Édition profil utilisateur |
| Onboarding | `/onboarding` | Parcours guidé en 5 étapes |

### 5.3 Authentification

| Route | Description |
|-------|-------------|
| `/auth/login` | Connexion (email + mot de passe) |
| `/auth/register` | Inscription |
| `/auth/pwdForgot` | Mot de passe oublié |

---

## 6. Fonctionnalités Clés

### 6.1 Modération de Contenu (Forum)

Le service `ContentFilterService` assure la modération en deux couches :

1. **OpenAI Moderation API** (`omni-moderation-latest`) — détecte harcèlement, haine, violence, contenu sexuel, etc.
2. **Filtre local (fallback)** — blocklist regex (insultes FR/EN, variantes orthographiques), détection spam, détection ALL CAPS, sanitisation XSS

La clé API OpenAI est configurée via la variable d'environnement `OPENAI_API_KEY`.

### 6.2 Internationalisation (i18n)

- 2 langues : **Français** (défaut) et **Anglais**
- Bibliothèque : `i18next` + `react-i18next`
- Fichiers : `src/locales/fr.json` et `src/locales/en.json`
- Sélecteur de langue dans la NavBar

### 6.3 Dashboard Personnalisable

- Widgets drag & drop via `@dnd-kit`
- Redimensionnement (small / medium / large)
- Widgets : résumé profil, objectifs, météo, heure locale, emploi, coût de la vie, checklist, budget
- Préférences sauvegardées en `localStorage` avec système de version

### 6.4 Recherche Globale

- Parser NLP (`smartQueryParser`) qui traduit les requêtes naturelles
- Catégories : destinations, forum, blog, services
- Suggestions en temps réel

### 6.5 Conversion de Devises

- `CurrencyContext` global (EUR, USD, GBP, CHF, JPY, CAD)
- Conversion automatique des prix affichés
- Taux de change via API

---

## 7. Base de Données

### 7.1 Données Actuelles

| Table | Contenu |
|-------|---------|
| Pays | 4 : France, Suisse, États-Unis, Japon |
| Continents | 3 : Europe, Amérique du Nord, Asie |
| Villes | Multiples par pays (Paris, Lyon, Genève, New York, Tokyo…) |
| Utilisateurs | Plusieurs comptes test |

### 7.2 Migrations TypeORM

Les migrations sont dans `backend/src/db/migrations/`. Gestion via :

```bash
npm run migration:generate -- src/db/migrations/NomMigration
npm run migration:run
```

---

## 8. CI/CD

### 8.1 GitHub Actions (`.github/workflows/ci.yml`)

Pipeline déclenché sur push `develop`/`main` et pull requests :

```
Backend Lint  ──┐
Backend Tests ──┼──► Backend Build  ──┐
Frontend Lint ──┤                     ├──► Docker Build
Frontend Tests──┼──► Frontend Build ──┘
```

- **Lint** : ESLint + Prettier (backend & frontend)
- **Tests** : Jest (backend, avec PostgreSQL service) + Vitest (frontend)
- **Build** : NestJS (`nest build`) + Vite (`tsc -b && vite build`)
- **Docker** : `docker compose build`

### 8.2 GitLab CI (`.gitlab-ci.yml`)

Pipeline identique avec stages `test → build → docker`. Jobs manuels (`when: manual`).

### 8.3 Conventional Commits

Format imposé par Commitlint + Husky :

```
feat: nouvelle fonctionnalité
fix: correction de bug
ci: modification CI/CD
refactor: refactoring sans changement fonctionnel
```

---

## 9. Déploiement

### 9.1 URLs de Production

| Service | URL |
|---------|-----|
| **Frontend** | https://skywalk-chi.vercel.app |
| **Backend API** | https://skywalk-backend-api-50c5bfcb5a94.herokuapp.com |
| **Swagger** | https://skywalk-backend-api-50c5bfcb5a94.herokuapp.com/swagger |

### 9.2 Variables d'Environnement (Heroku)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL Heroku |
| `JWT_SECRET` | Secret JWT access token |
| `JWT_REFRESH_SECRET` | Secret JWT refresh token |
| `OPENAI_API_KEY` | Clé API OpenAI (modération) |
| `ADZUNA_APP_ID` | ID app Adzuna (offres emploi) |
| `ADZUNA_APP_KEY` | Clé API Adzuna |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL frontend (CORS) |

### 9.3 Commandes de Déploiement

```bash
# Push vers les 3 remotes
git push origin develop      # GitLab
git push github develop      # GitHub (→ Vercel auto-deploy)
git push heroku develop:main # Heroku
```

---

## 10. Développement Local

### 10.1 Prérequis

- Node.js ≥ 18
- PostgreSQL 15 (ou Docker)
- npm

### 10.2 Installation

```bash
# Racine (Husky + Commitlint)
npm install

# Backend
cd backend
npm install
cp .env.example .env  # Configurer les variables

# Frontend
cd ../skywalk-frontend
npm install
```

### 10.3 Lancement

```bash
# Backend (port 3001)
cd backend
npm run start:dev

# Frontend (port 5173)
cd skywalk-frontend
npm run dev
```

### 10.4 Tests

```bash
# Backend
cd backend
npm run test           # Tests unitaires
npm run test:e2e       # Tests E2E
npm run lint           # Lint + autofix

# Frontend
cd skywalk-frontend
npm run test           # 48 tests Vitest
npm run lint           # ESLint
```

---

## 11. Sécurité

| Mesure | Implémentation |
|--------|----------------|
| **Authentification** | JWT (access + refresh token) via cookies HttpOnly |
| **Hashage MDP** | bcrypt (salt rounds: 10) |
| **Rate Limiting** | @nestjs/throttler (60 req/min) |
| **CORS** | Configuré pour le domaine frontend uniquement |
| **Helmet** | Headers de sécurité HTTP |
| **XSS Protection** | Sanitisation dans ContentFilterService |
| **Modération** | OpenAI Moderation API + blocklist locale |
| **Validation** | class-validator sur tous les DTOs |

---

## 12. Design

| Aspect | Choix |
|--------|-------|
| **Palette** | Gray-scale (gray-50 à gray-900) + accent SkyWalk blue (#5EA3C0) |
| **Icônes** | Lucide React (uniquement) |
| **Responsive** | Mobile-first via Tailwind breakpoints |
| **Favicon** | SVG custom — lettre "S" sur fond sombre |
| **Typographie** | System font stack via Tailwind |

---

## 13. APIs Externes

| API | Usage | Clé requise |
|-----|-------|-------------|
| **OpenAI Moderation** | Modération contenu forum | `OPENAI_API_KEY` |
| **Adzuna** | Offres d'emploi par pays | `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` |
| **Numbeo** (via scraping) | Coût de la vie | — |
| **REST Countries** | Données pays | — (gratuit) |
| **FlagCDN** | Drapeaux SVG | — (gratuit) |

---

## 14. Tests Unitaires

### 14.1 Vue d'ensemble

| Côté | Framework | Suites | Tests | Résultat |
|------|-----------|--------|-------|----------|
| **Backend** | Jest | 36 | 176 | ✅ 100% pass |
| **Frontend** | Vitest | 9 | 48 | ✅ 100% pass |
| **Total** | — | **45** | **224** | ✅ |

### 14.2 Backend — 36 suites / 176 tests (Jest)

#### Auth (2 suites — ~25 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `auth.service.spec.ts` | register (succès, email existant → ConflictException), login (succès, user introuvable, mauvais MDP → UnauthorizedException), getProfile (succès, user manquant → NotFoundException), refreshToken (valide, mauvais type, token expiré), forgotPassword (user existant → envoi email, user inconnu → même message sans leak), resetPassword (succès, mauvais token type, token expiré) |
| `auth.controller.spec.ts` | register (set httpOnly cookie), login (set cookies access + refresh), getProfile, logout (clear cookies), refreshToken, forgotPassword, resetPassword |

#### Forum — Modération (3 suites — ~30 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `content-filter.service.spec.ts` | **sanitize()** : strip `<script>`, strip event handlers (`onerror`), strip `javascript:` URIs, trim whitespace, texte clean inchangé. **validate() local** : contenu vide, whitespace-only, texte clean FR/EN accepté, profanity FR (`bougnoule`), profanity EN (`faggot`), hate speech patterns, spam (buy now, crypto, caractères répétés), ALL CAPS rejeté, lowercase avec caps accepté, mots courts uppercase OK. **validate() OpenAI** : fallback si OpenAI échoue, profanity détecté via fallback |
| `forum-message.service.spec.ts` | create (sanitize + validate → save), create rejeté (profanity/hate), findAll, findOne, update (sanitize + validate), update rejeté (spam), remove |
| `forum-topic.service.spec.ts` | create (validate title + content, sanitize, save), create rejeté (title profanity, content hate), findAll, findOne, update (validate + sanitize), update rejeté, remove, lockTopic, pinTopic |

#### Forum Controllers (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `forum-message.controller.spec.ts` | create, findAll, findOne, update, remove, moderatorRemove, report, getReports, getReportStats, resolveReport |
| `forum-topic.controller.spec.ts` | create, findAll, findOne, update, remove, lockTopic, pinTopic, moderatorRemove |

#### User (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `user.service.spec.ts` | getProfile, updateProfile, deleteAccount |
| `user.controller.spec.ts` | GET /me, PATCH /me, DELETE /me (strip passwordHash) |

#### Country (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `country.service.spec.ts` | CRUD (create, findAll, findOne, update, remove) |
| `country.controller.spec.ts` | Routes CRUD correspondantes |

#### Continent (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `continent.service.spec.ts` | CRUD |
| `continent.controller.spec.ts` | Routes CRUD |

#### City (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `city.service.spec.ts` | CRUD |
| `city.controller.spec.ts` | Routes CRUD |

#### CityComparison (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `city-comparison.service.spec.ts` | CRUD |
| `city-comparison.controller.spec.ts` | Routes CRUD |

#### CostOfLiving (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `cost-of-living.service.spec.ts` | Recherche, cache, seed |
| `cost-of-living.controller.spec.ts` | Routes search, seed |

#### JobOffer (2 suites)

| Fichier | Tests couverts |
|---------|---------------|
| `job-offer.service.spec.ts` | CRUD + search Adzuna |
| `job-offer.controller.spec.ts` | Routes CRUD + search |

#### Autres modules (13 suites)

| Module | Fichiers | Tests |
|--------|----------|-------|
| Guide | service + controller | CRUD |
| Checklist | service + controller | CRUD |
| Resource | service + controller | CRUD |
| AdminProcedure | service + controller | CRUD |
| ProcedureTracking | service + controller | CRUD |
| Notification | service + controller | CRUD |
| Experience | service + controller | CRUD |
| AppController | `app.controller.spec.ts` | Health check |

### 14.3 Frontend — 9 suites / 48 tests (Vitest)

#### API Layer (4 suites — 27 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `auth.test.ts` | login (POST /auth/login), register (POST /auth/register), getProfile (GET /auth/profile), logout (POST /auth/logout), refresh (POST /auth/refresh) |
| `user.test.ts` | getProfile (GET /users/me), updateProfile (PATCH /users/me), deleteAccount (DELETE /users/me) |
| `forum-topics.test.ts` | findAll (GET), findOne (GET/:id), create (POST), update (PATCH/:id), remove (DELETE/:id), lockTopic (PATCH/:id/lock), pinTopic (PATCH/:id/pin), moderatorRemove (DELETE /moderate/:id) |
| `forum-messages.test.ts` | findAll, findOne, create, update, remove, moderatorRemove, report (POST /report), getReports (GET /reports/all), getReports avec status filter, getReportStats, resolveReport (PATCH /reports/:id/resolve) |

#### Composants (2 suites — 6 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `ProtectedRoute.test.tsx` | Redirige vers /auth/login si non authentifié, affiche les enfants si authentifié, affiche loader pendant chargement |
| `PublicRoute.test.tsx` | Redirige vers /dashboard si déjà authentifié, affiche les enfants si non authentifié, affiche loader pendant chargement |

#### Contextes (1 suite — 8 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `AuthContext.test.tsx` | login() met à jour l'état user, login() gère l'erreur, register() met à jour l'état user, register() gère l'erreur, logout() réinitialise user, logout() gère l'erreur réseau gracieusement, isAuthenticated reflète l'état, refreshUser() met à jour le profil |

#### Hooks (2 suites — 7 tests)

| Fichier | Tests couverts |
|---------|---------------|
| `useAuth.test.tsx` | Retourne le contexte si dans AuthProvider, throw error si hors AuthProvider |
| `useForum.test.tsx` | useForumTopics retourne les topics, useForumTopic retourne un topic, useCreateTopic crée un topic, useUpdateTopic met à jour un topic, useDeleteTopic supprime un topic |

### 14.4 Stratégie de Test

| Aspect | Approche |
|--------|----------|
| **Pattern** | AAA (Arrange, Act, Assert) |
| **Mocking** | `jest.fn()` / `vi.fn()` pour les dépendances (repository, services, API client) |
| **DI Testing** | `@nestjs/testing` — `Test.createTestingModule()` avec providers mockés |
| **API Mocking** | `vi.mock('../lib/api')` côté frontend pour isoler les appels HTTP |
| **Couverture** | Tous les services et controllers backend, API layer + auth context + routing frontend |
| **CI** | Exécutés automatiquement dans GitHub Actions et GitLab CI |

### 14.5 Commandes

```bash
# Backend (Jest)
cd backend
npm run test                 # Lancer tous les tests
npm run test:watch           # Mode watch
npm run test:cov             # Avec rapport de couverture
npm run test:e2e             # Tests E2E

# Frontend (Vitest)
cd skywalk-frontend
npm run test                 # Lancer tous les tests (48)
npm run test:watch           # Mode watch
```

---

*Documentation générée le 13/02/2026 — Branche `develop`*
