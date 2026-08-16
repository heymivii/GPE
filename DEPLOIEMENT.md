# 🚀 Déploiement SkyWalk — Guide clé en main

Stack de prod :
- **Backend** → Heroku (Node, `backend/Procfile`)
- **Frontend** → Vercel (`skywalk-frontend/`, `vercel.json` présent)
- **Base de données** → Heroku Postgres (add-on)
- **Source** → GitHub `CoulibalyT/GPE_SKYWALK` (Heroku auto-deploy depuis GitHub)

> ⚠️ Aucun secret n'est versionné : `.env`, `backend/storage/` sont dans `.gitignore`. **Ne jamais committer de `.env`.**

---

## 0. Vue d'ensemble du flux

```
git push GitHub (main)  ──►  Heroku détecte le push  ──►  build (nest build)
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
| `SMTP_HOST/PORT/USER/PASS/SECURE/FROM` | e-mails (reset mdp, notifs) | pas d'e-mail envoyé |
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

## 4. Déploiement backend (auto-deploy GitHub → Heroku)

1. **Connecter le repo** : Heroku dashboard → ton app → **Deploy** → *Deployment method* = **GitHub** → connecter `CoulibalyT/GPE_SKYWALK`.
2. **Monorepo** : le backend est dans `backend/`. Configure l'app pour ce sous-dossier via le buildpack monorepo :
   ```bash
   heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo -a <TON_APP>
   heroku buildpacks:add heroku/nodejs -a <TON_APP>
   heroku config:set APP_BASE=backend -a <TON_APP>
   ```
   (Si ton app Heroku existante marche déjà, elle est déjà configurée ainsi — ne touche à rien.)
3. **Activer l'auto-deploy** sur la branche `main` (ou clique *Deploy Branch* manuellement).
4. Vérifie : `heroku logs --tail -a <TON_APP>` → tu dois voir la release (migrations) puis `Nest application successfully started`.

Test rapide :
```bash
curl https://<TON_APP>.herokuapp.com/api/health   # ou une route publique
```

---

## 5. Frontend — Vercel

1. Vercel → **New Project** → importer `CoulibalyT/GPE_SKYWALK`.
2. **Root Directory** = `skywalk-frontend`. Framework détecté = **Vite**.
3. **Env var** :
   | Clé | Valeur |
   |-----|--------|
   | `VITE_API_URL` | `https://<TON_APP>.herokuapp.com/api` |
   | `VITE_OPENWEATHER_API_KEY` | *(optionnel — widget météo)* |
4. Deploy. Récupère l'URL Vercel → mets-la dans **`FRONTEND_URL`** côté Heroku (§3) pour le CORS.

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
- [ ] Repo `CoulibalyT/GPE_SKYWALK` connecté à Heroku, `APP_BASE=backend`
- [ ] Déploiement OK (`heroku logs` : migrations + Nest started)
- [ ] Vercel : `VITE_API_URL` = URL Heroku `/api`
- [ ] `FRONTEND_URL` (Heroku) = URL Vercel → CORS OK
- [ ] Data copiée (Option A ou B)
- [ ] Test E2E : login → forum → experts → message privé
```
