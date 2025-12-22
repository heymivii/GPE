# 🧪 Guide de Test Docker - Skywalk

Ce guide vous montre comment vérifier que la dockerisation fonctionne correctement.

## ✅ Étape 1 : Vérifications préliminaires

### 1.1 Docker est installé et fonctionne

```bash
docker --version
docker-compose --version
docker info
```

**Résultat attendu :** Versions affichées sans erreur

### 1.2 Fichier .env existe

```bash
ls -la .env
```

Si le fichier n'existe pas :
```bash
cp .env.example .env
```

## 🚀 Étape 2 : Démarrage des services

### Option A : Mode Développement (recommandé pour tester)

```bash
./docker.sh start-dev
```

Cela démarre :
- ✅ PostgreSQL (port 5432)
- ✅ Backend NestJS (port 3000)

### Option B : Mode Production (complet)

```bash
./docker.sh start
```

Cela démarre :
- ✅ PostgreSQL (port 5432)
- ✅ Backend NestJS (port 3000)
- ✅ Frontend React + Nginx (port 80)

**⏱️ Attendez 30-60 secondes** pour que tous les services démarrent.

## 📊 Étape 3 : Vérifier l'état des containers

### 3.1 Liste des containers

```bash
docker-compose ps
# ou pour le mode dev
docker-compose -f docker-compose.dev.yml ps
```

**Résultat attendu :**
```
NAME                    STATUS
skywalk-postgres-dev    Up (healthy)
skywalk-backend-dev     Up
```

### 3.2 Voir les logs

```bash
# Tous les services
./docker.sh logs

# Backend uniquement
./docker.sh logs-backend

# Database uniquement
./docker.sh logs-db
```

**Ce qu'on cherche :**
- ✅ Backend : `Nest application successfully started`
- ✅ Database : `database system is ready to accept connections`
- ❌ Pas d'erreurs rouges critiques

## 🧪 Étape 4 : Tests fonctionnels

### 4.1 Test de la base de données

```bash
docker-compose exec db pg_isready -U skywalk_user
```

**Résultat attendu :** `accepting connections`

### 4.2 Test du backend - Health Check

```bash
curl http://localhost:3000/health
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "timestamp": "2025-12-22T...",
  "uptime": 123.456
}
```

### 4.3 Test du backend - API principale

```bash
curl http://localhost:3000
```

**Résultat attendu :** Message de bienvenue (ex: `Hello World!`)

### 4.4 Test de la connexion DB depuis le backend

```bash
docker-compose exec backend npm run typeorm -- query "SELECT 1"
```

**Résultat attendu :** Pas d'erreur de connexion

### 4.5 Test du frontend (si mode production)

Ouvrez dans un navigateur : http://localhost

**Résultat attendu :** Page d'accueil Skywalk s'affiche

## 🔍 Étape 5 : Tests avancés

### 5.1 Exécuter les migrations

```bash
./docker.sh migration-run
```

**Résultat attendu :** Migrations exécutées sans erreur

### 5.2 Shell dans le backend

```bash
./docker.sh shell-backend
```

Puis dans le shell :
```bash
npm run typeorm -- query "SELECT COUNT(*) FROM users"
exit
```

### 5.3 Shell dans la base de données

```bash
./docker.sh shell-db
```

Puis dans psql :
```sql
\l                          -- Lister les bases
\c skywalk_db              -- Se connecter
\dt                         -- Lister les tables
SELECT version();          -- Version PostgreSQL
\q                          -- Quitter
```

## 📸 Étape 6 : Résumé visuel

### Commande rapide pour tout vérifier

```bash
./test-docker.sh
```

Ce script automatique vérifie :
1. ✅ Docker est démarré
2. ✅ Containers sont running
3. ✅ Backend répond sur /health
4. ✅ Frontend répond (mode prod)
5. ✅ Database est accessible

## ❌ Dépannage

### Problème : Backend ne démarre pas

**Vérifier les logs :**
```bash
./docker.sh logs-backend
```

**Solutions courantes :**
- Database pas prête → Attendre 30 secondes de plus
- Variables d'env manquantes → Vérifier `.env`
- Port 3000 déjà utilisé → Changer dans `docker-compose.yml`

### Problème : Cannot connect to Docker daemon

**Solution :**
1. Ouvrir Docker Desktop
2. Attendre qu'il démarre complètement
3. Réessayer

### Problème : Database connection refused

**Solution :**
```bash
# Vérifier que DB est healthy
docker-compose ps

# Redémarrer si nécessaire
./docker.sh restart
```

### Problème : Port déjà utilisé

**Pour le port 3000 :**
```bash
lsof -i :3000
kill -9 <PID>
```

**Pour le port 5432 :**
```bash
lsof -i :5432
kill -9 <PID>
```

## 🧹 Nettoyage

### Arrêter les services

```bash
./docker.sh stop
```

### Tout supprimer (⚠️ perte de données)

```bash
./docker.sh clean
```

## ✨ Checklist de validation finale

- [ ] `docker-compose ps` affiche tous les containers `Up`
- [ ] `curl http://localhost:3000/health` retourne `{"status":"ok"}`
- [ ] `docker-compose logs backend` ne montre pas d'erreurs critiques
- [ ] `docker-compose exec db pg_isready` retourne `accepting connections`
- [ ] Les migrations s'exécutent : `./docker.sh migration-run`
- [ ] Frontend accessible sur http://localhost (si mode prod)

## 📚 Prochaines étapes

Une fois que tout fonctionne :
1. Tester l'inscription d'un utilisateur
2. Tester la connexion
3. Tester les endpoints API
4. Vérifier les données dans PostgreSQL

---

**🎉 Si toutes les étapes passent, la dockerisation fonctionne parfaitement !**
