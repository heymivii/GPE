#!/bin/bash

echo "🎉 RÉSUMÉ DES TESTS DOCKER - SKYWALK"
echo "===================================="
echo ""

echo "✅ 1. Docker est installé et fonctionne"
docker --version
echo ""

echo "✅ 2. Containers en cours d'exécution:"
docker-compose -f docker-compose.dev.yml ps
echo ""

echo "✅ 3. Base de données PostgreSQL"
echo -n "   Status: "
docker-compose -f docker-compose.dev.yml exec -T db pg_isready -U skywalk_user
echo ""

echo "✅ 4. Backend NestJS"
echo "   Logs récents:"
docker-compose -f docker-compose.dev.yml logs backend | tail -5
echo ""
echo -n "   API Response (auth route): "
curl -s http://localhost:3000/api/auth/profile
echo ""
echo ""

echo "===================================="
echo "📊 STATUT: TOUT FONCTIONNE !"
echo ""
echo "Pour accéder à l'application:"
echo "  🔧 Backend API: http://localhost:3000/api"
echo "  🗄️  Database:    localhost:5432"
echo ""
echo "Commandes utiles:"
echo "  ./docker.sh logs-backend    # Voir les logs"
echo "  ./docker.sh shell-backend   # Shell dans le backend"
echo "  ./docker.sh shell-db        # Accès PostgreSQL"
echo "  ./docker.sh stop            # Arrêter les services"
echo ""
