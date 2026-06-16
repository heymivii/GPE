# 🌍 Projet SkyWalk — Briefing

## Qu'est-ce que c'est
**SkyWalk** est une **application web full-stack** d'accompagnement à l'**expatriation**. Elle aide les utilisateurs à organiser et réussir leur projet d'expatriation grâce à des outils intelligents, un **forum communautaire modéré**, et des **données en temps réel** sur le coût de la vie, le logement et le marché de l'emploi dans différents pays. C'est un projet d'école (GPE / ETNA).

## Stack technique

**Backend** — NestJS 10 (Node.js / TypeScript)
- TypeORM 11 + **PostgreSQL** (11 migrations)
- Auth : Passport + **JWT** (access + refresh tokens, cookies **httpOnly**), bcrypt
- class-validator (validation DTO), Throttler (rate limiting)
- **OpenAI API** pour la modération automatique du forum
- Axios pour les appels aux APIs externes

**Frontend** — React 19 + TypeScript + **Vite 7**
- TanStack React Query 5 (state serveur / cache), React Router 7 (SPA)
- **Tailwind CSS 4**, Lucide (icônes), @dnd-kit (drag & drop du dashboard)
- **i18next** : internationalisation FR / EN

**Infra & qualité**
- **Docker / Docker Compose** (dev + prod), Nginx en reverse proxy frontend
- Déploiement : backend sur **Heroku**, frontend sur **Vercel**, base **Supabase/PostgreSQL**
- Tests : **Jest** (backend) + **Vitest** (frontend) — ~224 tests
- CI/CD GitHub Actions (test, build, docker)

## Chiffres clés
- ~31 700 lignes de code (~8 400 back / ~23 300 front)
- **110 endpoints** API REST · **24 modules** backend · **13 features** frontend
- **2 langues** (FR/EN) · **4 pays** réellement couverts : France, Japon, États-Unis, Suisse (≈20 villes)

## Architecture
Monorepo : `backend/` (API NestJS, architecture modulaire par feature) + `skywalk-frontend/` (React, architecture par feature). Le frontend consomme l'API REST ; React Query gère le cache côté client.

**24 modules backend** : auth, user, country, continent, city, city-comparison, cost-of-living, destinations, expatriation-project, checklist, procedure-tracking, admin-procedure, forum-topic, forum-message, resource, notification, business-sector, global-search, oecd-migration, experience, guide, housing, job-offer, newsletter.

**Features frontend** : landing, auth, onboarding, dashboard, destinations, projects, cost-of-living, comparison, forum, profile, search, services, blog, visa, forms.

## Fonctionnalités principales
- Inscription / connexion sécurisée (JWT + refresh), contrôle d'accès par rôles (USER / ADMIN)
- Parcours d'**onboarding** personnalisé
- **Dashboard** personnalisable (widgets drag & drop)
- Exploration des **destinations** (fiches pays)
- Gestion d'un **projet d'expatriation** avec checklist et suivi de procédures
- **Coût de la vie** : visualisation, comparateur de villes (graphique radar), cache mémoire 6h + cache DB 30j
- **Forum** communautaire avec modération (filtre local + IA OpenAI, signalements, stats, lock/pin)
- **Recherche globale** multi-entités + FAQ

## APIs externes intégrées
- **OpenAI Moderation** — modération auto du forum (contenu toxique/haineux/violent)
- **RapidAPI – Cost of Living** — coût de la vie temps réel par ville/pays
- **REST Countries** — infos pays (drapeaux, devises, langues)
- **GeoDB Cities** — données géographiques des villes
- (**Adzuna** — recherche d'offres d'emploi)

## Workflow git
Branches `main` / `develop`, branches de feature (`feature/...`, `fix/...`), commits conventionnels (feat/fix/chore/docs), PR vers `develop` puis squash & merge.
