
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
