# 📗 Swagger / API Documentation — SkyWalk Backend

> **NestJS 10 · TypeORM 11 · PostgreSQL · JWT + httpOnly Cookies**
> Base URL : `http://localhost:3001/api`
> Dernière mise à jour : juillet 2025

---

## Table des matières

1. [Informations générales](#1-informations-générales)
2. [Authentification](#2-authentification)
3. [Endpoints API](#3-endpoints-api)
   - [Auth](#31-auth)
   - [User](#32-user)
   - [Forum Topic](#33-forum-topic)
   - [Forum Message](#34-forum-message)
   - [Country](#35-country)
   - [Continent](#36-continent)
   - [Destinations](#37-destinations)
   - [Cost of Living](#38-cost-of-living)
   - [Expatriation Project](#39-expatriation-project)
   - [Job Offer](#310-job-offer)
   - [Global Search](#311-global-search)
   - [OECD Migration](#312-oecd-migration)
   - [City](#313-city)
   - [City Comparison](#314-city-comparison)
   - [Checklist](#315-checklist)
   - [Resource](#316-resource)
   - [Guide](#317-guide)
   - [Experience](#318-experience)
   - [Notification](#319-notification)
   - [Admin Procedure](#320-admin-procedure)
   - [Procedure Tracking](#321-procedure-tracking)
   - [Business Sector](#322-business-sector)
   - [Housing](#323-housing)
4. [Modèles de données (DTOs)](#4-modèles-de-données-dtos)
5. [Codes de réponse HTTP](#5-codes-de-réponse-http)
6. [Rate Limiting](#6-rate-limiting)
7. [Configuration CORS](#7-configuration-cors)

---

## 1. Informations générales

| Propriété | Valeur |
|-----------|--------|
| **Titre** | SkyWalk API |
| **Version** | 1.0.0 |
| **Base URL** | `/api` |
| **Port** | 3001 (dev) / 3000 (docker) |
| **Format** | JSON |
| **Authentification** | JWT Bearer Token + httpOnly Cookie (refresh) |
| **Validation** | class-validator (whitelist, forbidNonWhitelisted, transform) |
| **Sécurité** | Helmet, CORS, Rate Limiting (@nestjs/throttler) |

### Pipeline de requête

```
Request → Helmet → CORS → Cookie Parser → Global Prefix (/api)
        → ValidationPipe → Throttle Guard → JWT Guard → Controller
```

---

## 2. Authentification

### Mécanisme

Le backend utilise un système **JWT double token** :

| Token | Stockage | Durée de vie | Usage |
|-------|----------|--------------|-------|
| **Access Token** | `localStorage` (client) | Court (15–60 min) | Header `Authorization: Bearer <token>` |
| **Refresh Token** | Cookie `httpOnly` (`refresh_token`) | Long (7 jours) | Renouvellement automatique |

### Headers requis

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Rôles

| Rôle | Description |
|------|-------------|
| `user` | Utilisateur standard |
| `moderator` | Modérateur du forum |
| `admin` | Administrateur complet |

### Guards utilisés

| Guard | Description |
|-------|-------------|
| `JwtAuthGuard` | Vérifie le JWT access token |
| `RolesGuard` | Vérifie le rôle utilisateur (admin, moderator) |

---

## 3. Endpoints API

### 3.1 Auth

**Préfixe** : `/api/auth`

---

#### `POST /api/auth/register`

Inscription d'un nouvel utilisateur.

- **Auth** : Non requise
- **Rate Limit** : 5 requêtes / minute
- **Body** :

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

- **Réponse** `201` :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "user"
  }
}
```

- **Cookie Set** : `refresh_token` (httpOnly, secure, sameSite: strict)

---

#### `POST /api/auth/login`

Connexion d'un utilisateur existant.

- **Auth** : Non requise
- **Rate Limit** : 10 requêtes / minute
- **Body** :

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

- **Réponse** `200` :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

- **Cookie Set** : `refresh_token` (httpOnly)

---

#### `GET /api/auth/profile`

Récupère le profil de l'utilisateur connecté.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` :

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

#### `POST /api/auth/logout`

Déconnexion (supprime le cookie refresh).

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` :

```json
{ "message": "Logged out successfully" }
```

- **Cookie Clear** : `refresh_token`

---

#### `POST /api/auth/refresh`

Renouvelle l'access token via le refresh token (cookie).

- **Auth** : Non requise (utilise le cookie)
- **Rate Limit** : 10 requêtes / minute
- **Body** :

```json
{
  "refreshToken": "optionnel_si_cookie_present"
}
```

- **Réponse** `200` :

```json
{
  "access_token": "nouveau_token..."
}
```

---

#### `POST /api/auth/forgot-password`

Envoie un email de réinitialisation du mot de passe.

- **Auth** : Non requise
- **Rate Limit** : 3 requêtes / minute
- **Body** :

```json
{
  "email": "user@example.com"
}
```

- **Réponse** `200` :

```json
{ "message": "Reset email sent" }
```

---

#### `POST /api/auth/reset-password`

Réinitialise le mot de passe avec un token.

- **Auth** : Non requise
- **Rate Limit** : 5 requêtes / minute
- **Body** :

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

- **Réponse** `200` :

```json
{ "message": "Password reset successfully" }
```

---

### 3.2 User

**Préfixe** : `/api/users`

---

#### `GET /api/users/me`

Récupère le profil de l'utilisateur connecté (sans passwordHash).

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` : Objet User (sans `passwordHash`)

---

#### `PATCH /api/users/me`

Met à jour le profil de l'utilisateur connecté.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "firstName": "Jean-Pierre",
  "lastName": "Dupont",
  "bio": "Expatrié en Suisse depuis 2023"
}
```

- **Réponse** `200` : Objet User mis à jour

---

#### `DELETE /api/users/me`

Supprime le compte de l'utilisateur connecté.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` :

```json
{ "message": "Account deleted" }
```

---

### 3.3 Forum Topic

**Préfixe** : `/api/forum-topic`

---

#### `POST /api/forum-topic`

Crée un nouveau topic.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "title": "Expatriation en Suisse",
  "content": "Bonjour, je cherche des conseils...",
  "category": "general"
}
```

- **Réponse** `201` : Objet ForumTopic créé

---

#### `GET /api/forum-topic`

Liste tous les topics.

- **Auth** : Non requise
- **Query** : `?page=1&limit=20&search=suisse&sort=recent`
- **Réponse** `200` : Array de ForumTopic

---

#### `GET /api/forum-topic/:id`

Récupère un topic par ID.

- **Auth** : Non requise
- **Params** : `id` (number)
- **Réponse** `200` : Objet ForumTopic avec relations

---

#### `PATCH /api/forum-topic/:id`

Met à jour un topic (auteur uniquement).

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "title": "Titre modifié",
  "content": "Contenu mis à jour"
}
```

- **Réponse** `200` : Objet ForumTopic mis à jour

---

#### `DELETE /api/forum-topic/:id`

Supprime un topic (auteur uniquement).

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

#### `PATCH /api/forum-topic/:id/lock`

Verrouille / déverrouille un topic.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Réponse** `200` : Objet ForumTopic avec `isLocked: true/false`

---

#### `PATCH /api/forum-topic/:id/pin`

Épingle / désépingle un topic.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Réponse** `200` : Objet ForumTopic avec `isPinned: true/false`

---

#### `DELETE /api/forum-topic/moderate/:id`

Supprime un topic par modération.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Réponse** `200`

---

### 3.4 Forum Message

**Préfixe** : `/api/forum-message`

---

#### `POST /api/forum-message`

Crée un message dans un topic. Le contenu est automatiquement vérifié par le **ContentFilterService** (OpenAI Moderation API + blocklist locale).

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "content": "Mon message...",
  "topicId": 1
}
```

- **Réponse** `201` : Objet ForumMessage
- **Erreur** `400` : Si le contenu est rejeté par la modération automatique

---

#### `GET /api/forum-message`

Liste les messages (filtrage par topic).

- **Auth** : Non requise
- **Query** : `?topicId=1`
- **Réponse** `200` : Array de ForumMessage

---

#### `GET /api/forum-message/:id`

Récupère un message par ID.

- **Auth** : Non requise
- **Réponse** `200` : Objet ForumMessage

---

#### `PATCH /api/forum-message/:id`

Met à jour un message (auteur uniquement). Le contenu modifié est re-vérifié par le filtre.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` : Objet ForumMessage mis à jour

---

#### `DELETE /api/forum-message/:id`

Supprime un message (auteur uniquement).

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

#### `DELETE /api/forum-message/moderate/:id`

Supprime un message par modération.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Réponse** `200`

---

#### `POST /api/forum-message/report`

Signale un message.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "messageId": 42,
  "reason": "Contenu inapproprié"
}
```

- **Réponse** `201` : Objet Report créé

---

#### `GET /api/forum-message/reports/all`

Liste tous les signalements.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Query** : `?status=pending`
- **Réponse** `200` : Array de Report

---

#### `GET /api/forum-message/reports/stats`

Statistiques des signalements.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Réponse** `200` :

```json
{
  "total": 15,
  "pending": 3,
  "resolved": 12
}
```

---

#### `PATCH /api/forum-message/reports/:id/resolve`

Résout un signalement.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin` ou `moderator`
- **Body** :

```json
{
  "action": "dismiss" | "delete_message" | "ban_user",
  "note": "Signalement non justifié"
}
```

- **Réponse** `200` : Objet Report mis à jour

---

### 3.5 Country

**Préfixe** : `/api/country`

---

#### `POST /api/country`

Crée un pays.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Body** :

```json
{
  "countryName": "France",
  "isoCode": "FR",
  "continentId": 1,
  "description": "Pays d'Europe occidentale"
}
```

- **Réponse** `201` : Objet Country

---

#### `GET /api/country`

Liste tous les pays.

- **Auth** : Non requise
- **Réponse** `200` : Array de Country

---

#### `GET /api/country/:id`

Récupère un pays par ID.

- **Auth** : Non requise
- **Réponse** `200` : Objet Country avec relations

---

#### `PATCH /api/country/:id`

Met à jour un pays.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Réponse** `200` : Objet Country mis à jour

---

#### `DELETE /api/country/:id`

Supprime un pays.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Réponse** `200`

---

### 3.6 Continent

**Préfixe** : `/api/continent`

---

#### `POST /api/continent`

Crée un continent.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Body** :

```json
{
  "continentName": "Europe"
}
```

- **Réponse** `201` : Objet Continent

---

#### `GET /api/continent`

Liste tous les continents.

- **Auth** : Non requise
- **Réponse** `200` : Array de Continent

---

#### `GET /api/continent/:id`

Récupère un continent par ID.

- **Auth** : Non requise
- **Réponse** `200` : Objet Continent

---

#### `PATCH /api/continent/:id`

Met à jour un continent.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Réponse** `200`

---

#### `DELETE /api/continent/:id`

Supprime un continent.

- **Auth** : `JwtAuthGuard` ✅ + Rôle `admin`
- **Réponse** `200`

---

### 3.7 Destinations

**Préfixe** : `/api/destinations`

---

#### `GET /api/destinations`

Liste toutes les destinations enrichies (pays + nombre d'offres d'emploi Adzuna).

- **Auth** : Non requise
- **Réponse** `200` :

```json
[
  {
    "idCountry": 1,
    "countryName": "France",
    "isoCode": "FR",
    "slug": "france",
    "description": "...",
    "flag": "🇫🇷",
    "jobOffersCount": 1234,
    "continent": { ... }
  }
]
```

---

#### `GET /api/destinations/:slug`

Récupère le détail d'une destination par slug, avec données enrichies (emploi, coût de la vie, migration OECD).

- **Auth** : Non requise
- **Params** : `slug` (string, ex: "france", "switzerland")
- **Réponse** `200` :

```json
{
  "country": { ... },
  "costOfLiving": { ... },
  "jobOffersCount": 1234,
  "migrationData": {
    "countryCode": "FRA",
    "inflowsForeignPop": { "value": 285000, "year": 2022 },
    "asylumSeekers": { "value": 156000, "year": 2022 }
  }
}
```

---

### 3.8 Cost of Living

**Préfixe** : `/api/cost-of-living`

---

#### `GET /api/cost-of-living/search`

Recherche le coût de la vie pour une ville et un pays. Stratégie : mémoire → cache DB → API externe (RapidAPI).

- **Auth** : Non requise
- **Query** : `?city=Paris&country=France`
- **Réponse** `200` :

```json
{
  "city": "Paris",
  "country": "France",
  "prices": [
    { "item": "Meal, Inexpensive Restaurant", "price": 15.0, "currency": "EUR" },
    { "item": "Monthly Pass (Regular Price)", "price": 84.10, "currency": "EUR" }
  ]
}
```

---

#### `POST /api/cost-of-living/seed`

Seed de la base de données avec les données de coût de la vie depuis l'API externe.

- **Auth** : Non requise (à protéger en production)
- **Réponse** `201`

---

### 3.9 Expatriation Project

**Préfixe** : `/api/expatriation-project`

---

#### `POST /api/expatriation-project`

Crée un projet d'expatriation.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "title": "Déménagement en Suisse",
  "countryId": 2,
  "targetDate": "2025-09-01",
  "notes": "Objectif : Genève"
}
```

- **Réponse** `201` : Objet ExpatriationProject

---

#### `GET /api/expatriation-project`

Liste les projets de l'utilisateur connecté.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` : Array de ExpatriationProject

---

#### `GET /api/expatriation-project/count`

Nombre de projets de l'utilisateur connecté.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` :

```json
{ "count": 3 }
```

---

#### `GET /api/expatriation-project/:id`

Récupère un projet par ID.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` : Objet ExpatriationProject avec checklist

---

#### `PATCH /api/expatriation-project/:id`

Met à jour un projet.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

#### `DELETE /api/expatriation-project/:id`

Supprime un projet.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

#### `POST /api/expatriation-project/:id/checklist`

Ajoute un item à la checklist d'un projet.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "label": "Obtenir un visa de travail",
  "completed": false
}
```

- **Réponse** `201` : Objet ChecklistItem

---

#### `GET /api/expatriation-project/:id/checklist`

Récupère la checklist d'un projet.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200` : Array de ChecklistItem

---

### 3.10 Job Offer

**Préfixe** : `/api/job-offer`

---

#### `POST /api/job-offer`

Crée une offre d'emploi.

- **Auth** : `JwtAuthGuard` ✅
- **Body** :

```json
{
  "title": "Développeur Full-Stack",
  "company": "TechCorp",
  "location": "Genève",
  "description": "..."
}
```

- **Réponse** `201` : Objet JobOffer

---

#### `GET /api/job-offer`

Liste toutes les offres d'emploi locales.

- **Auth** : Non requise
- **Réponse** `200` : Array de JobOffer

---

#### `GET /api/job-offer/search`

Recherche d'offres d'emploi via l'**API Adzuna**.

- **Auth** : Non requise
- **Query** :

```
?what=developer&where=france&country=fr&resultsPerPage=10&page=1
```

- **Réponse** `200` :

```json
{
  "count": 1500,
  "results": [
    {
      "id": "4123456789",
      "title": "Full Stack Developer",
      "company": { "display_name": "TechCorp" },
      "location": { "display_name": "Paris" },
      "salary_min": 45000,
      "salary_max": 65000,
      "redirect_url": "https://..."
    }
  ],
  "mean": 55000
}
```

---

#### `GET /api/job-offer/:id`

Récupère une offre d'emploi par ID.

- **Auth** : Non requise
- **Réponse** `200` : Objet JobOffer

---

#### `PATCH /api/job-offer/:id`

Met à jour une offre d'emploi.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

#### `DELETE /api/job-offer/:id`

Supprime une offre d'emploi.

- **Auth** : `JwtAuthGuard` ✅
- **Réponse** `200`

---

### 3.11 Global Search

**Préfixe** : `/api/global-search`

---

#### `GET /api/global-search`

Recherche globale multi-catégories.

- **Auth** : Non requise
- **Query** : `?q=suisse&category=all&limit=10`
- **Réponse** `200` :

```json
{
  "countries": [...],
  "forumTopics": [...],
  "jobOffers": [...],
  "total": 25
}
```

---

#### `POST /api/global-search/refresh`

Rafraîchit l'index de recherche.

- **Auth** : Non requise (à protéger en production)
- **Réponse** `200`

---

### 3.12 OECD Migration

**Préfixe** : `/api/migration`

---

#### `GET /api/migration`

Retourne les données migratoires OECD pour tous les pays supportés (FRA, CHE, JPN, USA).

- **Auth** : Non requise
- **Réponse** `200` :

```json
[
  {
    "countryCode": "FRA",
    "countryName": "France",
    "inflowsForeignPop": { "value": 285000, "year": 2022 },
    "outflowsForeignPop": { "value": 98000, "year": 2022 },
    "asylumSeekers": { "value": 156000, "year": 2022 },
    "stocksForeignPop": { "value": 5200000, "year": 2022 },
    "nationalityAcquisitions": { "value": 125000, "year": 2022 }
  }
]
```

---

#### `GET /api/migration/:code`

Données migratoires pour un pays (code ISO-2 ou ISO-3).

- **Auth** : Non requise
- **Params** : `code` (string, ex: "FR", "FRA", "CH", "CHE")
- **Réponse** `200` : Objet CountryMigrationData

---

### 3.13 City

**Préfixe** : `/api/city`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/city` | JWT | Créer une ville |
| `GET` | `/api/city` | – | Lister les villes |
| `GET` | `/api/city/:id` | – | Détail d'une ville |
| `PATCH` | `/api/city/:id` | JWT | Modifier une ville |
| `DELETE` | `/api/city/:id` | JWT | Supprimer une ville |

---

### 3.14 City Comparison

**Préfixe** : `/api/city-comparison`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/city-comparison` | JWT | Créer une comparaison |
| `GET` | `/api/city-comparison` | – | Lister les comparaisons |
| `GET` | `/api/city-comparison/:id` | – | Détail |
| `PATCH` | `/api/city-comparison/:id` | JWT | Modifier |
| `DELETE` | `/api/city-comparison/:id` | JWT | Supprimer |

---

### 3.15 Checklist

**Préfixe** : `/api/checklist`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/checklist` | JWT | Créer un item |
| `GET` | `/api/checklist` | – | Lister les items |
| `GET` | `/api/checklist/:id` | – | Détail |
| `PATCH` | `/api/checklist/:id` | JWT | Modifier (toggle) |
| `DELETE` | `/api/checklist/:id` | JWT | Supprimer |

---

### 3.16 Resource

**Préfixe** : `/api/resource`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/resource` | JWT | Créer une ressource |
| `GET` | `/api/resource` | – | Lister |
| `GET` | `/api/resource/:id` | – | Détail |
| `PATCH` | `/api/resource/:id` | JWT | Modifier |
| `DELETE` | `/api/resource/:id` | JWT | Supprimer |

---

### 3.17 Guide

**Préfixe** : `/api/guide`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/guide` | JWT | Créer un guide |
| `GET` | `/api/guide` | – | Lister |
| `GET` | `/api/guide/:id` | – | Détail |
| `PATCH` | `/api/guide/:id` | JWT | Modifier |
| `DELETE` | `/api/guide/:id` | JWT | Supprimer |

---

### 3.18 Experience

**Préfixe** : `/api/experience`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/experience` | JWT | Créer un retour d'expérience |
| `GET` | `/api/experience` | – | Lister |
| `GET` | `/api/experience/:id` | – | Détail |
| `PATCH` | `/api/experience/:id` | JWT | Modifier |
| `DELETE` | `/api/experience/:id` | JWT | Supprimer |

---

### 3.19 Notification

**Préfixe** : `/api/notification`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/notification` | JWT | Créer une notification |
| `GET` | `/api/notification` | – | Lister |
| `GET` | `/api/notification/:id` | – | Détail |
| `PATCH` | `/api/notification/:id` | JWT | Modifier |
| `DELETE` | `/api/notification/:id` | JWT | Supprimer |

---

### 3.20 Admin Procedure

**Préfixe** : `/api/admin-procedure`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/admin-procedure` | JWT | Créer une procédure |
| `GET` | `/api/admin-procedure` | – | Lister |
| `GET` | `/api/admin-procedure/:id` | – | Détail |
| `PATCH` | `/api/admin-procedure/:id` | JWT | Modifier |
| `DELETE` | `/api/admin-procedure/:id` | JWT | Supprimer |

---

### 3.21 Procedure Tracking

**Préfixe** : `/api/procedure-tracking`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/procedure-tracking` | JWT | Créer un suivi |
| `GET` | `/api/procedure-tracking` | – | Lister |
| `GET` | `/api/procedure-tracking/:id` | – | Détail |
| `PATCH` | `/api/procedure-tracking/:id` | JWT | Modifier |
| `DELETE` | `/api/procedure-tracking/:id` | JWT | Supprimer |

---

### 3.22 Business Sector

**Préfixe** : `/api/business-sector`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/business-sector` | JWT | Créer un secteur |
| `GET` | `/api/business-sector` | – | Lister |
| `GET` | `/api/business-sector/:id` | – | Détail |
| `PATCH` | `/api/business-sector/:id` | JWT | Modifier |
| `DELETE` | `/api/business-sector/:id` | JWT | Supprimer |

---

### 3.23 Housing

**Préfixe** : `/api/housing`

CRUD standard.

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/housing` | JWT | Créer un logement |
| `GET` | `/api/housing` | – | Lister |
| `GET` | `/api/housing/:id` | – | Détail |
| `PATCH` | `/api/housing/:id` | JWT | Modifier |
| `DELETE` | `/api/housing/:id` | JWT | Supprimer |

---

## 4. Modèles de données (DTOs)

### RegisterDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `email` | string | ✅ | @IsEmail |
| `password` | string | ✅ | @MinLength(8) |
| `firstName` | string | ✅ | @IsString |
| `lastName` | string | ✅ | @IsString |

### LoginDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `email` | string | ✅ | @IsEmail |
| `password` | string | ✅ | @IsString |

### CreateForumTopicDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `title` | string | ✅ | @IsString, @MinLength(3) |
| `content` | string | ✅ | @IsString, @MinLength(10) |
| `category` | string | ❌ | @IsOptional, @IsString |

### CreateForumMessageDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `content` | string | ✅ | @IsString, @MinLength(1) |
| `topicId` | number | ✅ | @IsNumber |

### SearchJobDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `what` | string | ❌ | Mots-clés de recherche |
| `where` | string | ❌ | Lieu |
| `country` | string | ✅ | Code pays Adzuna (fr, gb, us...) |
| `resultsPerPage` | number | ❌ | Défaut: 10 |
| `page` | number | ❌ | Défaut: 1 |

### CreateExpatriationProjectDto

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `title` | string | ✅ | @IsString |
| `countryId` | number | ❌ | @IsNumber |
| `targetDate` | string | ❌ | @IsDateString |
| `notes` | string | ❌ | @IsString |

---

## 5. Codes de réponse HTTP

| Code | Signification | Usage |
|------|---------------|-------|
| `200` | OK | Succès (GET, PATCH, DELETE) |
| `201` | Created | Ressource créée (POST) |
| `400` | Bad Request | Validation échouée, contenu rejeté par la modération |
| `401` | Unauthorized | Token manquant ou expiré |
| `403` | Forbidden | Rôle insuffisant |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Email déjà utilisé (register) |
| `429` | Too Many Requests | Rate limit atteint |
| `500` | Internal Server Error | Erreur serveur |

---

## 6. Rate Limiting

Le backend utilise `@nestjs/throttler` pour le rate limiting :

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `POST /auth/register` | 5 requêtes | 1 minute |
| `POST /auth/login` | 10 requêtes | 1 minute |
| `POST /auth/refresh` | 10 requêtes | 1 minute |
| `POST /auth/forgot-password` | 3 requêtes | 1 minute |
| `POST /auth/reset-password` | 5 requêtes | 1 minute |

---

## 7. Configuration CORS

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## Résumé des endpoints

| Module | POST | GET | PATCH | DELETE | Total |
|--------|------|-----|-------|--------|-------|
| Auth | 5 | 1 | – | – | **6** |
| User | – | 1 | 1 | 1 | **3** |
| Forum Topic | 1 | 2 | 3 | 2 | **8** |
| Forum Message | 2 | 4 | 2 | 2 | **10** |
| Country | 1 | 2 | 1 | 1 | **5** |
| Continent | 1 | 2 | 1 | 1 | **5** |
| Destinations | – | 2 | – | – | **2** |
| Cost of Living | 1 | 1 | – | – | **2** |
| Expat Project | 2 | 3 | 1 | 1 | **7** |
| Job Offer | 1 | 3 | 1 | 1 | **6** |
| Global Search | 1 | 1 | – | – | **2** |
| OECD Migration | – | 2 | – | – | **2** |
| CRUD modules (×10) | 10 | 20 | 10 | 10 | **50** |
| **TOTAL** | **25** | **44** | **20** | **19** | **~108** |

---

*Documentation API générée pour le projet SkyWalk — Plateforme d'aide à l'expatriation*
