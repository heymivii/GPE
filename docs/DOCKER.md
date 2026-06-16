# 🐳 Skywalk - Guide Docker

Ce guide explique comment déployer l'application Skywalk complète (Frontend + Backend + Database) avec Docker.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## 🚀 Démarrage rapide

### 1. Cloner le projet et configurer les variables d'environnement

```bash
cd GPE_SKYWALK
cp .env.example .env
```

Éditez le fichier `.env` avec vos vraies valeurs (JWT secrets, API keys, etc.).

### 2. Lancer tous les services

```bash
docker-compose up -d
```

Cette commande va :
- 🗄️ Démarrer PostgreSQL sur le port 5432
- 🔧 Démarrer le backend NestJS sur le port 3000
- 🎨 Démarrer le frontend React (Nginx) sur le port 80

### 3. Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:3000
- **Database** : localhost:5432

## 📦 Services

### Base de données (PostgreSQL)
```yaml
Service: db
Port: 5432
Image: postgres:15-alpine
Volume: postgres_data (persistance des données)
```

### Backend (NestJS)
```yaml
Service: backend
Port: 3000
Build: ./backend/Dockerfile
Dépendances: PostgreSQL avec healthcheck
```

### Frontend (React + Nginx)
```yaml
Service: frontend
Port: 80
Build: ./skywalk-frontend/Dockerfile
Proxy API: /api → backend:3000
```

## 🛠️ Commandes utiles

### Voir les logs
```bash
docker-compose logs -f                 # Tous les services
docker-compose logs -f backend         # Backend uniquement
docker-compose logs -f frontend        # Frontend uniquement
docker-compose logs -f db              # Base de données
```

### Arrêter les services
```bash
docker-compose down                    # Arrête et supprime les containers
docker-compose down -v                 # + supprime les volumes (⚠️ perte de données)
```

### Rebuild après modifications du code
```bash
docker-compose up -d --build           # Rebuild et redémarre
docker-compose up -d --build backend   # Rebuild backend uniquement
docker-compose up -d --build frontend  # Rebuild frontend uniquement
```

### Exécuter des commandes dans les containers

#### Backend - Migrations
```bash
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run migration:generate -- src/db/migrations/MyMigration
```

#### Backend - Shell
```bash
docker-compose exec backend sh
```

#### Database - Accès psql
```bash
docker-compose exec db psql -U skywalk_user -d skywalk_db
```

### Voir le statut des services
```bash
docker-compose ps
```

### Vérifier la santé des services
```bash
docker-compose ps
```

Les services affichent `healthy` quand ils sont prêts.

## 🔧 Configuration avancée

### Variables d'environnement importantes

#### Base de données
- `DB_USERNAME`: Utilisateur PostgreSQL (défaut: skywalk_user)
- `DB_PASSWORD`: Mot de passe PostgreSQL
- `DB_DATABASE`: Nom de la base (défaut: skywalk_db)

#### Backend
- `JWT_SECRET`: Clé secrète pour les tokens JWT
- `JWT_REFRESH_SECRET`: Clé secrète pour les refresh tokens
- `FRONTEND_URL`: URL du frontend pour CORS
- `ADZUNA_APP_ID` & `ADZUNA_APP_KEY`: API Adzuna (offres d'emploi)
- `OPENWEATHER_API_KEY`: API OpenWeather (météo)
- `EXCHANGERATE_API_KEY`: API ExchangeRate (taux de change)
- `MAIL_*`: Configuration SMTP pour les emails

### Ports personnalisés

Pour changer les ports exposés, modifiez `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Frontend accessible sur :8080
  backend:
    ports:
      - "4000:3000"  # API accessible sur :4000
```

## 🔍 Debugging

### Le backend ne démarre pas
1. Vérifier les logs : `docker-compose logs backend`
2. Vérifier que PostgreSQL est healthy : `docker-compose ps`
3. Vérifier les variables d'environnement dans `.env`

### Le frontend affiche une erreur API
1. Vérifier que le backend est accessible : `curl http://localhost:3000/health`
2. Vérifier la configuration Nginx dans `skywalk-frontend/nginx.conf`
3. Vérifier les logs : `docker-compose logs frontend`

### Problèmes de connexion à la base de données
1. Vérifier que PostgreSQL est démarré : `docker-compose ps db`
2. Tester la connexion : `docker-compose exec db pg_isready`
3. Vérifier les credentials dans `.env`

## 🧹 Nettoyage

### Supprimer tous les containers et volumes
```bash
docker-compose down -v
docker system prune -a --volumes
```

⚠️ **Attention** : Cette commande supprime toutes les données !

## 📊 Production

Pour un déploiement en production :

1. **Changez tous les secrets** dans `.env`
2. **Utilisez un reverse proxy** (Traefik, Caddy) pour HTTPS
3. **Activez les limites de ressources** dans docker-compose.yml :
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```
4. **Configurez les backups** de la base de données
5. **Utilisez docker-compose.prod.yml** avec des optimisations

## 🤝 Support

Pour toute question sur Docker :
- Documentation Docker : https://docs.docker.com/
- Documentation Docker Compose : https://docs.docker.com/compose/

---

**Développé avec ❤️ par l'équipe Skywalk**
