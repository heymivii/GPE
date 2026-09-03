# Déploiement continu — suite du travail de Briac

*Rédigé le 03/09/2026 par Téné. Complète `DEPLOIEMENT.md` (infra) : ici on explique
comment la CI/CD que Briac a écrite a été **branchée et mise en service**, et
comment chacun peut la tester sans avoir accès aux comptes Heroku/Vercel.*

---

## 1. Qui a fait quoi

**Briac** a écrit tout le pipeline (`.github/workflows/ci.yml`) : lint + tests
backend et frontend, builds, image Docker, puis deux jobs de déploiement
(Heroku pour le back, Vercel pour le front) déclenchés à chaque push sur
`develop`.

**Téné** a fait la mise en service — le pipeline était prêt mais ne pouvait pas
déployer :

1. **Les 6 secrets GitHub** étaient vides (le workflow les référence mais
   personne ne les avait créés). Ils sont maintenant posés dans
   *Settings → Secrets and variables → Actions* du repo GitHub :
   `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL`,
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
2. **Fix CLI Heroku** (`53b8148`) : les runners `ubuntu-latest` n'embarquent
   plus la CLI Heroku → l'action échouait en silence (`heroku: not found`)
   puis retombait sur un `heroku create` voué à l'échec. On installe désormais
   la CLI depuis le paquet npm officiel, **version épinglée**
   (`npm install --global heroku@11.1.1`) — pas de `curl | sh` en CI.
3. **Fix chemin Vercel** (`f807d29`) : le projet Vercel définit déjà
   `Root Directory = skywalk-frontend` dans ses réglages ; le job qui se
   plaçait lui-même dans ce dossier faisait chercher
   `skywalk-frontend/skywalk-frontend` au `vercel deploy --prebuilt`.
   Le job tourne maintenant depuis la racine du repo.

## 2. Pourquoi personne n'a besoin des comptes Heroku/Vercel

Ce sont les **comptes personnels de Téné** — et c'est justement pour ça que le
CD passe par des **secrets GitHub** : le workflow s'authentifie avec des jetons
stockés chiffrés dans le repo, jamais avec un mot de passe. Concrètement :

- personne (Briac inclus) n'a besoin de se connecter à Heroku ou Vercel ;
- les jetons ne sont visibles nulle part (ni dans les logs — GitHub les masque
  en `***` — ni dans le code) ;
- si un jeton fuit ou expire, on le régénère et on remplace le secret, sans
  toucher au code.

> ⚠️ **À savoir** : le `HEROKU_API_KEY` actuel vient de `heroku auth:token`
> et **expire le 15/09/2026**. Avant cette date, Téné doit en régénérer un
> longue durée (`heroku authorizations:create`) et refaire
> `gh secret set HEROKU_API_KEY`.

## 3. Comment ça marche maintenant

```
push sur develop (GitHub CoulibalyT/skywalk)
  └─ CI : lint back + front, tests back (Jest) + front (Vitest), builds, Docker
       └─ si tout est vert :
            ├─ Deploy Backend  → Heroku  (buildpack monorepo, APP_BASE=backend)
            │    └─ le `release` du Procfile joue les migrations TypeORM
            └─ Deploy Frontend → Vercel (Root Directory=skywalk-frontend)
```

- **Backend prod** : https://skywalk-backend-api-50c5bfcb5a94.herokuapp.com
  (API sous `/api`, Swagger sous `/swagger`)
- **Frontend prod** : https://skywalk-chi.vercel.app
- Les **migrations sont automatiques** : toute migration commitée dans
  `backend/src/db/migrations/` est jouée au déploiement Heroku suivant.

> ℹ️ Le front a en réalité **deux** voies de déploiement : le job CI ci-dessus
> **et** l'intégration Git de Vercel (le projet est lié au repo GitHub, Vercel
> build aussi de son côté à chaque push — alias `skywalk-git-develop-…`).
> Redondant mais sans danger ; si on veut une seule voie, on désactivera
> l'auto-deploy dans les réglages Git du projet Vercel.

## 4. Comment Briac (ou n'importe qui) teste

1. **Déclencher** : merger/pusher sur `develop` du repo GitHub
   `CoulibalyT/skywalk` (le miroir ETNA `origin` sert au rendu, il ne
   déclenche rien — penser à pusher sur **les deux**).
2. **Suivre** : onglet **Actions** du repo GitHub → run « CI/CD Pipeline ».
   Chaque job a ses logs ; un échec de tests bloque le déploiement (c'est le
   but : rien ne part en prod si la suite n'est pas verte).
3. **Vérifier en prod** : ouvrir https://skywalk-chi.vercel.app et tester la
   feature ; pour l'API, https://skywalk-backend-api-50c5bfcb5a94.herokuapp.com/swagger.
4. **En cas de souci côté hébergeur** (crash au boot, migration qui casse…) :
   les logs Heroku/Vercel ne sont accessibles que depuis les comptes de Téné —
   lui demander, il fera un `heroku logs --tail -a skywalk-backend-api` ou
   regardera le dashboard Vercel. Si ça devient fréquent, on pourra ajouter
   Briac comme **collaborateur** sur l'app Heroku et **membre** du projet
   Vercel (invitation par email, sans partager les mots de passe).

## 5. Dépannage express

| Symptôme | Cause probable | Réflexe |
|---|---|---|
| Job « Deploy Backend » rouge, `heroku: not found` | régression runner/action | vérifier l'étape « Install Heroku CLI » |
| `Error: User not found` (Vercel) | `VERCEL_TOKEN` invalide/expiré | régénérer un token **scope Full Account** sur vercel.com/account/tokens, refaire `gh secret set VERCEL_TOKEN` |
| `Could not retrieve Project Settings` | token scopé trop étroit (projet au lieu du compte) | idem ci-dessus |
| chemin `skywalk-frontend/skywalk-frontend` | quelqu'un a remis un `working-directory` au job Vercel | le job doit tourner depuis la racine (Root Directory est géré côté Vercel) |
| Déploiement OK mais vieille version affichée | cache navigateur | hard refresh ; vérifier l'URL du dernier déploiement dans les logs du job |
