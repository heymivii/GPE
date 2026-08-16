# SkyWalk — Fiche plateforme (contexte complet pour une IA)

> **But de ce document** : donner à un assistant IA tout le contexte nécessaire pour comprendre
> **toutes les fonctionnalités** de SkyWalk et aider à répondre, expliquer ou étendre le code.
> Projet étudiant ETNA. Monorepo : `backend/` (API) + `skywalk-frontend/` (SPA).

---

## 1. En une phrase

**SkyWalk** est une plateforme d'**expatriation** : elle accompagne un utilisateur, étape par étape,
de l'idée de partir vivre à l'étranger jusqu'à son installation — avec des **démarches personnalisées
et vérifiées** (sources officielles), des **outils de décision** (coût de la vie, emploi, comparateur
de pays), une **communauté** (forum + experts vérifiés + messagerie), un **coffre de documents chiffré**,
et un **tableau de bord personnalisable**.

Le fil conducteur produit : *« Où j'en suis dans mon projet, et quoi faire ensuite ? »*, en restant
**honnête** (jamais de fausse info, jamais de bouton mort, jamais d'affirmation non vérifiée).

---

## 2. Stack & architecture

**Backend** — `backend/`
- **NestJS** (Node), **TypeORM**, **PostgreSQL**.
- Un dossier par domaine : `src/features/<nom>/` avec `*.module.ts`, `*.controller.ts`, `*.service.ts`,
  `entities/`, `dto/`, et les `*.spec.ts` (tests Jest).
- API préfixée **`/api`**, port **3001** en dev (`npm run start:dev`).
- **Auth JWT** (`JwtAuthGuard`), rôles via `RolesGuard` + `@Roles('admin'|'moderator')`.
- **`ClassSerializerInterceptor` global** + `@Exclude()` sur `password` → le hash n'est jamais sérialisé.
- **Migrations TypeORM** écrites à la main dans `src/db/migrations/` (⚠️ `migration:generate` produit un
  diff parasite destructeur dans ce dépôt — toujours écrire les migrations à la main).
- **Throttling** global (`@nestjs/throttler`, 60 req/min) + limites plus strictes sur certaines écritures.
- Convention de sécurité non négociable : **l'auteur d'une action vient TOUJOURS de `req.user.userId`**,
  jamais d'un `userId` dans le body.

**Frontend** — `skywalk-frontend/`
- **React + Vite + TypeScript**, **TanStack Query** (React Query), **React Router**, **Tailwind CSS**,
  **react-i18next** (bilingue **FR/EN**, ~3000 clés dans `src/locales/fr.json` et `en.json`).
- Client API par domaine dans `src/api/<domaine>.ts` (objet `xxxApi` sur `apiClient` = axios).
- Hooks React Query dans `src/hooks/useXxx.ts` avec un objet `xxxKeys` pour les query keys.
- Pages dans `src/features/<domaine>/pages/`, routes dans `src/routes/index.tsx`.
- Couleur de marque : `#5EA3C0`.
- Le backend renvoie du **camelCase**, certains types front attendent du **snake_case** → voir
  `mapTopic`/`mapMessage` dans `src/api/forum-topics.ts` (pattern de mapping).

**Déploiement** : `skywalk-frontend/vercel.json` (SPA → Vercel), `backend/Dockerfile` (image Node,
`node dist/main`), pipeline **GitLab CI** (`.gitlab-ci.yml` : stages test / build / docker).

---

## 3. Authentification & rôles

- Inscription/connexion JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/me`).
- `RegisterDto` : firstName/lastName (≥2 car.), email, password (≥8, 1 maj + 1 min + 1 chiffre),
  + optionnels age/status/languageLevel/countryOriginId.
- **Rôles** (`app_user.roles`, mono-valué) : `user` (défaut), `moderator`, `admin`. Un garde-fou empêche
  de retirer le dernier admin.
- **Statut expert** = **séparé** des rôles (colonnes `is_expert` + `expert_verified_at`, cf. §8).

---

## 4. Cœur métier : projet d'expatriation & checklist

- **Projet d'expatriation** (`expatriation-project`) : pays de destination, ville, type de voyage,
  objectif, budget, date de départ prévue, nationalité, enfants, offre d'emploi… Un utilisateur peut
  avoir **plusieurs projets** ; un **sélecteur de projet global** est dans la NavBar.
- **Onboarding** (`/onboarding`) : collecte le profil (profil, préparation, besoins/priorités).
- **Checklist / suivi de démarches** (`procedure-tracking`) : chaque projet a des **étapes** issues des
  `admin-procedure` (procédures définies par les admins), avec catégorie, **phase** (`before` = avant le
  départ / `on_arrival` = à l'arrivée), `daysBeforeDeparture`, `sourceUrl` (lien officiel), sous-étapes.
  - Statut par étape (`not_started`→`completed`) + **sous-pas cochables** (`completedFacts`, index numériques).
  - **Progression par PHASE** (jamais un « 100% » global tant que la personne n'est pas installée) :
    « Avant le départ X/Y » + « Sur place A/B ».
  - **Personnalisation honnête à 3 axes** :
    1. **Type/objectif** (`filterStepsForProject`).
    2. **Nationalité** (`personalizeFilter` + `isVisaExempt`) : un citoyen **UE/EEE/CH** allant en zone
       UE/CH est exempté de visa → l'étape « Visa & entrée » est masquée. On **n'affirme que du droit
       vérifié** (libre circulation) ; sinon on renvoie à la **source officielle** (france-visas.gouv.fr…).
    3. **Situation** (backlog : « ce que tu as déjà réglé » → masquer logement/emploi si déjà là).
  - **Compte à rebours & échéances** : J-N avant le départ + prochaines deadlines (uniquement phase
    `before`). Message « Préparation terminée — les démarches sur place vous attendent à l'arrivée ».
  - **Verdict de faisabilité** : signale quand un départ n'est plus tenable (délais dépassés) et propose
    une date réaliste.
  - **Paywall / gating par projet** (`isPaid`) : aperçu gratuit (quelques étapes), déblocage par projet
    (paiement mock, prix indicatifs) → `unlock`.
- Bannière **VisaNotice** (installation ≠ tourisme) sur la checklist + widget dashboard, selon la nationalité.

---

## 5. Données & outils de décision (pays / villes / emploi)

- **Coût de la vie** (`cost-of-living`, source **Numbeo**) : loyers, salaires moyens, paniers, par ville.
- **Qualité de vie** (`quality-of-life`) & **investissement immobilier** (`property-investment`) : caches Numbeo.
- **Offres d'emploi** (`job-offer`, source **Adzuna**) : volume d'offres + secteurs par pays.
- **Destinations / géographie** (`destinations`, `country`, `city`, `continent`, `geography`) : pays
  activés comme destinations (`selectableAsDestination`, statut `active`), villes, continents.
- **Comparateur de pays** (`city-comparison`, `comparison`) + recherche globale (`global-search`,
  `search-hint`), migration OCDE (`oecd-migration`), secteurs (`business-sector`), ressources/guides
  (`resource`, `guide`), logement (`housing`), blog (`blog`).
- **Destinations couvertes** : petit nombre (France, Japon, USA, Suisse…) — les stats de la landing sont
  **honnêtes** (compteur réel de pays, pas de faux chiffres marketing).

---

## 6. Gov-links — la fonctionnalité phare (anti-hallucination)

- `gov-links` : récupération et **vérification en direct** de **liens gouvernementaux officiels** pour
  chaque démarche (ex. le portail visa officiel du pays). Composants : query-builder, search provider
  (SearXNG), page-reader, link-verifier, official-domains, LLM-ranker.
- Principe : **zéro info périmée, zéro rumeur** — chaque étape renvoie vers la source officielle vérifiée.
  C'est le différenciateur central du produit (on ne réplique pas la donnée, on pointe vers l'autorité).
- Admin : gestion des liens (`/admin/gov-links`) + carnet de recherche (`/admin/search-hints`).

---

## 7. Forum & modération

- **Forum** (`forum-topic`, `forum-message`) : sujets par **catégorie** et par **pays**, messages,
  compteur de vues, épinglage/verrouillage (mod), compteur de réponses réel.
- **Filtrage de contenu** (`content-filter.service`) : blocklist + spam + (option OpenAI) sur les
  titres/messages.
- **Modération BDD** (`forum-moderation`, schéma d'Arphan) : mots interdits par sévérité, avertissements
  utilisateurs (`warning_count`), blocage `high`/`critical`, flag `low`/`medium`.
- **Signalements** (`user-report`) : signaler un membre ou un message ; **tableau de bord admin**
  (`/admin/moderation`) avec onglets, filtres, pagination.

---

## 8. Réseau Communauté & Experts (F1–F4) — livré, branche `feat/forum-follow`

Comble l'écart entre le manuel et le produit. **Les 6 étapes du manuel sont désormais vraies** :
ouvrir le forum → **trouver un expert** → **suivre** les discussions → poster → **message privé à un
expert** → **noter** l'aide.

- **F1 — Experts vérifiés** (`user` étendu)
  - Colonnes sur `app_user` : `is_expert`, `expert_title`, `expert_bio`, `expert_country_id`,
    `expert_verified_at`, `expert_verified_by`. Vérifié ⇔ `is_expert && expert_verified_at`.
  - `GET /users/experts?countryId=&q=` (public, filtre pays + recherche, **jamais l'email**),
    `POST/DELETE /users/:id/verify-expert` (admin), `PATCH /users/me/expert-profile` (l'expert édite
    titre/bio, sans toucher à sa vérification).
  - Front : `<ExpertBadge>` (à côté des auteurs du forum si vérifié), page **`/experts`** (annuaire,
    filtre pays + recherche), écran admin **`/admin/experts`**, édition du profil expert dans **Réglages**.

- **F2 — Suivi de discussions** (`forum_topic_follow`, unicité user+topic)
  - `POST/DELETE /forum-topic/:id/follow` (idempotent), `GET /forum-topic/followed`,
    `followersCount` + `isFollowedByMe` sur `GET /forum-topic/:id` (via `OptionalJwtAuthGuard` → `false`
    si anonyme).
  - Front : bouton **Suivre/Suivi** sur le sujet, onglet **« Topics suivis »** (remplace un ancien
    `alert("bientôt disponible")`).
  - Bonus : **notification** aux abonnés d'un topic sur nouveau message (jamais à l'auteur) ; la notif est
    **cliquable** → `/forum/post/:id`.

- **F4 — Notation de l'aide** (`support_rating`, unicité rater+message, étoiles 1–5)
  - `POST/DELETE /forum-message/:id/rate` (**interdit de noter son propre message → 400** ; re-noter met à
    jour, pas de doublon), `GET /users/:id/rating` (`{average, count}`), `averageRating`/`ratingCount`
    exposés sur les experts.
  - Front : `<StarRating>` **accessible** (radiogroup, clavier, focus visible, aria-labels) sous chaque
    **réponse** (si connecté et pas l'auteur) ; note moyenne sur `<ExpertBadge>` et les cartes de l'annuaire.

- **F3 — Messagerie privée** (`private_message`, paire sender/recipient, pas de table conversation)
  - `POST /private-message` (throttle 20/min, content-filter, **s'écrire à soi-même → 400**),
    `GET /private-message/conversations` (dernier message + non-lus), `GET /private-message/with/:userId`
    (fil chronologique, marque les reçus comme lus), `GET /private-message/unread-count`,
    `PATCH /private-message/:id/read`.
  - **SÉCURITÉ (point critique testé)** : seul le **destinataire** peut lire/marquer → **403** sinon.
    L'email n'est jamais exposé.
  - Front : page **`/messages`** (conversations + fil + composer), bouton **« Envoyer un message »** sur la
    fiche expert (**ferme la boucle trouver→contacter**), **pastille de non-lus** dans la NavBar,
    signalement d'un membre via `user-report`.

---

## 9. Coffre de documents (chiffré)

- `document` : coffre personnel (passeport, visa, contrats…). Fichiers **chiffrés au repos (AES-256-GCM)**
  hors web-root ; la BDD ne stocke que des métadonnées + une clé aléatoire (`storageKey`, jamais exposée).
- **Validation par magic-bytes** (PDF/JPEG/PNG), limite 10 Mo, **contrôle de propriété** (anti-IDOR),
  téléchargement via **blob authentifié** (pas d'URL publique).
- Types prédéfinis (passeport, carte d'identité, visa, titre de séjour, contrat, bail, acte de naissance,
  diplôme, RIB, assurance, fiche de paie, autre), i18n.
- Rattachement **optionnel** à un projet et à une étape de checklist. Page dédiée **`/documents`**
  (aperçu image/PDF via object-URL déchiffrée) + coffre intégré à la fiche projet et aux étapes.
- ⚠️ Prod : variable `DOCUMENT_ENCRYPTION_KEY` (64 hex) requise ; `storage/` gitignoré.

---

## 10. Notifications

- `notification` : `notif_type` (`reminder` = rappel d'échéance, `info` = décision, `alert` = review admin),
  message, `is_read`, `sent_at`, + **contexte cliquable** (`context_type` + `context_id` → le front mappe
  vers une route : `project`→checklist, `forum-topic`→sujet).
- `PATCH /notification/:id/read` + `PATCH /notification/read-all`.
- Front : **cloche** dans la NavBar (badge non-lues, icônes par type, refresh auto, notifs cliquables) +
  cloche admin. Rappels d'échéance générés par cron (`@Cron`, `deadline-reminder.service`).

---

## 11. Tableau de bord personnalisable (`/dashboard/personalized`)

- Widgets réordonnables/masquables (drag & drop, tailles), préférences persistées (localStorage).
- Widgets : **Checklist** (progression par phase), **⏳ Compte à rebours** (échéances applicables,
  respecte la nationalité), **📄 Documents requis** (coffre × checklist), **💬 Forum de ta destination**,
  **Profil**, **Offres d'emploi** (Adzuna), **Météo** (OpenWeather), **Recommandations**, **Budget**
  (coût de la vie + convertisseur de devises intégré).
- Anciens widgets « filler » retirés (horloge locale) ; Currency Converter fusionné dans Budget.

---

## 12. Réglages, i18n, devises, admin

- **Réglages** (`/settings`) : devise d'affichage, langue (FR/EN), compte, **profil expert** (si vérifié).
- **i18n** obligatoire : toute chaîne visible via `t('…')`, clés ajoutées dans **fr.json ET en.json**.
- **Devises** : sélecteur d'affichage (EUR/USD/GBP/CHF/JPY/CAD), conversions live.
- **Panel admin** (`/admin`, rôle admin) : dashboard, rôles, projets, démarches, continents, pays, villes,
  liens gouvernementaux, carnet de recherche, **modération forum**, **experts vérifiés**. Journalisation
  des actions admin (`admin-log`).

---

## 13. Sécurité — les garde-fous

- Auteur = `req.user.userId` (jamais du body) partout.
- Hash de mot de passe **jamais sérialisé** (`@Exclude` + interceptor global).
- **Anti-IDOR** systématique (documents, notifications, messages privés, sujets/messages).
- Messagerie : **403** si on n'est ni expéditeur ni destinataire.
- Experts : **email jamais exposé** dans l'annuaire.
- Filtrage de contenu + modération BDD sur forum **et** messages privés.
- Throttling (global + strict sur l'envoi de messages privés). Documents chiffrés au repos.
- Règle des 4 yeux sur certaines validations (l'auteur ne valide pas son propre ajout).

---

## 14. Surface d'API (endpoints clés, préfixe `/api`)

| Domaine | Endpoints notables |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/profile` |
| Users/Experts | `GET /users/me`, `PATCH /users/me`, `GET /users/experts`, `POST\|DELETE /users/:id/verify-expert`, `PATCH /users/me/expert-profile`, `GET /users/:id/rating` |
| Projets | `GET\|POST /expatriation-project`, `PATCH /expatriation-project/:id`, `unlock` |
| Checklist | `GET /procedure-tracking?projectId=`, `PATCH /procedure-tracking/:id` (`status`, `completedFacts:number[]`) |
| Forum | `GET\|POST /forum-topic`, `GET /forum-topic/:id`, `.../follow`, `/forum-topic/followed`, `GET\|POST /forum-message`, `POST /forum-message/:id/rate`, `/ratings/mine?topicId=` |
| Messagerie | `POST /private-message`, `GET /private-message/conversations`, `/with/:userId`, `/unread-count`, `PATCH /:id/read` |
| Documents | `POST /documents`, `GET /documents`, `GET /documents/:id/download`, `DELETE /documents/:id` |
| Notifs | `GET /notification`, `PATCH /notification/:id/read`, `PATCH /notification/read-all` |
| Données | `GET /destinations`, `GET /country`, `GET /cost-of-living/...`, `GET /job-offer/...`, `GET /gov-links/...` |

---

## 15. Lancer en local

```bash
# Backend (port 3001, prefix /api) — Postgres requis (voir backend/.env : DB_*)
cd backend && npm install && npm run migration:run && npm run start:dev

# Frontend (port 5173)
cd skywalk-frontend && npm install && npm run dev
```
Tests : `cd backend && npx jest` (≈423 tests) · `cd skywalk-frontend && npx vitest run`.
Type-check : `npx tsc --noEmit` (backend) · `npx tsc -b` (frontend).

---

## 16. Conventions à respecter si tu étends le code

- Backend : un dossier par feature ; entités `snake_case` via `@Entity({name})` + PK `id_xxx` ; DTO
  class-validator ; `@ApiTags` Swagger ; migrations **à la main** ; auteur = token.
- Frontend : `api/<domaine>.ts` + `hooks/useXxx.ts` (`xxxKeys`) + `features/<domaine>/pages/` ; **i18n
  FR+EN obligatoire** ; ne casse pas les mappings camelCase↔snake_case existants.
- Ne jamais : afficher un bouton non fonctionnel, exposer un email/hash, affirmer une info non vérifiée,
  committer `.env` ni `storage/`.

---

## 17. État & backlog

- **Livré & testé** : tout ce qui précède (dont F1–F4 sur `feat/forum-follow`). Back ≈423 tests verts,
  front vitest verts, tsc 0 erreur.
- **Backlog** : profil **public** de membre (messager un non-expert), envoi du param `q` au serveur pour
  la recherche experts, axe checklist « ce que tu as déjà réglé », buddy/parrainage, remontées de bug,
  témoignages réels, emails de rappel.
