# 🚀 Déploiement SkyWalk — Guide clé en main

Stack de prod :
- **Backend** → Heroku (Node, `backend/Procfile`)
- **Frontend** → Vercel (`skywalk-frontend/`, `vercel.json` présent)
- **Base de données** → Heroku Postgres (add-on)
- **Source** → GitHub `heymivii/GPE` (déploiement piloté par `.github/workflows/ci.yml`, déclenché sur push vers `develop`)

> ⚠️ Aucun secret n'est versionné : `.env`, `backend/storage/` sont dans `.gitignore`. **Ne jamais committer de `.env`.**

---

## 0. Vue d'ensemble du flux

```
git push GitHub (develop)  ──►  Heroku détecte le push  ──►  build (nest build)
                                                      ──►  release: npm run migration:run   (crée/màj les tables)
                                                      ──►  web: node dist/main               (démarre l'API)

Vercel  ──►  build front (Vite)  ──►  VITE_API_URL pointe vers l'URL Heroku
```

---

## 1. Base de données — Heroku Postgres

Si l'add-on n'existe pas encore :

```bash
heroku addons:create heroku-postgresql:essential-0 -a <TON_APP>
```

Heroku crée automatiquement la config var **`DATABASE_URL`**. Mais l'app lit des variables séparées (`DB_HOST`, `DB_PORT`…), donc **il faut les dériver** de `DATABASE_URL` (voir §3, bloc `DB_*`).

> SSL : le code active SSL si `DB_SSL=true` **ou** si l'hôte contient `supabase.co`. Sur Heroku Postgres, **mets `DB_SSL=true`**.

---

## 2. Migrations — déjà branchées ✅

`backend/Procfile` :
```
release: npm run migration:run
web: node dist/main
```

La phase `release` joue les migrations à **chaque déploiement** → les 4 nouvelles tables
(`forum_topic_follow`, `support_rating`, `private_message`, colonnes expert sur `app_user`)
sont créées automatiquement. Sans ça, les features F1–F4 renvoient **500**.

> 🔧 **Point technique Heroku** : `migration:run` utilise `ts-node` (une devDependency).
> Par défaut Heroku élague les devDeps → `ts-node` disparaît → la release échoue.
> **Solution** : ajoute la config var
> ```bash
> heroku config:set NPM_CONFIG_PRODUCTION=false -a <TON_APP>
> ```
> (garde les devDeps dans le slug pour que `ts-node` reste dispo).
> Si la release migration échoue, Heroku **conserve l'ancienne version** (l'app ne casse pas), tu verras l'erreur dans `heroku logs`.

---

## 3. Variables d'environnement backend (Heroku)

`heroku config:set CLE=valeur -a <TON_APP>` (ou dashboard → Settings → Config Vars).

### Obligatoires
| Clé | Valeur | Note |
|-----|--------|------|
| `NODE_ENV` | `production` | |
| `NPM_CONFIG_PRODUCTION` | `false` | garde ts-node pour les migrations (§2) |
| `DB_HOST` | *(depuis DATABASE_URL)* | hôte Postgres |
| `DB_PORT` | `5432` | |
| `DB_USER` | *(depuis DATABASE_URL)* | |
| `DB_PASS` | *(depuis DATABASE_URL)* | |
| `DB_NAME` | *(depuis DATABASE_URL)* | |
| `DB_SSL` | `true` | **obligatoire sur Heroku PG** |
| `JWT_SECRET` | `openssl rand -hex 32` | secret fort, ≠ dev |
| `JWT_EXPIRES_IN` | `1d` | |
| `FRONTEND_URL` | `https://<ton-front>.vercel.app` | CORS (voir §5) |
| `DOCUMENT_ENCRYPTION_KEY` | `openssl rand -hex 32` | **coffre documents chiffré** (64 hex). ⚠️ si tu la changes, les documents déjà chiffrés deviennent illisibles. |

**Dériver les `DB_*` depuis `DATABASE_URL`** (`postgres://USER:PASS@HOST:PORT/NAME`) :
```bash
heroku config:get DATABASE_URL -a <TON_APP>
# postgres://u123:pAsS@ec2-x.compute.amazonaws.com:5432/dbabc
# → DB_USER=u123  DB_PASS=pAsS  DB_HOST=ec2-x...  DB_PORT=5432  DB_NAME=dbabc
```

### Optionnelles (features externes — l'app **dégrade proprement** si absentes)
| Clé | Sert à | Sans elle |
|-----|--------|-----------|
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | offres d'emploi | pas d'emplois live |
| `RAPIDAPI_KEY` / `RAPIDAPI_HOST` | coût de la vie | valeurs de repli |
| `SMTP_HOST/PORT/USER/PASS/SECURE/FROM` | e-mails (**confirmation d'adresse à l'inscription**, reset mdp, notifs) | aucun e-mail envoyé — l'inscription marche toujours, mais le lien de confirmation n'arrive jamais et le reset de mot de passe est inopérant (voir §3 bis) |
| `SEARCH_PROVIDER` | `tavily` en prod (sinon `searxng`) | recherche gov-links limitée |
| `TAVILY_API_KEY` | recherche web (si provider=tavily) | idem |
| `SEARXNG_BASE_URL` | recherche web self-hosted | idem |
| `LLM_BASE_URL` / `LLM_MODEL` / `LLM_API_KEY` | **IA locale gov-links (Ollama)** | pipeline tombe en `pending_review` (revue humaine) au lieu d'auto-résumer |
| `OPENAI_API_KEY` | filtre de contenu IA | repli blocklist/regex |
| `JINA_BASE_URL` / `PAGE_READER` | lecture de pages | repli fetch simple |
| `GENERATION_DELAY_MS` | throttle génération | défaut |

> **L'IA gov-links (Ollama, `qwen2.5:7b-instruct`) tourne en local** et n'est pas trivialement hébergeable sur Heroku.
> En prod : soit tu pointes `LLM_BASE_URL` vers un LLM hébergé, soit tu laisses vide → le pipeline reste **anti-hallucination** (il met les liens en `pending_review` au lieu d'inventer). Rien ne casse.

---

## 3 bis. SMTP — obligatoire pour la confirmation d'adresse

Sans SMTP, `MailService` bascule en prod sur `smtp.gmail.com` avec des identifiants
vides : **tous les envois échouent silencieusement** (l'appelant reçoit `false`, il ne
lève pas). Concrètement l'inscription aboutit mais le nouveau compte garde le bandeau
« Confirmez votre adresse email » sans jamais recevoir le lien, et « mot de passe
oublié » ne fait rien.

Config testée avec **Brevo** (ex-Sendinblue, 300 e-mails/jour gratuits) :

1. Compte sur [brevo.com](https://www.brevo.com) → **Senders, Domains & Dedicated IPs**
   → ajouter et **valider** l'adresse expéditrice (clic sur le mail de confirmation).
   Un `SMTP_FROM` non validé fait rejeter tous les envois.
2. Menu **SMTP & API** → onglet **SMTP** → relever le *Login* et générer une *clé SMTP*.
3. Renseigner les variables (la clé ne doit pas finir dans un fichier versionné) :

```bash
heroku config:set \
  SMTP_HOST=smtp-relay.brevo.com \
  SMTP_PORT=587 \
  SMTP_SECURE=false \
  SMTP_USER='<le Login Brevo>' \
  SMTP_PASS='<la clé SMTP Brevo>' \
  SMTP_FROM='<adresse expéditrice validée>' \
  -a skywalk-backend-api
```

`FRONTEND_URL` doit aussi être correct : c'est la base des liens contenus dans les
e-mails (`$FRONTEND_URL/auth/verify-email?token=…`).

Vérification : créer un compte de test en prod, puis
`heroku logs -a skywalk-backend-api | grep "Verification email"` — on attend
`✅ Verification email sent to …` et non `❌ Failed to send`.

En local, aucune de ces variables n'est nécessaire : les mails partent dans
**smtp4dev** (`http://localhost:8025`), qui n'existe qu'en dev.

---

## 3 ter. Compléter les données des villes (images, population)

L'auto-remplissage géo n'existait qu'à la **création** d'une ville dans l'admin :
les villes importées autrement se retrouvaient sans image, et la page destination
affichait alors la même photo Unsplash générique pour toutes.

Le script de rattrapage interroge les mêmes sources gratuites et sans clé
(Open-Meteo pour la géo, Wikipédia pour la photo) :

```bash
# en local
cd backend && npm run cities:autofill

# en prod (Wikipédia et Open-Meteo ne bloquent pas les IP de datacenter,
# contrairement à Numbeo)
heroku run:detached "npm run cities:autofill" -a skywalk-backend-api
heroku logs --app skywalk-backend-api --dyno run.XXXX   # suivre la sortie
```

Par défaut il ne remplit que les champs vides — une valeur corrigée à la main
dans l'admin n'est jamais écrasée. `-- --force` réécrit tout, `-- Lyon` limite à
une ville.

---

## 4. Déploiement backend (GitHub Actions → Heroku)

Le déploiement n'utilise **pas** l'auto-deploy natif de Heroku (qui déploierait sur chaque push, même si les tests échouent) : c'est le job `deploy-backend` de `.github/workflows/ci.yml` qui pousse vers Heroku, uniquement après que `backend-test` et `backend-build` soient passés, sur push vers `develop`.

1. **Créer l'app Heroku** si elle n'existe pas déjà (`heroku create <TON_APP>`).
2. **Monorepo** : le backend est dans `backend/`. Configure l'app pour ce sous-dossier via le buildpack monorepo :
   ```bash
   heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo -a <TON_APP>
   heroku buildpacks:add heroku/nodejs -a <TON_APP>
   heroku config:set APP_BASE=backend -a <TON_APP>
   ```
   (Si ton app Heroku existante marche déjà, elle est déjà configurée ainsi — ne touche à rien.)
3. **Secrets GitHub Actions** à ajouter (repo `heymivii/GPE` → Settings → Secrets and variables → Actions) :
   | Secret | Valeur |
   |---|---|
   | `HEROKU_API_KEY` | `heroku auth:token` |
   | `HEROKU_APP_NAME` | le nom de ton app Heroku |
   | `HEROKU_EMAIL` | l'email du compte Heroku propriétaire de la clé API |

   Ne pas activer l'auto-deploy GitHub natif de Heroku en parallèle — les deux mécanismes se marcheraient dessus.
4. Vérifie : `heroku logs --tail -a <TON_APP>` → tu dois voir la release (migrations) puis `Nest application successfully started`.

Test rapide :
```bash
curl https://<TON_APP>.herokuapp.com/api/health   # ou une route publique
```

---

## 5. Frontend — Vercel

Comme pour le backend, c'est le job `deploy-frontend` de `.github/workflows/ci.yml` qui déploie (après `frontend-test` + `frontend-build`, sur push vers `develop`) — pas l'intégration Git native de Vercel.

1. Vercel → **New Project** → importer `heymivii/GPE`, puis **annule** l'auto-deploy Git proposé par défaut (Settings → Git → Ignored Build Step, ou déconnecte l'intégration) pour laisser la main à GitHub Actions.
2. **Root Directory** = `skywalk-frontend`. Framework détecté = **Vite**.
3. **Env var** (Vercel dashboard, projet → Settings → Environment Variables) :
   | Clé | Valeur |
   |-----|--------|
   | `VITE_API_URL` | `https://<TON_APP>.herokuapp.com/api` |
   | `VITE_OPENWEATHER_API_KEY` | *(optionnel — widget météo)* |
4. **Récupère les identifiants pour GitHub Actions** :
   ```bash
   cd skywalk-frontend && npx vercel link   # crée .vercel/project.json localement
   cat .vercel/project.json                 # → orgId, projectId
   ```
5. **Secrets GitHub Actions** à ajouter (repo `heymivii/GPE`) :
   | Secret | Valeur |
   |---|---|
   | `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
   | `VERCEL_ORG_ID` | `orgId` de `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` de `.vercel/project.json` |
6. Une fois déployé, récupère l'URL Vercel → mets-la dans **`FRONTEND_URL`** côté Heroku (§3) pour le CORS.

> CORS backend (`main.ts`) autorise déjà `FRONTEND_URL` **et** tout `*.vercel.app` → les preview deploys Vercel marchent d'office.

---

## 6. Copier ta data locale → prod

⚠️ **Ta BDD locale contient beaucoup de données de test** (17 comptes `e2e_*`/`*.test`, forum/messages/ratings de test). Deux options :

> 🧩 **Attention version** : ton serveur local est en Postgres **16**, mais le `pg_dump` du PATH est en 14 → erreur *server version mismatch*.
> Utilise le binaire v16 de Postgres.app :
> ```bash
> PGDUMP=/Applications/Postgres.app/Contents/Versions/16/bin/pg_dump
> ```
> (un dump prêt à restaurer est déjà généré dans le scratchpad : `skywalk_local.dump`, 212 Ko)

### Option A — Copie intégrale (recommandé pour une démo/soutenance)
Remplace la prod par une copie exacte du local (schéma + data + table `migrations`).
Les migrations suivantes seront alors des **no-op** (déjà appliquées).

```bash
# 1. Dump du local (déjà généré : voir scratchpad, ou régénère avec le pg_dump v16)
$PGDUMP --no-owner --no-privileges -Fc \
  -h localhost -U tenecoulibaly skywalk -f skywalk_local.dump

# 2. Réinitialise la prod puis restaure
heroku pg:reset DATABASE_URL -a <TON_APP> --confirm <TON_APP>
pg_restore --no-owner --no-privileges --no-acl \
  -d "$(heroku config:get DATABASE_URL -a <TON_APP>)" skywalk_local.dump
```

### Option B — Données de référence seulement (prod propre, sans comptes de test)
Ne copie que le contenu « catalogue » (pays, villes, procédures…), les tables sont créées par les migrations (§2) :

```bash
$PGDUMP --no-owner --no-privileges --data-only \
  -t continent -t country -t city -t admin_procedure \
  -t gov_link -t search_hint -t role \
  -h localhost -U tenecoulibaly skywalk -f skywalk_ref.sql

psql "$(heroku config:get DATABASE_URL -a <TON_APP>)" < skywalk_ref.sql
```
*(ajuste la liste `-t` selon tes tables de référence réelles)*

> 🔐 Le dump contient des **hash de mots de passe** — ne le committe jamais, ne le partage pas.

---

## 7. Checklist finale

- [ ] Heroku Postgres provisionné, `DB_*` + `DB_SSL=true` posés
- [ ] `NPM_CONFIG_PRODUCTION=false` (migrations)
- [ ] `JWT_SECRET`, `DOCUMENT_ENCRYPTION_KEY` générés (`openssl rand -hex 32`)
- [ ] `APP_BASE=backend` + buildpack monorepo posés sur l'app Heroku
- [ ] Secrets GitHub Actions posés : `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- [ ] Auto-deploy Git natif désactivé côté Heroku **et** Vercel (déploiement piloté par `.github/workflows/ci.yml` uniquement)
- [ ] Déploiement OK (`heroku logs` : migrations + Nest started)
- [ ] Vercel : `VITE_API_URL` = URL Heroku `/api`
- [ ] `FRONTEND_URL` (Heroku) = URL Vercel → CORS OK
- [ ] Data copiée (Option A ou B)
- [ ] Test E2E : login → forum → experts → message privé
```
