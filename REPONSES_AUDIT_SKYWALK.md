# 🔎 Audit terrain SkyWalk — réponses lues dans le code source

> Toutes les affirmations ci‑dessous sont sourcées par `fichier:ligne`. Branche analysée : `feat/adapt-front-factor-db`.
> Rappel de cadrage : **« TravelTables » = le fournisseur RapidAPI du coût de la vie**, host `cost-of-living-and-prices.p.rapidapi.com` (`render.yaml`). « Retirer TravelTables » = retirer cette dépendance RapidAPI.

---

## B. Sources de données & APIs — retrait TravelTables (à traiter en premier)

### B1 — Où RapidAPI/TravelTables est réellement appelé
Seulement **2 sites d'appel réseau réels** vers TravelTables (`/prices`) :
- `backend/src/features/cost-of-living/cost-of-living.service.ts:254-255` — appel live (chemin cache‑miss).
- `backend/src/scripts/seed-cost-of-living.ts:497` — script de seed (hors application).

Référence au host : `render.yaml` (`RAPIDAPI_HOST=cost-of-living-and-prices.p.rapidapi.com`) et clé `RAPIDAPI_KEY` (`sync:false`).

⚠️ **Piège** : `RAPIDAPI_KEY` est **partagée** avec un 2ᵉ service, `backend/src/services/geodb.service.ts:16` (host `wft-geo-db.p.rapidapi.com`). **MAIS** `geodb.service.ts` n'est **importé nulle part** (aucun `import` dans `features/` ni `app.module.ts`) → **code mort**. Donc en pratique, retirer TravelTables ⇒ `RAPIDAPI_KEY` n'a plus aucun consommateur vivant et peut être supprimée.

Côté **front** : aucun appel direct à RapidAPI. Le front consomme le backend via `skywalk-frontend/src/api/costOfLiving.ts` et surtout via l'endpoint **destinations**.

### B2 — Surface de migration si on supprime TravelTables
Ce qui dépend des données de coût de la vie (donc impacté) :
- **Backend**
  - `cost-of-living.service.ts` (tout le service : `getCostOfLiving`, `fetchFromApi`, `seedAllCities`).
  - `cost-of-living.controller.ts` : `GET /cost-of-living/search`, `POST /cost-of-living/seed`.
  - `cost-of-living-cleaner.service.ts` (transforme la réponse TravelTables → `CleanedCostOfLivingData`).
  - Entité **`cost_of_living_cache`** (jsonb) — c'est **elle** qui alimente l'app, pas la table synthétique.
  - `destinations.service.ts` : renvoie `cities[].costOfLiving` (= le jsonb) consommé par le comparateur.
  - Scripts `seed-cost-of-living.ts`, `seed-cities-enriched.ts`.
- **Frontend**
  - `contexts/CostOfLivingContext.tsx` (React Query `['costOfLiving', city, country]`).
  - `features/cost-of-living/pages/CostOfLivingTestPage.tsx`.
  - `features/comparison/components/ComparisonTable.tsx` (**graphique radar**, lignes 190‑223) + `features/comparison/hooks/useCountriesWithData.ts` (`extractCostOfLivingFromCache`).

**Bonne nouvelle migration** : la forme des données affichées est figée par `CleanedCostOfLivingData` (`cost-of-living.types.ts`). Tant qu'un futur fournisseur (open data / saisie manuelle / autre agrégateur) **remplit le même JSON** dans `cost_of_living_cache.data`, **ni le front ni le cleaner aval ne changent**. La migration se réduit à : remplacer `fetchFromApi()` par la nouvelle source, et adapter `cleanData()` au format d'entrée.

### B3 — Le comparateur lit quoi : table synthétique ou cache jsonb ?
**Le cache jsonb**, sans ambiguïté.
- `useCountriesWithData.ts` appelle `destinationsApi.getBySlug(code)` puis prend `capitalCity.costOfLiving` (= `CleanedCostOfLivingData` issu de `cost_of_living_cache`) et le passe à `extractCostOfLivingFromCache()`.
- Le radar (`ComparisonTable.tsx:191‑194`) lit `c.costOfLiving?.averageSalary`, `food?.restaurantMeal`, `transportMonthly` — tous dérivés du **jsonb**.
- La table synthétique **`cost_of_living`** (`cost-of-living.entity.ts`, colonnes `average_rent`, `monthly_transport`…) : **aucun lecteur runtime trouvé**. Elle semble orpheline (créée par migration, jamais lue par l'app).
- En plus du jsonb, le comparateur fusionne un **fichier statique** `skywalk-frontend/src/data/countries-data.json` pour climat, fiscalité, recommandations, drapeaux.

➡️ **Vérité affichée à l'utilisateur = cache jsonb (prix) + JSON statique (métadonnées).**

Détail radar : 4 axes = **Salaire / Logement / Nourriture / Transport** (`ComparisonTable.tsx:203,207,214,221`). Nourriture et Transport sont **normalisés relativement** entre les pays comparés (`(1 - x/max)*80 + 20`), donc ce sont des **scores relatifs**, pas des valeurs absolues.

### B4 — Parmi REST Countries / GeoDB / Adzuna / OpenAI : qui est réellement appelé ?
| API | Statut réel | Preuve |
|-----|-------------|--------|
| **TravelTables / RapidAPI** | ✅ Appelée (runtime + seed) | `cost-of-living.service.ts:254`, `seed-cost-of-living.ts:497` |
| **Adzuna** | ✅ Appelée (runtime) | `job-offer/adzuna.service.ts:19,93`, `destinations.service.ts:193` (comptage d'offres) |
| **OpenAI (modération)** | ⚠️ Codée mais **dormante en prod** | `forum-message/content-filter.service.ts:3,85` — client instancié **seulement si** `OPENAI_API_KEY` présent ; **clé absente de `render.yaml`** ⇒ `this.openai = null` ⇒ **fallback local** uniquement |
| **REST Countries** | ⚠️ **Build‑time only** | `services/restCountries.service.ts` importé **uniquement** par `scripts/seed-cities-enriched.ts:4` — pas dans l'app qui tourne |
| **GeoDB** | ❌ **Code mort** | `services/geodb.service.ts` jamais importé |
| (Drapeaux) | Statique | URLs `flagcdn.com` en dur dans `db/migrations/...SeedCountries.ts:24‑27` |

`.env.example` liste aussi `OPENWEATHER_API_KEY` (widget météo dashboard) et `EXCHANGERATE_API_KEY` — mais les taux de change réels viennent du champ `exchange_rate` de la réponse TravelTables, pas d'un appel dédié.

### B5 — Y a‑t‑il un jeu de secours / seed si l'API externe tombe ?
Oui, partiellement, et l'app **ne casse pas** dans le cas nominal :
- Seed BDD : `db/migrations/...SeedCountries.ts` (continents + 4 pays) + `CompleteSchemaRebuild.ts`.
- Seed prix : `POST /cost-of-living/seed` (`seedAllCities`) et scripts `seed-cost-of-living.ts` / `seed-cities-enriched.ts` → remplit `cost_of_living_cache` (TTL **30 j**).
- **Comportement si TravelTables indisponible** :
  - Si le cache jsonb est déjà rempli → servi normalement (le service lit mem 6 h → DB 30 j avant tout appel).
  - Si cache vide **et** pas de credentials → `503` (`cost-of-living.service.ts:128`).
  - Le comparateur encaisse l'erreur par pays (`useCountriesWithData.ts` : `catch { capitalData: null }`) → **dégradation propre** (prix manquants), pas de crash.

➡️ **Conséquence pour la décision** : si tu pré‑seedes `cost_of_living_cache` et que tu arrêtes de rafraîchir, l'app continue de tourner sans TravelTables. La table synthétique `cost_of_living` + `seed-cities-enriched` sont des cibles de migration naturelles vers une source maîtrisée.

---

## A. État réel & architecture

### A1 — Modules réels : implémentés vs squelettes
**24 modules** (`backend/src/features/`). Détection par taille de service + contenu :

**Pleinement implémentés** (logique TypeORM réelle) :
`auth` (controller 117 l.), `user` (service 99 l.), `forum-topic` (service 191 l.), `forum-message` + `content-filter` (186 l.), `cost-of-living`, `destinations` (orchestration + cache), `expatriation-project` (service **212 l.**, CRUD + contrôles d'ownership, `expatriation-project.service.ts:44‑60`), `global-search` (FTS + fallback ILIKE), `oecd-migration` (172 l.), `country` (49 l.), `continent` (46 l.), `business-sector`/`newsletter` (≈49 l.).

**Squelettes `nest g resource`** — services qui **renvoient des chaînes placeholder**, sans BDD :
- Confirmés verbatim : `checklist.service.ts` (`return 'This action adds a new checklist'`), `admin-procedure.service.ts` (idem).
- Même signature (26 lignes exactes) → quasi‑certainement stubs : `city`, `city-comparison`, `experience`, `guide`, `job-offer` (le vrai travail est dans `adzuna.service`), `notification`, `procedure-tracking`, `resource`.
- ⚠️ Leurs **controllers exposent quand même des endpoints** (`@Get`, `@Post`…) qui renvoient ces placeholders → **endpoints “fantômes”**.

**Vide total** : `housing/housing.controller.ts` et `housing/nestoria.service.ts` = **0 octet** (module Nestoria jamais écrit).

### A2 — Code mort / features doc mais absentes
- `services/geodb.service.ts` → **mort** (jamais importé).
- `services/restCountries.service.ts` → **runtime mort** (seulement script de seed).
- Table synthétique `cost_of_living` → **aucun lecteur runtime**.
- Module `housing` → coquille vide alors qu'il est listé comme module.
- `data/README.md` (front) annonce Canada/Allemagne/Espagne en **TODO** (`canada-data.ts # TODO`…) — pays présentés comme prévus mais **absents** (réellement 4 pays).
- `TransportTools.tsx:218` affiche une note `todoNote` (“Compléter avec les vraies règles d'échange par pays”).

### A3 — Couverture de tests réelle
- **Backend** : 35 fichiers `.spec.ts`. Mais ceux des **modules stubs** sont des tests triviaux “should be defined” → le **chiffre est gonflé**.
  **Aucun spec** pour : `business-sector`, `destinations`, `expatriation-project`, `global-search`, `housing`, `newsletter`, `oecd-migration`.
  ➡️ **Critiques non testés** : `destinations` (orchestration Adzuna + cache), `expatriation-project` (cœur métier, 212 l.), `global-search` (SQL brut), `oecd-migration`.
- **Frontend** : 9 fichiers de test seulement → `api/{auth,forum-messages,forum-topics,user}`, `ProtectedRoute`, `PublicRoute`, `AuthContext`, `useAuth`, `useForum`.
  ➡️ **Non testés** : comparateur (radar), cost‑of‑living, dashboard, onboarding, destinations, search.

---

## C. Module cost-of-living en détail

### C1 — `CleanedCostOfLivingData` / `cleanData()` : extrait vs ignoré
`cleanData()` (`cost-of-living-cleaner.service.ts:19‑36`) construit 9 catégories : housing, food, transportation, utilities, restaurants, clothing, childcare, sports, salary + `summary`.

**Transport détaillé EST extrait** (contrairement à l'hypothèse) :
`extractTransportationData` (`:129‑144`) capture `oneWayTicket`, `monthlyPass`, `taxi`, **`gasoline1L`** — et le type `TransportationData` les contient (`cost-of-living.types.ts:113‑124`).
➡️ Ce qui est “ignoré” l'est **en aval (UI)** : le comparateur n'affiche que `transportMonthly` (= `monthlyPass.avg`). `gasoline1L`, `taxi`, `oneWayTicket` sont **stockés dans le jsonb mais jamais affichés**.

### C2 — Forfait alimentation de 400 en dur ?
**Confirmé.** `calculateSummary` (`cost-of-living-cleaner.service.ts:248,258`) fait `const food = 400;` et l'ajoute au `monthlyBudget` — **alors que** la vraie catégorie food est extraite séparément (`extractFoodData`, `:94`, avec `markets`). Donc le **budget mensuel affiché contient un forfait alimentation arbitraire**, pas la donnée réelle. À corriger (calculer food depuis `categories.food.markets`, comme le fait déjà le front dans `extractCostOfLivingFromCache`).

### C3 — Ajouter un champ texte `insight` (généré) au jsonb : risqué ?
**Non, sûr.** L'entité stocke `data` en `jsonb` typé `Record<string, any>` (`cost-of-living-cache.entity.ts`). Le cleaner produit un objet fixe mais **rien ne rejette les clés supplémentaires**, et le front lit des **chemins précis** (`categories.*`, `summary.*`). Ajouter `data.insight` (string) **ne casse ni le cleaner ni les lectures front**. Il suffit de l'injecter après `cleanData()` et avant `persistToDb()`.

---

## D. Intérêt réel d'une IA (analyse critique, pas enthousiaste)

### D1 — LLM déjà présent ?
Oui, un seul : `content-filter.service.ts` (modération forum).
Structure : constructeur lit `OPENAI_API_KEY` via `ConfigService`, instancie un client **lazy** (`null` si pas de clé), `validate()` appelle `openai.moderations.create({ model: 'omni-moderation-latest' })` avec **try/catch → fallback local** (blocklist + spam + all‑caps).
➡️ **Très généralisable** : ce patron (client optionnel + fallback) est exactement ce qu'il faut extraire en un `AiService` partagé réutilisable.

### D2 — Clé provider configurée ?
- En **code** : oui, `OPENAI_API_KEY` (lue via ConfigService).
- En **prod** : **non** — absente de `render.yaml`. `.env.example` ne contient qu'un placeholder `your_openai_api_key`.
➡️ Aucune autre clé LLM. L'“IA de modération” est donc **inactive en production** aujourd'hui.

### D3 — Où un LLM apporte de la valeur vs sur‑ingénierie
**Valeur réelle (narration/garde‑fou au‑dessus de données réelles)** :
- **Insight coût‑de‑la‑vie** : 1 paragraphe explicatif par ville, généré une fois au cache‑miss, stocké en jsonb. ✅ (cf. D4)
- **Modération forum** : déjà câblée, il suffit d'activer la clé. ✅
- **Global‑search** : reformulation/synonymes de requête côté entrée (le FTS est strict, `buildTsQuery` fait juste `mot:*`). Valeur modérée. 🟡

**Sur‑ingénierie / drapeau rouge** :
- **Onboarding** : `useOnboarding.ts` est un simple stepper localStorage (`getStepState` = comparaison d'entiers). Pas de logique de reco à “LLM‑iser” — un arbre de règles suffit. ❌
- **Checklist / procedure‑tracking** : ce sont des **stubs vides** ; il faut d'abord les implémenter en CRUD, pas y mettre une IA. ❌
- **Génération des prix / chiffres par LLM** : **interdit** — ce serait inventer des données. Le LLM ne doit jamais être la source des nombres. 🚩

### D4 — Où brancher la génération d'insight (cache mem 6 h + jsonb 30 j)
Point d'insertion unique, sur le **chemin cache‑miss** de `cost-of-living.service.ts` :
`fetchFromApi()` → `cleanerService.cleanData()` → **[ICI : générer l'insight à partir des données nettoyées]** → `memSet()` + `persistToDb()`.
Ainsi l'insight est **calculé une seule fois par ville** (au miss ou au seed), **stocké dans `data.insight`**, puis servi depuis le cache pendant 30 jours — **jamais régénéré sur un cache‑hit**. Coût LLM ≈ 4 appels (4 villes seedées).

### D5 — Budget latence/coût & timeout
- Déploiement réel = **Render** (`render.yaml`, runtime node, région Frankfurt), **pas Heroku**.
- Un appel LLM **synchrone dans la requête HTTP** ajoute ~1–10 s et monopolise le service web (single instance). À éviter sur le hot path.
- Comme les miss sont **rares** (cache 30 j, 4 villes), générer **au seed / au miss puis persister** élimine toute latence par requête. **Ne jamais** appeler le LLM en synchrone sur `GET /cost-of-living/search` côté cache‑hit.

---

## E. Qualité & soutenance

### E1 — Les 3 points les plus attaquables par un jury
1. **Endpoints fantômes & module vide** : ~8–10 services renvoient `"This action returns all …"` et `housing` est vide. Un jury qui appelle `/checklist` voit une fausse réponse. → **Implémenter ou retirer** ces routes (et du Swagger).
2. **“Temps réel” trompeur + forfait food 400 en dur** : données en cache 30 j / seed statique présentées comme temps réel, et budget mensuel basé sur un 400 arbitraire alors que la vraie donnée existe. → **Reformuler la fraîcheur** et **calculer food depuis `categories.food`**.
3. **Tests gonflés + cœur non testé + code mort** : le compteur de tests inclut des “should be defined” ; `expatriation-project`, `destinations`, `global-search` non testés ; `geodb`/`restCountries`/table `cost_of_living` morts. → **Tests réels sur le cœur**, **supprimer le code mort**.

### E2 — « Données en temps réel » : justifié ?
**Non, c'est trompeur.** Les prix viennent d'un **cache jsonb à TTL 30 jours**, seedé pour **4 villes** ; les métadonnées pays sont **statiques** (`countries-data.json`, drapeaux `flagcdn`) ; REST Countries est **build‑time**. Seul Adzuna (comptage d'offres, cache mémoire) est à peu près frais. Formulation honnête : **« données agrégées et mises en cache, rafraîchies périodiquement »**.

---

## Principe directeur retenu
IA en **narration / garde‑fou au‑dessus de données réelles** = oui (insight, modération).
IA comme **source des chiffres** = non. Si une suggestion propose de faire générer les **prix** par un LLM → **drapeau rouge**, à refuser.
