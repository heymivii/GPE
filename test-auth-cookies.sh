#!/bin/bash

# Script de test pour l'authentification avec cookies HTTP-Only
# Assure-toi que ton backend tourne sur localhost:3000

echo "🧪 Test d'authentification avec cookies HTTP-Only"
echo "=================================================="
echo ""

# Nettoyage
rm -f cookies.txt

echo "1️⃣  Test de connexion (LOGIN)"
echo "----------------------------"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt \
  -v 2>&1 | grep -E "(< Set-Cookie|access_token|HTTP/)"

echo ""
echo ""

if [ -f cookies.txt ]; then
  echo "✅ Cookie sauvegardé dans cookies.txt"
  echo "Contenu du fichier cookies.txt:"
  cat cookies.txt
  echo ""
else
  echo "❌ Pas de cookie créé"
  exit 1
fi

echo ""
echo "2️⃣  Test de récupération du profil (GET /profile)"
echo "------------------------------------------------"
curl -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt \
  -v 2>&1 | grep -E "(< HTTP|\"email\"|\"firstName\"|401|200)"

echo ""
echo ""

echo "3️⃣  Test de déconnexion (LOGOUT)"
echo "-------------------------------"
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -v 2>&1 | grep -E "(< HTTP|Déconnexion|401|200)"

echo ""
echo ""

echo "4️⃣  Test de profil après déconnexion (devrait échouer)"
echo "-----------------------------------------------------"
curl -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt \
  -v 2>&1 | grep -E "(< HTTP|401|Unauthorized)"

echo ""
echo ""
echo "✅ Tests terminés !"
echo ""
echo "📝 Remarques:"
echo "   - Si tu vois 'Set-Cookie: access_token' au test 1 → Cookie créé ✅"
echo "   - Si tu vois un profil avec email au test 2 → Authentification OK ✅"
echo "   - Si tu vois 401 au test 4 → Déconnexion OK ✅"
