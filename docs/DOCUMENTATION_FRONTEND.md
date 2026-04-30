# 📘 Documentation Complète — SkyWalk Frontend

> **Application React 19 · TypeScript · Vite 7 · Tailwind CSS 4**
> Dernière mise à jour : juillet 2025

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Installation & Démarrage](#4-installation--démarrage)
5. [Routing & Navigation](#5-routing--navigation)
6. [Gestion de l'état](#6-gestion-de-létat)
7. [Couche API (Axios)](#7-couche-api-axios)
8. [Fonctionnalités (Features)](#8-fonctionnalités-features)
9. [Composants partagés](#9-composants-partagés)
10. [Hooks personnalisés](#10-hooks-personnalisés)
11. [Internationalisation (i18n)](#11-internationalisation-i18n)
12. [Styles & Tailwind](#12-styles--tailwind)
13. [Tests](#13-tests)
14. [Build & Déploiement](#14-build--déploiement)

---

## 1. Vue d'ensemble

**SkyWalk Frontend** est une Single Page Application (SPA) destinée aux expatriés et futurs expatriés. Elle permet de :

- Découvrir des destinations d'expatriation avec données enrichies
- Comparer le coût de la vie entre pays
- Rechercher des offres d'emploi à l'international
- Gérer des projets d'expatriation avec checklist
- Participer à un forum communautaire modéré
- Suivre un onboarding personnalisé en 7 étapes
- Consulter un dashboard personnalisable avec widgets drag-and-drop

**Chiffres clés** : ~23 300 lignes de code · 13 features · 107+ fichiers TypeScript/TSX · 9 suites de tests (48 tests)

---

## 2. Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | React | 19.1 |
| **Langage** | TypeScript | 5.8 |
| **Bundler** | Vite | 7.x |
| **CSS** | Tailwind CSS | 4.1 |
| **Routing** | React Router DOM | 7.7 |
| **State Server** | TanStack React Query | 5.83 |
| **HTTP Client** | Axios | 1.10 |
| **i18n** | i18next + react-i18next | 25.7 / 16.3 |
| **Icônes** | Lucide React | 0.525 |
| **Drag & Drop** | @dnd-kit/core + sortable | 6.3 / 10.0 |
| **Tests** | Vitest + Testing Library | 3.2 / 16.3 |

### Dépendances de développement

- `@testing-library/jest-dom` — Matchers DOM supplémentaires
- `@testing-library/user-event` — Simulation d'interactions utilisateur
- `jsdom` — Environnement DOM pour les tests
- `eslint` + `typescript-eslint` — Linting
- `postcss` + `autoprefixer` — Post-traitement CSS

---

## 3. Architecture du projet

```
skywalk-frontend/
├── public/                     # Assets statiques (logo, images)
├── scripts/                    # Scripts utilitaires (fix-country-ids.js)
├── src/
│   ├── main.tsx                # Point d'entrée React
│   ├── i18n.ts                 # Configuration i18next
│   ├── vite-env.d.ts           # Déclarations de types Vite
│   │
│   ├── api/                    # 📡 Couche API (13 fichiers)
│   │   ├── auth.ts
│   │   ├── checklist.ts
│   │   ├── costOfLiving.ts
│   │   ├── country.ts
│   │   ├── destinations.ts
│   │   ├── expatriation-project.ts
│   │   ├── forum-messages.ts
│   │   ├── forum-topics.ts
│   │   ├── housing.ts
│   │   ├── jobOffers.ts
│   │   └── user.ts
│   │
│   ├── assets/                 # Assets importés (SVG, images)
│   │
│   ├── components/             # 🧩 Composants partagés (12 fichiers)
│   │   ├── AuthPromptCard.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── Footer.tsx
│   │   ├── GuestBanner.tsx
│   │   ├── NavBar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PageSearch.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── ScrollToTop.tsx
│   │
│   ├── contexts/               # 🔄 Contextes React
│   │   └── AuthContext.tsx
│   │
│   ├── data/                   # Données statiques
│   │
│   ├── features/               # 🏗️ Modules fonctionnels (13 features)
│   │   ├── auth/
│   │   ├── comparison/
│   │   ├── cost-of-living/
│   │   ├── dashboard/
│   │   ├── destinations/
│   │   ├── forms/
│   │   ├── forum/
│   │   ├── landing/
│   │   ├── onboarding/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── search/
│   │   └── services/
│   │
│   ├── hooks/                  # 🪝 Hooks globaux
│   │   ├── useAuth.ts
│   │   ├── useCountryData.ts
│   │   ├── useForum.ts
│   │   ├── useGlobalSearch.ts
│   │   └── useProfile.ts
│   │
│   ├── layouts/                # Layouts (MainLayout, AuthLayout)
│   ├── lib/                    # Utilitaires (api.ts, queryClient.ts)
│   ├── locales/                # Fichiers de traduction (FR/EN)
│   ├── pages/                  # Pages legacy
│   ├── routes/                 # Configuration du routeur
│   ├── styles/                 # Fichiers CSS globaux
│   └── types/                  # Définitions TypeScript
│
├── index.html                  # Template HTML
├── vite.config.ts              # Configuration Vite + Vitest
├── tailwind.config.js          # Configuration Tailwind
├── tsconfig.json               # Configuration TypeScript
├── Dockerfile                  # Image Docker multi-stage
└── nginx.conf                  # Configuration Nginx (production)
```

### Principe d'architecture

Le frontend suit une **architecture Feature-Based** :
- Chaque feature contient ses propres `pages/`, `components/`, `hooks/` et éventuellement `types/`
- Les composants réutilisables vivent dans `src/components/`
- Les hooks partagés vivent dans `src/hooks/`
- La couche API est centralisée dans `src/api/`

---

## 4. Installation & Démarrage

### Prérequis
- Node.js ≥ 18
- npm ou yarn

### Installation

```bash
cd skywalk-frontend
npm install
```

### Variables d'environnement

Créer un fichier `.env` à la racine de `skywalk-frontend/` :

```env
VITE_API_URL=http://localhost:3001/api
```

### Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement Vite (port 5173) |
| `npm run build` | Build TypeScript + Vite pour la production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Exécute ESLint |
| `npm run test` | Exécute les tests Vitest |
| `npm run test:watch` | Tests en mode watch |

---

## 5. Routing & Navigation

Le routeur utilise **React Router DOM v7** avec `createBrowserRouter`.

### Arborescence des routes

| Route | Page | Protection | Description |
|-------|------|------------|-------------|
| `/` | `LandingPage` | PublicRoute | Page d'accueil publique |
| `/auth/login` | `LoginPage` | PublicRoute | Connexion |
| `/auth/register` | `RegisterPage` | PublicRoute | Inscription |
| `/auth/pwdForgot` | `PasswordForgotPage` | PublicRoute | Mot de passe oublié |
| `/search` | `SearchPage` | – | Recherche globale (emploi, destinations) |
| `/services` | `ServicesIndexPage` | – | Index des services |
| `/services/:category` | `ServicePage` | – | Page de service spécifique |
| `/forum` | `ForumPage` | – | Liste des topics du forum |
| `/forum/post/:id` | `PostDetailPage` | – | Détail d'un topic + messages |
| `/forum/post/:id/edit` | `EditTopicPage` | – | Édition d'un topic |
| `/forum/new` | `NewPostPage` | – | Création d'un nouveau topic |
| `/destinations` | `DestinationsPage` | – | Liste des destinations |
| `/destinations/:countrySlug` | `DestinationDetailPage` | – | Détail d'une destination |
| `/comparison` | `CountryComparison` | – | Comparaison de pays |
| `/test/cost-of-living` | `CostOfLivingTestPage` | – | Test coût de la vie |
| `/onboarding` | `OnboardingFlow` | – | Onboarding en 7 étapes |
| `/onboarding/:id` | `OnboardingFlow` | – | Reprise d'onboarding |
| `/dashboard` | `DashboardPage` | ProtectedRoute | Dashboard utilisateur |
| `/dashboard/personalized` | `PersonalizedDashboard` | ProtectedRoute | Dashboard personnalisé |
| `/projects` | `ProjectsPage` | ProtectedRoute | Projets d'expatriation |
| `/projects/:id` | `ProjectDetailPage` | ProtectedRoute | Détail d'un projet |
| `/profile` | `ProfilePage` | ProtectedRoute | Profil utilisateur |
| `/forms` | `FormPage` | ProtectedRoute | Formulaires/questionnaires |

### Layouts

- **`MainLayout`** : Inclut `NavBar` + `Footer` + `ScrollToTop`
- **`AuthLayout`** : Layout simplifié pour les pages d'authentification
- **`ProtectedRoute`** : Redirige vers `/auth/login` si l'utilisateur n'est pas authentifié
- **`PublicRoute`** : Redirige vers `/dashboard` si l'utilisateur est déjà connecté

---

## 6. Gestion de l'état

### 6.1 État serveur — TanStack React Query

Toute la gestion de l'état serveur (données API) passe par **React Query** :

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient();
```

Les hooks personnalisés encapsulent les appels `useQuery` et `useMutation` :

- `useForum()` → 16+ hooks (topics, messages, modération, reports)
- `useCountryData()` → pays, continents, coût de la vie, migration OECD
- `useGlobalSearch()` → recherche multi-catégories
- `useProfile()` → profil utilisateur
- `useChecklistProgress()` → progression de la checklist
- `useDashboardPreferences()` → préférences de widgets

**Clés de cache typiques** :
- `['forum-topics']`, `['forum-topic', id]`
- `['forum-messages', topicId]`
- `['countries']`, `['continents']`
- `['destinations']`, `['destination', slug]`
- `['projects']`, `['project', id]`
- `['user-profile']`

### 6.2 État client — AuthContext

L'authentification est gérée via un **React Context** :

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}
```

**Fonctionnement** :
1. Au montage, `AuthContext` vérifie si un `access_token` existe dans `localStorage`
2. Si oui, appelle `GET /api/auth/profile` pour récupérer les données utilisateur
3. Le token est stocké dans `localStorage`, le refresh token dans un **cookie httpOnly**
4. L'intercepteur Axios ajoute automatiquement le header `Authorization: Bearer <token>`
5. Un mécanisme de **refresh automatique** gère l'expiration du token (intercepteur response 401)

---

## 7. Couche API (Axios)

### 7.1 Configuration du client

```typescript
// lib/api.ts
const apiClient = axios.create({
  baseURL: VITE_API_URL,     // http://localhost:3001/api
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,      // Envoie les cookies httpOnly
});
```

**Intercepteurs** :
- **Request** : Ajoute `Authorization: Bearer <token>` si un token existe dans `localStorage`
- **Response** : Si erreur 401 (non-auth endpoint), tente un refresh token automatique et rejoue la requête

### 7.2 Modules API

| Fichier | Endpoints | Description |
|---------|-----------|-------------|
| `auth.ts` | register, login, getProfile, logout, refresh, forgotPassword, resetPassword | Authentification complète |
| `forum-topics.ts` | getAll, getById, create, update, delete, lock, pin, moderate | Topics du forum |
| `forum-messages.ts` | getByTopic, getById, create, update, delete, moderate, report, getReports, getReportStats, resolveReport | Messages + modération |
| `user.ts` | getMe, updateMe, deleteMe | Gestion du profil |
| `country.ts` | getAll, getById, create, update, delete | Pays |
| `destinations.ts` | getAll, getBySlug | Destinations enrichies |
| `costOfLiving.ts` | search | Coût de la vie |
| `expatriation-project.ts` | create, getAll, getById, update, delete, count, addChecklistItem, getChecklist | Projets d'expatriation |
| `checklist.ts` | getByProject, toggle | Items de checklist |
| `jobOffers.ts` | search, getAll, getById, create, update, delete | Offres d'emploi |
| `housing.ts` | search, getAll | Logements |

---

## 8. Fonctionnalités (Features)

### 8.1 🔐 Auth (`features/auth/`)

**Pages** : LoginPage, RegisterPage, PasswordForgotPage, ResetPasswordPage
**Composants** : LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
**Hook** : `useLogin()`

- Formulaires de connexion / inscription avec validation
- Gestion du mot de passe oublié (envoi d'email) et réinitialisation
- Tokens JWT (access + refresh) avec cookies httpOnly
- Redirection automatique post-login

### 8.2 📊 Dashboard (`features/dashboard/`)

**Pages** : DashboardPage, PersonalizedDashboard
**Widgets** (9) :
- `BudgetWidget` — Budget d'expatriation
- `ChecklistWidget` — Progression de la checklist
- `CurrencyWidget` — Taux de change
- `JobOpportunitiesWidget` — Offres d'emploi récentes
- `LocalTimeWidget` — Heure locale de la destination
- `ProfileSummaryWidget` — Résumé du profil
- `RecommendationsWidget` — Recommandations personnalisées
- `WeatherWidget` — Météo de la destination
- `Widget` — Composant wrapper générique

**Composants** : CategoryGrid, PopularDestinations, WelcomeSection
**Hooks** : useChecklistProgress, useDashboardPreferences, useUserData

- Dashboard personnalisable avec **drag-and-drop** (@dnd-kit)
- Les préférences de widgets sont persistées côté utilisateur
- Catégories de services rapides en grille

### 8.3 🌍 Destinations (`features/destinations/`)

**Pages** : DestinationsPage, DestinationDetailPage
**Composants** : CountryCard, CostOfLivingTab

- Liste des pays avec cartes (drapeau, nom, infos clés, nombre d'offres d'emploi)
- Page de détail par pays : données économiques, coût de la vie, statistiques migratoires
- Intégration des données Adzuna (emploi) et OECD (migration)

### 8.4 💬 Forum (`features/forum/`)

**Pages** : ForumPage, PostDetailPage, NewPostPage, EditTopicPage

- Liste des topics avec tri, pagination, recherche
- Détail d'un topic avec messages threaded
- Création / édition / suppression de topics et messages
- **Système de modération** : lock, pin, signalement, résolution de reports
- Filtrage automatique du contenu (OpenAI Moderation API côté backend)
- Bannières visuelles de feedback (succès/erreur) sans `alert()`

### 8.5 🧭 Onboarding (`features/onboarding/`)

**Page** : OnboardingFlow (wizard en 7 étapes)
**Étapes** :
1. `AuthGate` — Vérification de l'authentification
2. `Profile` — Informations personnelles
3. `Objective` — Objectif d'expatriation
4. `Destination` — Choix de destination
5. `Needs` — Besoins spécifiques
6. `Preparation` — Niveau de préparation
7. `Summary` — Récapitulatif

**Composants UI** : Stepper, WizardNav + 9 composants de formulaire
- Wizard multi-étapes avec navigation avant/arrière
- Stepper visuel de progression
- Sauvegarde à chaque étape

### 8.6 📁 Projets (`features/projects/`)

**Pages** : ProjectsPage, ProjectDetailPage
**Hook** : useProjectMutations

- CRUD complet des projets d'expatriation
- Checklist intégrée par projet avec progression
- Compteur de projets actifs

### 8.7 🔍 Search (`features/search/`)

**Page** : SearchPage
**Composants** : SearchBar, JobCard, FilterSection, ResultsSection, InfiniteScrollTrigger

- Recherche multi-catégories (emploi, destinations, forum)
- Filtres dynamiques
- Scroll infini pour les résultats
- Cartes de résultats adaptées au type (JobCard, etc.)

### 8.8 ⚖️ Comparison (`features/comparison/`)

**Page** : CountryComparison
**Composants** : ComparisonTable, CountrySelector
**Hooks** : hooks de données comparatives

- Comparaison côte à côte de 2+ pays
- Tableau comparatif (coût de la vie, emploi, qualité de vie)
- Sélecteur de pays interactif

### 8.9 💰 Cost of Living (`features/cost-of-living/`)

**Page** : CostOfLivingTestPage

- Interface de test pour le coût de la vie
- Recherche par ville + pays
- Affichage des prix par catégorie

### 8.10 🛠️ Services (`features/services/`)

**Pages** : ServicesIndexPage, ServicePage
**Composants** (10) : composants statistiques et outils

- Index des services disponibles par catégorie
- Pages de service individuelles avec outils et statistiques

### 8.11 👤 Profile (`features/profile/`)

**Page** : ProfilePage

- Affichage et édition du profil utilisateur
- Suppression de compte

### 8.12 📝 Forms (`features/forms/`)

**Page** : FormPage

- Questionnaires et formulaires dynamiques

### 8.13 🏠 Landing (`features/landing/`)

**Page** : LandingPage
**Composants** : Dropdown, LandingToolsSection

- Page d'accueil publique avec présentation de la plateforme
- Section outils et call-to-action

---

## 9. Composants partagés

| Composant | Description |
|-----------|-------------|
| **NavBar** | Barre de navigation responsive avec menu mobile, recherche globale, sélecteur de langue, avatar utilisateur |
| **Footer** | Pied de page avec liens et informations |
| **ProtectedRoute** | HOC de protection de route (redirige si non authentifié) |
| **PublicRoute** | HOC de route publique (redirige si déjà authentifié) |
| **PageHeader** | En-tête de page standardisé avec titre et description |
| **PageSearch** | Barre de recherche réutilisable pour les pages |
| **Breadcrumbs** | Fil d'Ariane dynamique |
| **GuestBanner** | Bannière incitant les visiteurs à s'inscrire |
| **AuthPromptCard** | Carte d'incitation à la connexion |
| **ScrollToTop** | Remonte automatiquement en haut de page lors de la navigation |
| **GlobalSearchModal** | Modale de recherche globale (⌘K) |
| **CurrencySelector** | Sélecteur de devise |

---

## 10. Hooks personnalisés

### `useAuth()` (`hooks/useAuth.ts`)
Accède au contexte d'authentification. Retourne `{ user, loading, login, register, logout, updateUser }`.

### `useForum()` (`hooks/useForum.ts`) — ~270 lignes, 16+ hooks

| Hook | Type | Description |
|------|------|-------------|
| `useForumTopics()` | Query | Liste des topics |
| `useForumTopic(id)` | Query | Détail d'un topic |
| `useCreateTopic()` | Mutation | Créer un topic |
| `useUpdateTopic()` | Mutation | Modifier un topic |
| `useDeleteTopic()` | Mutation | Supprimer un topic |
| `useLockTopic()` | Mutation | Verrouiller un topic |
| `usePinTopic()` | Mutation | Épingler un topic |
| `useModerateTopic()` | Mutation | Modérer un topic (admin) |
| `useForumMessages(topicId)` | Query | Messages d'un topic |
| `useCreateMessage()` | Mutation | Poster un message |
| `useUpdateMessage()` | Mutation | Modifier un message |
| `useDeleteMessage()` | Mutation | Supprimer un message |
| `useModerateMessage()` | Mutation | Modérer un message (admin) |
| `useReportMessage()` | Mutation | Signaler un message |
| `useReports()` | Query | Liste des signalements |
| `useReportStats()` | Query | Statistiques de signalements |
| `useResolveReport()` | Mutation | Résoudre un signalement |

### `useCountryData()` (`hooks/useCountryData.ts`) — ~180 lignes
Hooks pour les données pays : `useCountries()`, `useContinents()`, `useCostOfLiving()`, `useMigrationData()`, etc.

### `useGlobalSearch()` (`hooks/useGlobalSearch.ts`) — ~220 lignes
Hook de recherche globale multi-catégories avec debounce et mise en cache.

### `useProfile()` (`hooks/useProfile.ts`)
Hook de gestion du profil utilisateur (query + mutations).

---

## 11. Internationalisation (i18n)

Le frontend supporte **2 langues** : 🇫🇷 Français (défaut) et 🇬🇧 Anglais.

**Configuration** :
```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
```

**Fichiers de traduction** : `src/locales/fr/` et `src/locales/en/`

**Utilisation** :
```tsx
const { t } = useTranslation();
return <h1>{t('dashboard.title')}</h1>;
```

Le sélecteur de langue est intégré dans la `NavBar`.

---

## 12. Styles & Tailwind

- **Tailwind CSS 4** avec configuration personnalisée (`tailwind.config.js`)
- **PostCSS** + **Autoprefixer** pour la compatibilité navigateurs
- Classes utilitaires Tailwind directement dans les composants TSX
- Styles globaux dans `src/styles/`
- Responsive design (mobile-first)

---

## 13. Tests

### Configuration

```typescript
// vite.config.ts (section test)
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

### Fichier de setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Suites de tests (9 suites, 48 tests)

| Fichier | Tests | Description |
|---------|-------|-------------|
| `AuthContext.test.tsx` | 8 | Contexte d'auth (login, register, logout, refresh, état initial) |
| `useAuth.test.tsx` | 2 | Hook useAuth |
| `ProtectedRoute.test.tsx` | 3 | Protection de route (redirect, accès, loading) |
| `PublicRoute.test.tsx` | 3 | Route publique (redirect si connecté) |
| `auth.test.ts` | 5 | API auth (register, login, profile, logout, refresh) |
| `forum-topics.test.ts` | 8 | API forum topics (CRUD, lock, pin, moderate) |
| `forum-messages.test.ts` | 11 | API forum messages (CRUD, moderate, report, resolve) |
| `user.test.ts` | 3 | API user (getMe, updateMe, deleteMe) |
| `useForum.test.tsx` | 5 | Hooks du forum (topics, messages, mutations) |

### Exécution

```bash
npm run test        # Exécution unique
npm run test:watch  # Mode watch
```

---

## 14. Build & Déploiement

### Build de production

```bash
npm run build
```

Génère un dossier `dist/` contenant le HTML, JS et CSS optimisés.

### Docker

Le frontend utilise un **Dockerfile multi-stage** :

1. **Stage 1 (build)** : `node:18-alpine` → `npm run build`
2. **Stage 2 (serve)** : `nginx:alpine` → sert le `dist/` via Nginx

**Configuration Nginx** (`nginx.conf`) :
- Sert les fichiers statiques depuis `/usr/share/nginx/html`
- Redirige toutes les routes vers `index.html` (SPA routing)
- Proxy `/api` vers le backend NestJS

### Docker Compose

```bash
# Développement
docker compose -f docker-compose.dev.yml up

# Production
docker compose up
```

Le frontend est exposé sur le **port 80** (Nginx) en production et **port 5173** en développement.

---

## Diagramme simplifié de l'architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
├─────────────────────────────────────────────────┤
│  React Router DOM v7                            │
│  ┌─────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ Layouts  │  │ Features   │  │ Components   │ │
│  │ (Main,   │  │ (13 modules│  │ (NavBar,     │ │
│  │  Auth)   │  │  auth,     │  │  Footer,     │ │
│  │          │  │  dashboard,│  │  Protected,  │ │
│  │          │  │  forum...) │  │  Public...)  │ │
│  └─────────┘  └─────┬──────┘  └──────────────┘ │
│                      │                           │
│              ┌───────┴───────┐                   │
│              │ Custom Hooks  │                   │
│              │ (useForum,    │                   │
│              │  useAuth...)  │                   │
│              └───────┬───────┘                   │
│                      │                           │
│    ┌─────────────────┼─────────────────┐         │
│    │         State Management          │         │
│    │  ┌──────────────┐ ┌────────────┐  │         │
│    │  │ React Query  │ │AuthContext │  │         │
│    │  │ (server      │ │(client     │  │         │
│    │  │  state)      │ │ state)     │  │         │
│    │  └──────┬───────┘ └────────────┘  │         │
│    └─────────┼─────────────────────────┘         │
│              │                                   │
│       ┌──────┴──────┐                            │
│       │  API Layer  │  ← Axios + interceptors    │
│       │  (13 files) │                            │
│       └──────┬──────┘                            │
│              │  HTTP (withCredentials: true)      │
├──────────────┼──────────────────────────────────┤
               │
        ┌──────┴──────┐
        │   Backend   │  ← NestJS (port 3001)
        │   REST API  │
        └─────────────┘
```

---

*Documentation générée pour le projet SkyWalk — Plateforme d'aide à l'expatriation*
