# 🌍 SkyWalk — Plateforme d'Aide à l'Expatriation

## Document de présentation du projet

---

## 📋 1. Vue d'ensemble

**SkyWalk** est une plateforme web complète d'accompagnement à l'expatriation. Elle permet aux utilisateurs de planifier, organiser et réussir leur projet d'expatriation grâce à des outils intelligents, un forum communautaire modéré, et des données en temps réel sur le coût de la vie, le logement et le marché de l'emploi dans différents pays.

| Élément | Détail |
|---------|--------|
| **Type** | Application Web Full-Stack |
| **Backend** | NestJS (Node.js / TypeScript) |
| **Frontend** | React 19 + TypeScript + Vite 7 |
| **Base de données** | PostgreSQL (via TypeORM) |
| **Déploiement** | Docker / Docker Compose |
| **Tests** | Jest (backend) + Vitest (frontend) |

---

## 🏗️ 2. Architecture technique

### Stack Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| NestJS | 10.x | Framework API REST |
| TypeORM | 11.x | ORM / Migrations |
| PostgreSQL | — | Base de données relationnelle |
| Passport + JWT | — | Authentification (access + refresh tokens) |
| bcrypt | 6.x | Hachage des mots de passe |
| class-validator | 0.14 | Validation des DTOs |
| OpenAI API | 6.x | Modération automatique du contenu (forum) |
| Axios | 1.13 | Appels API externes (RapidAPI, etc.) |
| Throttler | 6.x | Rate limiting |

### Stack Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.1 | UI Framework |
| TypeScript | — | Typage statique |
| Vite | 7.x | Bundler / Dev server |
| TanStack React Query | 5.83 | Gestion du state serveur / cache |
| React Router DOM | 7.7 | Routing SPA |
| Tailwind CSS | 4.x | Styling utility-first |
| i18next | 25.x | Internationalisation (FR / EN) |
| Lucide React | — | Icônes |
| @dnd-kit | — | Drag & Drop (dashboard) |

### Infrastructure
| Outil | Rôle |
|-------|------|
| Docker | Containerisation backend + frontend + PostgreSQL |
| Docker Compose | Orchestration multi-conteneurs (dev + prod) |
| Nginx | Reverse proxy frontend (production) |

---

## 📊 3. Chiffres clés du projet

| Métrique | Valeur |
|----------|--------|
| **Lignes de code source backend** | ~8 400 lignes |
| **Lignes de code source frontend** | ~23 300 lignes |
| **Total lignes de code** | **~31 700 lignes** |
| **Endpoints API REST** | **110 endpoints** |
| **Modules backend** | **24 modules** |
| **Features frontend** | **13 features** |
| **Migrations de base de données** | 11 migrations |
| **Langues supportées** | 2 (Français, Anglais) |
| **Fichiers Dockerfile** | 2 (backend + frontend) |
| **Docker Compose configs** | 2 (dev + prod) |

---

## 🧩 4. Modules fonctionnels

### Backend — 24 modules API

| Module | Description |
|--------|-------------|
| **auth** | Inscription, connexion, JWT (access + refresh), cookies httpOnly, mot de passe oublié/reset |
| **user** | Profil utilisateur (CRUD), suppression de compte |
| **country** | Gestion des pays (CRUD admin, relations continent) |
| **continent** | Gestion des continents |
| **city** | Gestion des villes |
| **city-comparison** | Comparaison entre villes |
| **cost-of-living** | Coût de la vie (API RapidAPI + cache mémoire 6h + cache DB 30j) |
| **destinations** | Catalogue de destinations avec statistiques |
| **expatriation-project** | Projet d'expatriation personnalisé (étapes, checklist) |
| **checklist** | Checklists de préparation |
| **procedure-tracking** | Suivi des procédures administratives |
| **admin-procedure** | Procédures administratives par pays |
| **forum-topic** | Forum : création/gestion des sujets (lock, pin, modération) |
| **forum-message** | Forum : messages, signalements, modération, statistiques |
| **content-filter** | Filtre de contenu intelligent (local + OpenAI Moderation API) |
| **housing** | Recherche de logements |
| **job-offer** | Offres d'emploi |
| **experience** | Retours d'expérience |
| **guide** | Guides pratiques |
| **resource** | Ressources utiles |
| **notification** | Système de notifications |
| **business-sector** | Secteurs d'activité |
| **global-search** | Recherche globale (DB + FAQ client-side) |
| **oecd-migration** | Données de migration OCDE |

### Frontend — 13 features

| Feature | Description |
|---------|-------------|
| **landing** | Page d'accueil |
| **auth** | Pages login / register |
| **onboarding** | Parcours d'intégration nouvel utilisateur |
| **dashboard** | Tableau de bord personnalisé (widgets drag & drop) |
| **destinations** | Explorer les destinations, fiches pays |
| **projects** | Gestion du projet d'expatriation |
| **cost-of-living** | Visualisation du coût de la vie |
| **comparison** | Comparaison entre villes |
| **forum** | Forum communautaire avec modération |
| **profile** | Gestion du profil utilisateur |
| **search** | Recherche globale |
| **services** | Pages de services |
| **forms** | Formulaires communs |

### Composants partagés
- `NavBar` — Barre de navigation responsive avec menu mobile
- `Footer` — Pied de page
- `ProtectedRoute` — Route protégée (redirect si non connecté)
- `PublicRoute` — Route publique (redirect si déjà connecté)
- `PageHeader`, `PageSearch`, `Breadcrumbs`
- `GuestBanner`, `AuthPromptCard`
- `GlobalSearchModal`
- `ScrollToTop`, `CurrencySelector`

---

## 🔐 5. Sécurité

| Fonctionnalité | Implémentation |
|----------------|----------------|
| **Authentification** | JWT avec access token + refresh token |
| **Stockage tokens** | localStorage côté client, cookies httpOnly côté serveur |
| **Hachage mots de passe** | bcrypt (salt rounds 10) |
| **Validation des entrées** | class-validator sur tous les DTOs |
| **Protection CSRF** | Cookies SameSite + CORS configuré |
| **Rate Limiting** | @nestjs/throttler |
| **Rôles** | USER / ADMIN avec RolesGuard |
| **Modération contenu** | Double filtre : local (mots interdits) + OpenAI Moderation API |
| **Signalements** | Système de reports avec workflow de résolution (pending → resolved/rejected) |

---

## 🧪 6. Tests

### Résultats globaux

| Environnement | Suites | Tests | Status |
|---------------|:------:|:-----:|:------:|
| **Backend (Jest)** | 36 | 176 | ✅ Tout passe |
| **Frontend (Vitest)** | 9 | 48 | ✅ Tout passe |
| **TOTAL** | **45** | **224** | ✅ **100% vert** |

### Détail Backend — 176 tests

| Module testé | Nb tests | Couverture |
|--------------|:--------:|------------|
| ContentFilterService | 21 | Sanitize HTML, validation locale, fallback OpenAI, mots interdits, cas limites |
| ForumMessageService | 19 | CRUD complet, modération, signalements, résolution, statistiques |
| AuthService | 16 | Register, login, profile, refresh token, forgot/reset password |
| ForumTopicService | 15 | CRUD avec content filter, lock/pin/moderatorRemove |
| ForumMessageController | 14 | Toutes les routes REST + modération + reports |
| UserService | 13 | Create (bcrypt hash), ConflictException, findAll/findOne/findByEmail, update (rehash + fullName), remove |
| ForumTopicController | 9 | Toutes les routes REST |
| AuthController | 8 | Cookies httpOnly, toutes les routes |
| CountryService | 8 | CRUD + NotFoundException + relation continent |
| ContinentService | 8 | CRUD + NotFoundException |
| CostOfLivingService | 7 | Validation pays, aliases, cache mémoire, getCachedDataByCityId |
| CountryController | 6 | Routes CRUD, parsing id |
| ContinentController | 6 | Routes CRUD, parsing id |
| UserController | 4 | getProfile/updateProfile (strip passwordHash), deleteAccount |
| 22 stubs scaffolding | 22 | Services sans logique métier → 1 test « should be defined » chacun |

### Détail Frontend — 48 tests

| Module testé | Nb tests | Couverture |
|--------------|:--------:|------------|
| forumMessagesApi | 11 | findAll, findOne, create, update, remove, moderatorRemove, report, getReports ±status, getReportStats, resolveReport |
| AuthContext | 8 | Init ±token, refresh token, clear tokens, login, register, logout, logout si erreur API |
| forumTopicsApi | 8 | findAll, findOne, create, update, remove, lockTopic, pinTopic, moderatorRemove |
| authApi | 5 | login, register, getProfile, logout, refresh |
| useForum hook | 5 | forumKeys factory, useForumTopics, useForumTopic (+ disabled si id=0), useForumMessages |
| ProtectedRoute | 3 | Spinner loading, redirect si non-auth, render outlet si auth |
| PublicRoute | 3 | Spinner loading, redirect si auth, render outlet si non-auth |
| userApi | 3 | getProfile, updateProfile, deleteAccount |
| useAuth hook | 2 | Erreur hors AuthProvider, retourne le contexte |

### Frameworks de test utilisés
| Framework | Environnement | Usage |
|-----------|---------------|-------|
| **Jest** + ts-jest | Backend (NestJS) | Tests unitaires services/controllers |
| **Vitest** | Frontend (React) | Tests unitaires hooks/composants/API |
| **@testing-library/react** | Frontend | Rendu de composants React pour tests |
| **@testing-library/user-event** | Frontend | Simulation d'interactions utilisateur |

---

## 🐳 7. Dockerisation

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├──────────┬──────────┬───────────────────┤
│ Frontend │ Backend  │   PostgreSQL      │
│ (Nginx)  │ (NestJS) │   (Base de       │
│ Port 80  │ Port 3001│   données)       │
│          │          │   Port 5432      │
└──────────┴──────────┴───────────────────┘
```

- **docker-compose.yml** : Configuration production
- **docker-compose.dev.yml** : Configuration développement (hot-reload)
- **backend/Dockerfile** : Build multi-stage Node.js
- **skywalk-frontend/Dockerfile** : Build multi-stage Vite → Nginx

---

## 🌐 8. Internationalisation (i18n)

- **2 langues** : Français 🇫🇷 et Anglais 🇬🇧
- **Framework** : i18next + react-i18next + détection automatique du navigateur
- **Fichiers** : `fr.json`, `en.json` + traductions pays séparées
- Toutes les chaînes de l'interface sont traduites

---

## 🔄 9. APIs externes intégrées

| API | Usage |
|-----|-------|
| **OpenAI Moderation API** | Modération automatique des contenus du forum (détection contenu toxique, haineux, sexuel, violent) |
| **RapidAPI — Cost of Living** | Données en temps réel sur le coût de la vie par ville/pays |
| **REST Countries** | Informations sur les pays (drapeaux, devises, langues) |
| **GeoDB Cities** | Données géographiques sur les villes |

---

## 🎯 10. Fonctionnalités principales

### Pour l'utilisateur
- ✅ Inscription / Connexion sécurisée (JWT + refresh)
- ✅ Parcours d'onboarding personnalisé
- ✅ Dashboard personnalisable (widgets drag & drop)
- ✅ Explorer les destinations d'expatriation
- ✅ Comparer le coût de la vie entre villes
- ✅ Créer et suivre son projet d'expatriation
- ✅ Forum communautaire pour échanger avec d'autres expatriés
- ✅ Recherche globale intelligente (DB + FAQ)
- ✅ Interface bilingue (FR / EN)
- ✅ Profil utilisateur modifiable + suppression de compte

### Pour l'administrateur / modérateur
- ✅ Modération du forum (lock, pin, suppression de sujets/messages)
- ✅ Système de signalements (report → review → resolve/reject)
- ✅ Statistiques de modération (tableau de bord)
- ✅ Filtre de contenu automatique (local + IA OpenAI)
- ✅ Gestion des pays / continents (CRUD admin)
- ✅ Contrôle d'accès par rôles (USER / ADMIN)

---

## 📁 11. Structure du projet

```
GPE_SKYWALK/
├── backend/                     # API NestJS
│   ├── src/
│   │   ├── features/            # 24 modules fonctionnels
│   │   │   ├── auth/            # Authentification JWT
│   │   │   ├── user/            # Gestion utilisateurs
│   │   │   ├── forum-topic/     # Forum — sujets
│   │   │   ├── forum-message/   # Forum — messages + modération
│   │   │   ├── cost-of-living/  # Coût de la vie (cache + API)
│   │   │   ├── country/         # Pays
│   │   │   ├── continent/       # Continents
│   │   │   ├── destinations/    # Destinations
│   │   │   └── ...              # 16 autres modules
│   │   ├── config/              # JWT, TypeORM configs
│   │   └── db/                  # DataSource + 11 migrations
│   ├── test/                    # E2E tests config
│   ├── Dockerfile
│   └── package.json
│
├── skywalk-frontend/            # Frontend React
│   ├── src/
│   │   ├── features/            # 13 features (pages)
│   │   ├── components/          # Composants partagés
│   │   ├── contexts/            # AuthContext
│   │   ├── hooks/               # useAuth, useForum, useProfile...
│   │   ├── api/                 # Couche API (axios)
│   │   ├── types/               # Types TypeScript
│   │   ├── locales/             # Traductions FR/EN
│   │   └── test/                # Setup Vitest
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Production
├── docker-compose.dev.yml       # Développement
└── README.md
```

---

## 🚀 12. Lancement du projet

### Développement local
```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd skywalk-frontend && npm install && npm run dev
```

### Docker
```bash
docker compose up --build
```

### Tests
```bash
# Backend — 176 tests
cd backend && npm test

# Frontend — 48 tests
cd skywalk-frontend && npm test
```

---

*Document généré le 10 février 2026 — Projet SkyWalk*
