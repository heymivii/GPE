# 💰 Module « Cost of Living » (Coût de la vie) — SkyWalk

Ce document décrit ce que contient réellement la fonctionnalité **coût de la vie**, côté backend et frontend.

---

## 1. Vue d'ensemble

Le module récupère les **prix réels** d'une ville (loyer, alimentation, transport, salaire…) auprès d'une **API externe**, **nettoie** ces données dans un format structuré, puis les **met en cache** (mémoire + base de données) pour éviter de rappeler l'API à chaque visite. Ces données alimentent les fiches destinations et le **comparateur de villes**.

- **Source externe** : RapidAPI — *Cost of Living* (endpoint `GET /prices`)
- **Pays autorisés (whitelist)** : 🇫🇷 France · 🇺🇸 United States · 🇯🇵 Japan · 🇨🇭 Switzerland
- **Devise** : conservée telle que renvoyée par l'API (`currency_code`, défaut `EUR`), avec taux de change

---

## 2. Backend — `backend/src/features/cost-of-living/`

```
cost-of-living/
├── cost-of-living.controller.ts        # Endpoints REST
├── cost-of-living.service.ts           # Logique métier + cache + appel API
├── cost-of-living-cleaner.service.ts   # Transformation des données brutes
├── entities/
│   ├── cost-of-living-cache.entity.ts  # Table cache (jsonb)
│   └── cost-of-living.entity.ts        # Table chiffres synthétiques
├── dto/
│   ├── create-cost-of-living.dto.ts
│   └── update-cost-of-living.dto.ts
└── types/
    └── cost-of-living.types.ts         # Types (RawAPIResponse, CleanedCostOfLivingData…)
```

### 2.1 Endpoints API (`@Controller('cost-of-living')`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/cost-of-living/search?city=&country=` | Renvoie le coût de la vie nettoyé pour une ville/pays (cache → API). |
| `POST` | `/cost-of-living/seed` | Pré-remplit le cache pour les villes supportées (warm-up). |

Documenté dans Swagger via `@ApiTags('Cost of Living')`.

### 2.2 Service principal (`cost-of-living.service.ts`)

**Double cache** pour limiter les appels à l'API payante :

| Niveau | Stockage | TTL | Constante |
|--------|----------|-----|-----------|
| 1. Mémoire | `Map` en RAM | **6 heures** | `MEM_TTL_MS = 6 * 60 * 60 * 1000` |
| 2. Base de données | Table `cost_of_living_cache` (jsonb) | **30 jours** | `CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000` |

**Flux de `getCostOfLiving(city, country)` :**
1. **Validation du pays** via `ALLOWED_COUNTRIES` (gère les alias : `fr`→France, `usa`/`united states`→United States…). Pays non autorisé → erreur.
2. **Cache mémoire** (clé `city::country` en minuscules) → HIT immédiat si non expiré.
3. **Cache DB par `cityId`** (jointure `City` + `Country`) → HIT si `expiresAt > NOW()`.
4. **Cache DB par contenu JSON** (`data -> 'city' ->> 'name'`) en repli.
5. **Appel API externe** si aucun cache : `GET {BASE_URL}/prices?city_name=&country_name=` avec headers `x-rapidapi-key` / `x-rapidapi-host`.
   - **Retry** : jusqu'à **3 tentatives**, backoff `2000 ms × tentative` en cas de **429 (rate limit)**.
   - Erreur → `429 Too Many Requests` ou `502 Bad Gateway`.
6. Données **nettoyées**, mises en cache mémoire **et** persistées en DB.

**Variables d'environnement** : `RAPIDAPI_KEY`, `RAPIDAPI_HOST` (sans elles et sans cache → `503 Service Unavailable`).

**Seed (`seedAllCities`)** — villes pré-chargées (1 par pays), avec pause de 4 s entre les appels :
`Paris / France`, `New York / United States`, `Tokyo / Japan`, `Geneva / Switzerland`.
Retourne `{ seeded, skipped, errors }`.

**Entretien** : `cleanExpiredCache()` supprime les entrées dont `expiresAt < now`.

### 2.3 Nettoyage des données (`cost-of-living-cleaner.service.ts`)

`cleanData()` transforme la réponse brute de l'API en objet structuré **`CleanedCostOfLivingData`** :

- **`city`** : id, name, country, state
- **`currency`** : code, exchangeRates, lastUpdated
- **`categories`** :
  - **housing** — loyers 1 et 3 pièces (centre / hors-centre) + prix d'achat au m²
  - **food** — alimentation
  - **transportation** — transport
  - **utilities** — charges
  - **restaurants**
  - **clothing** — vêtements
  - **childcare** — garde d'enfants
  - **sports** — cinéma, salle de sport, tennis
  - **salary** — salaire net mensuel moyen + taux de crédit immobilier (min/avg/max)
- **`summary`** :
  - `monthlyBudget` (min/avg/max) = loyer + charges + transport + **400 (alimentation forfaitaire)**
  - `averageSalary`

Chaque prix est un `PriceRange { min, avg, max, currency }` (0 si l'item est absent).

### 2.4 Entités (base de données)

**`cost_of_living_cache`** — cache brut (1 entrée par ville) :

| Colonne | Type | Rôle |
|---------|------|------|
| `id` | int (PK) | Identifiant |
| `city_id` | int (FK → City, OneToOne) | Ville liée |
| `data` | **jsonb** | Données nettoyées complètes |
| `cached_at` | timestamp | Date de mise en cache |
| `expires_at` | timestamp | Date d'expiration (≈ +30 j) |

**`cost_of_living`** — chiffres synthétiques par ville :

| Colonne | Type | Rôle |
|---------|------|------|
| `id_cost` | int (PK) | Identifiant |
| `average_rent` | numeric(10,2) | Loyer moyen |
| `monthly_transport` | numeric(10,2) | Transport mensuel |
| `food_expenses` | numeric(10,2) | Dépenses alimentaires |
| `public_services` | numeric(10,2) | Services publics / charges |
| `updated_at` | timestamp | Dernière mise à jour |
| `id_city` | int (FK → City, ManyToOne) | Ville liée |

**DTO** : `CreateCostOfLivingDto` (`averageRent`, `monthlyTransport`, `foodExpenses`, `publicServices`, `idCity` requis) et `UpdateCostOfLivingDto` (PartialType).

---

## 3. Frontend

| Emplacement | Contenu |
|-------------|---------|
| `src/features/cost-of-living/pages/CostOfLivingTestPage.tsx` | Page de visualisation/test du coût de la vie. |
| `src/features/comparison/` | **Comparateur de villes** : `CountryComparison` (page), `ComparisonSection`, `ComparisonTable`, `CountrySelector`, lignes `ComparisonRow` / `…Score` / `…WithBar`. |
| `src/features/comparison/hooks/` | `useCountriesWithData`, `useMigrationData`. |

Le comparateur affiche un **graphique radar à 4 axes** — salaire, accessibilité, alimentation, transport — et empêche de comparer une ville avec un pays. Toutes les données proviennent désormais **exclusivement de la base** (plus de données en dur).

---

## 4. Note sur `COST_OF_LIVING_CACHE_STRATEGY.md`

Ce fichier existant décrit une **stratégie de cache de conception** (cache JSON en table séparée, TTL 30 j, lazy loading, warm-up, cron de rafraîchissement) écrite pour une version Express (`db.query`, `destinations.controller`). L'implémentation **réelle et actuelle** est celle décrite ci-dessus, en **NestJS/TypeORM**, avec en plus un **cache mémoire 6 h** au-dessus du cache DB 30 j.

---

*Document généré à partir du code source du module `cost-of-living` — Projet SkyWalk.*
