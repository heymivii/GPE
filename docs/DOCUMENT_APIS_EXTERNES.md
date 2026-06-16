# 📕 Document des APIs Externes — SkyWalk

> Sources, documentation et utilisation de toutes les APIs tierces intégrées
> Dernière mise à jour : juillet 2025

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [OpenAI Moderation API](#2-openai-moderation-api)
3. [Adzuna Job Search API](#3-adzuna-job-search-api)
4. [RapidAPI — Cost of Living (Numbeo)](#4-rapidapi--cost-of-living-numbeo)
5. [GeoDB Cities API (RapidAPI)](#5-geodb-cities-api-rapidapi)
6. [REST Countries API](#6-rest-countries-api)
7. [OECD SDMX Migration Database](#7-oecd-sdmx-migration-database)
8. [Résumé des variables d'environnement](#8-résumé-des-variables-denvironnement)
9. [Tableau récapitulatif](#9-tableau-récapitulatif)

---

## 1. Vue d'ensemble

SkyWalk intègre **6 APIs externes** pour enrichir les données de la plateforme :

| API | Usage dans SkyWalk | Authentification | Gratuité |
|-----|---------------------|------------------|----------|
| OpenAI Moderation | Modération du forum | API Key | ✅ Gratuit |
| Adzuna | Recherche d'emploi | App ID + App Key | ✅ Gratuit (limité) |
| RapidAPI Cost of Living | Coût de la vie | RapidAPI Key | ⚠️ Freemium |
| GeoDB Cities | Données villes | RapidAPI Key | ⚠️ Freemium |
| REST Countries | Données pays | Aucune | ✅ Gratuit |
| OECD SDMX | Données migratoires | Aucune | ✅ Gratuit |

---

## 2. OpenAI Moderation API

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | OpenAI |
| **URL de base** | `https://api.openai.com/v1/moderations` |
| **Documentation** | https://platform.openai.com/docs/guides/moderation |
| **Référence API** | https://platform.openai.com/docs/api-reference/moderations |
| **Pricing** | **Gratuit** — aucune facturation pour le endpoint moderation |
| **Authentification** | Header `Authorization: Bearer <OPENAI_API_KEY>` |
| **SDK** | `openai` npm package v6.x |

### 🔧 Utilisation dans SkyWalk

- **Fichier** : `backend/src/features/forum-message/content-filter.service.ts`
- **Rôle** : Filtrage automatique du contenu des messages du forum
- **Catégories détectées** : hate, harassment, self-harm, sexual, violence, etc.
- **Fallback** : Si l'API est indisponible ou non configurée, un filtre local par blocklist prend le relais

### 📝 Exemple d'appel

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const moderation = await openai.moderations.create({
  input: "Texte à vérifier..."
});

const result = moderation.results[0];
if (result.flagged) {
  // Contenu rejeté — result.categories contient les catégories détectées
}
```

### 📊 Réponse type

```json
{
  "id": "modr-xxx",
  "model": "text-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "hate": false,
        "harassment": true,
        "self-harm": false,
        "sexual": false,
        "violence": false
      },
      "category_scores": {
        "hate": 0.001,
        "harassment": 0.95,
        "self-harm": 0.0001,
        "sexual": 0.002,
        "violence": 0.001
      }
    }
  ]
}
```

### 🔑 Variable d'environnement

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Adzuna Job Search API

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | Adzuna Ltd (UK) |
| **URL de base** | `https://api.adzuna.com/v1/api/jobs` |
| **Documentation** | https://developer.adzuna.com/docs/search |
| **Référence API** | https://developer.adzuna.com/activedocs |
| **Inscription** | https://developer.adzuna.com/ |
| **Pricing** | **Gratuit** — jusqu'à 250 requêtes/jour (plan gratuit) |
| **Authentification** | Query params `app_id` + `app_key` |
| **Pays supportés** | gb, us, au, br, ca, de, fr, in, nl, nz, pl, sg, za |

### 🔧 Utilisation dans SkyWalk

- **Fichier** : `backend/src/features/job-offer/adzuna.service.ts`
- **Rôle** : Recherche d'offres d'emploi internationales
- **Cache** : En mémoire, TTL 1 heure
- **Aussi utilisé par** : `destinations.service.ts` — comptage du nombre d'offres par pays

### 📝 Exemple d'appel

```
GET https://api.adzuna.com/v1/api/jobs/fr/search/1
    ?app_id=YOUR_APP_ID
    &app_key=YOUR_APP_KEY
    &results_per_page=10
    &what=developer
    &where=paris
    &content-type=application/json
```

### 📊 Réponse type

```json
{
  "count": 1523,
  "mean": 55000,
  "results": [
    {
      "id": "4123456789",
      "title": "Full Stack Developer",
      "description": "We are looking for...",
      "company": {
        "display_name": "TechCorp"
      },
      "location": {
        "display_name": "Paris, France",
        "area": ["France", "Île-de-France", "Paris"]
      },
      "salary_min": 45000,
      "salary_max": 65000,
      "contract_time": "full_time",
      "created": "2025-07-01T10:00:00Z",
      "redirect_url": "https://www.adzuna.fr/details/..."
    }
  ]
}
```

### 🔑 Variables d'environnement

```env
ADZUNA_APP_ID=xxxxxxxx
ADZUNA_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. RapidAPI — Cost of Living (Numbeo)

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | RapidAPI Marketplace (données issues de Numbeo) |
| **URL de base** | `https://{RAPIDAPI_HOST}/prices` |
| **Documentation** | https://rapidapi.com/traveltables/api/cost-of-living-and-prices |
| **Alternative** | https://rapidapi.com/natkapral/api/cost-of-living-and-prices |
| **Pricing** | **Freemium** — plan gratuit avec limites (ex: 100 req/mois) |
| **Authentification** | Headers `x-rapidapi-key` + `x-rapidapi-host` |

### 🔧 Utilisation dans SkyWalk

- **Fichiers** :
  - `backend/src/features/cost-of-living/cost-of-living.service.ts`
  - `backend/src/scripts/seed-cost-of-living.ts`
- **Rôle** : Récupération des prix du coût de la vie par ville et pays
- **Stratégie de cache** : Mémoire → Cache DB (PostgreSQL) → API externe (dernier recours)
- **Données** : Prix de repas, transports, logement, services, etc.

### 📝 Exemple d'appel

```
GET https://{RAPIDAPI_HOST}/prices?city_name=Paris&country_name=France

Headers:
  x-rapidapi-key: YOUR_RAPIDAPI_KEY
  x-rapidapi-host: cost-of-living-and-prices.p.rapidapi.com
```

### 📊 Réponse type

```json
{
  "city_name": "Paris",
  "country_name": "France",
  "prices": [
    {
      "good_id": 1,
      "item_name": "Meal, Inexpensive Restaurant",
      "average_price": 15.0,
      "currency_code": "EUR"
    },
    {
      "good_id": 18,
      "item_name": "Monthly Pass (Regular Price)",
      "average_price": 84.1,
      "currency_code": "EUR"
    }
  ]
}
```

### 🔑 Variables d'environnement

```env
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAPIDAPI_HOST=cost-of-living-and-prices.p.rapidapi.com
```

---

## 5. GeoDB Cities API (RapidAPI)

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | Wirefreethought (via RapidAPI) |
| **URL de base** | `https://wft-geo-db.p.rapidapi.com/v1/geo` |
| **Documentation** | https://rapidapi.com/wirefreethought/api/geodb-cities |
| **Référence API** | http://geodb-cities-api.wirefreethought.com/docs/api |
| **Pricing** | **Freemium** — 1000 req/jour (plan gratuit), 1 req/sec |
| **Authentification** | Headers `x-rapidapi-key` + `x-rapidapi-host` |

### 🔧 Utilisation dans SkyWalk

- **Fichier** : `backend/src/services/geodb.service.ts`
- **Rôle** : Recherche de villes par nom et code pays, données enrichies (population, coordonnées, fuseau horaire)
- **Usage** : Enrichissement des données villes pour le seed de la BDD

### 📝 Exemple d'appel

```
GET https://wft-geo-db.p.rapidapi.com/v1/geo/cities
    ?namePrefix=Paris
    &countryIds=FR
    &types=CITY
    &limit=1
    &sort=-population

Headers:
  x-rapidapi-key: YOUR_RAPIDAPI_KEY
  x-rapidapi-host: wft-geo-db.p.rapidapi.com
```

### 📊 Réponse type

```json
{
  "data": [
    {
      "id": 2988507,
      "name": "Paris",
      "country": "France",
      "countryCode": "FR",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "population": 2161000,
      "timezone": "Europe/Paris"
    }
  ],
  "metadata": {
    "currentOffset": 0,
    "totalCount": 1
  }
}
```

### 🔑 Variable d'environnement

```env
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# (même clé que Cost of Living — compte RapidAPI partagé)
```

---

## 6. REST Countries API

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | REST Countries (open source) |
| **URL de base** | `https://restcountries.com/v3.1` |
| **Documentation** | https://restcountries.com/ |
| **GitHub** | https://github.com/treflehq/restcountries |
| **Pricing** | **Gratuit** — aucune limite, open source |
| **Authentification** | **Aucune** — API ouverte |

### 🔧 Utilisation dans SkyWalk

- **Fichier** : `backend/src/services/restCountries.service.ts`
- **Rôle** : Récupération des informations pays (capitale, devise, langue, drapeau, continent, fuseau horaire)
- **Cache** : `node-cache` avec TTL de 24 heures

### 📝 Exemple d'appel

```
GET https://restcountries.com/v3.1/alpha/FR
```

### 📊 Réponse type

```json
[
  {
    "name": {
      "common": "France",
      "official": "French Republic"
    },
    "capital": ["Paris"],
    "currencies": {
      "EUR": { "name": "Euro", "symbol": "€" }
    },
    "languages": {
      "fra": "French"
    },
    "timezones": ["UTC-10:00", "UTC+01:00", "..."],
    "continents": ["Europe"],
    "flags": {
      "png": "https://flagcdn.com/w320/fr.png",
      "svg": "https://flagcdn.com/fr.svg"
    },
    "cca2": "FR"
  }
]
```

### 🔑 Variable d'environnement

Aucune requise.

---

## 7. OECD SDMX Migration Database

### 📌 Informations

| Propriété | Valeur |
|-----------|--------|
| **Fournisseur** | Organisation de Coopération et de Développement Économiques (OECD) |
| **URL de base** | `https://sdmx.oecd.org/public/rest/data/` |
| **Documentation** | https://data-explorer.oecd.org/ |
| **Spécification SDMX** | https://sdmx.org/ |
| **Dataflow** | `OECD.ELS.IMD,DSD_MIG@DF_MIG,1.0` |
| **Pricing** | **Gratuit** — données publiques |
| **Authentification** | **Aucune** — API ouverte |
| **Format** | JSON (SDMX-JSON) |

### 🔧 Utilisation dans SkyWalk

- **Fichier** : `backend/src/features/oecd-migration/oecd-migration.service.ts`
- **Rôle** : Données migratoires par pays (flux, stocks, asile, naturalisations)
- **Pays supportés** : France (FRA), Suisse (CHE), Japon (JPN), États-Unis (USA)
- **Cache** : En mémoire, TTL 24 heures

### Mesures disponibles

| Code | Description |
|------|-------------|
| `B11` | Inflows of foreign population (entrées de population étrangère) |
| `B12` | Outflows of foreign population (sorties de population étrangère) |
| `B13` | Inflows of asylum seekers (demandeurs d'asile) |
| `B15` | Stocks of foreign population (stock de population étrangère) |
| `B16` | Acquisitions of nationality (acquisitions de nationalité) |

### 📝 Exemple d'appel

```
GET https://sdmx.oecd.org/public/rest/data/
    OECD.ELS.IMD,DSD_MIG@DF_MIG,1.0/
    FRA+CHE+JPN+USA.B11+B12+B13+B15+B16.......
    ?startPeriod=2018
    &dimensionAtObservation=AllDimensions

Headers:
  Accept: application/vnd.sdmx.data+json;version=2.0.0
```

### 📊 Réponse type (normalisée par le service)

```json
{
  "countryCode": "FRA",
  "countryName": "France",
  "inflowsForeignPop": { "value": 285000, "year": 2022 },
  "outflowsForeignPop": { "value": 98000, "year": 2022 },
  "asylumSeekers": { "value": 156000, "year": 2022 },
  "stocksForeignPop": { "value": 5200000, "year": 2022 },
  "nationalityAcquisitions": { "value": 125000, "year": 2022 }
}
```

### 🔑 Variable d'environnement

Aucune requise.

---

## 8. Résumé des variables d'environnement

Fichier `.env` du backend :

```env
# ─── OpenAI (Modération du forum) ─────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Adzuna (Recherche d'emploi) ──────────────────
ADZUNA_APP_ID=xxxxxxxx
ADZUNA_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── RapidAPI (Cost of Living + GeoDB Cities) ─────
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAPIDAPI_HOST=cost-of-living-and-prices.p.rapidapi.com

# ─── REST Countries ──────────────────────────────
# (aucune clé requise)

# ─── OECD ─────────────────────────────────────────
# (aucune clé requise)
```

---

## 9. Tableau récapitulatif

| # | API | URL | Auth | Gratuit | Fichier(s) backend | Usage |
|---|-----|-----|------|---------|-------------------|-------|
| 1 | **OpenAI Moderation** | `api.openai.com/v1/moderations` | API Key | ✅ Oui | `content-filter.service.ts` | Modération automatique du contenu forum |
| 2 | **Adzuna** | `api.adzuna.com/v1/api/jobs` | App ID + Key | ✅ (250 req/j) | `adzuna.service.ts`, `destinations.service.ts` | Recherche d'emploi + comptage offres par pays |
| 3 | **RapidAPI Cost of Living** | `{host}/prices` | RapidAPI Key | ⚠️ Freemium | `cost-of-living.service.ts`, `seed-cost-of-living.ts` | Prix du coût de la vie par ville |
| 4 | **GeoDB Cities** | `wft-geo-db.p.rapidapi.com/v1/geo` | RapidAPI Key | ⚠️ (1000 req/j) | `geodb.service.ts` | Données villes (population, coordonnées, timezone) |
| 5 | **REST Countries** | `restcountries.com/v3.1` | Aucune | ✅ Oui | `restCountries.service.ts` | Infos pays (capitale, devise, drapeau, langue) |
| 6 | **OECD SDMX** | `sdmx.oecd.org/public/rest/data` | Aucune | ✅ Oui | `oecd-migration.service.ts` | Données migratoires (flux, stocks, asile) |

---

### Architecture d'intégration

```
┌───────────────────────────────────────────────────────┐
│                   SkyWalk Backend                     │
│                    (NestJS)                            │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ ContentFilter   │─────→│ OpenAI Moderation API│   │
│  │ Service         │      │ (gratuit, illimité)  │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ Adzuna          │─────→│ Adzuna Job Search    │   │
│  │ Service         │      │ (250 req/jour)       │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ CostOfLiving    │─────→│ RapidAPI / Numbeo    │   │
│  │ Service         │      │ (freemium)           │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ GeoDB            │─────→│ GeoDB Cities API     │   │
│  │ Service          │      │ (1000 req/jour)      │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ RestCountries   │─────→│ REST Countries v3.1  │   │
│  │ Service         │      │ (gratuit, open)      │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
│  ┌─────────────────┐      ┌──────────────────────┐   │
│  │ OecdMigration   │─────→│ OECD SDMX Database   │   │
│  │ Service         │      │ (gratuit, public)    │   │
│  └─────────────────┘      └──────────────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Stratégies de résilience

| Stratégie | APIs concernées | Détail |
|-----------|----------------|--------|
| **Cache mémoire** | Adzuna, OECD, REST Countries, Cost of Living | TTL 1h à 24h selon l'API |
| **Cache DB (PostgreSQL)** | Cost of Living | Persistance longue durée des prix |
| **Fallback local** | OpenAI Moderation | Blocklist de mots interdits si l'API est indisponible |
| **Rate limit respecté** | GeoDB Cities | `sleep()` entre les requêtes (1 req/sec) |
| **Graceful degradation** | Adzuna, OECD | Retourne 0 ou tableau vide si l'API échoue |

---

*Document des APIs externes — Projet SkyWalk — Plateforme d'aide à l'expatriation*
