#!/bin/bash

echo "🧪 Test de l'API Expatriation Projects"
echo "======================================"
echo ""

# Variables
COOKIE_FILE="cookies.txt"
API_URL="http://localhost:3000/api"

echo "1️⃣  Connexion (pour obtenir le cookie)"
echo "--------------------------------------"
curl -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c ${COOKIE_FILE} \
  -s | jq '.'

echo ""
echo ""

echo "2️⃣  Récupération de tous les projets (GET /expatriation-project)"
echo "----------------------------------------------------------------"
curl -X GET ${API_URL}/expatriation-project \
  -b ${COOKIE_FILE} \
  -s | jq '.'

echo ""
echo ""

echo "3️⃣  Compteur de projets (GET /expatriation-project/count)"
echo "--------------------------------------------------------"
curl -X GET ${API_URL}/expatriation-project/count \
  -b ${COOKIE_FILE} \
  -s | jq '.'

echo ""
echo ""

echo "4️⃣  Création d'un projet de test (POST /expatriation-project)"
echo "------------------------------------------------------------"
curl -X POST ${API_URL}/expatriation-project \
  -H "Content-Type: application/json" \
  -b ${COOKIE_FILE} \
  -d '{
    "idDestinationCountry": 1,
    "idDestinationCity": 1,
    "travelType": "alone",
    "mainObjective": "work",
    "expectedDuration": 12,
    "housingBudget": 1500,
    "needsSupport": true,
    "projectStatus": "planning",
    "expectedDepartureDate": "2025-06-01"
  }' \
  -s | jq '.'

echo ""
echo ""

echo "✅ Tests terminés !"
echo ""
echo "📝 Si tu vois des erreurs 404, redémarre le backend avec:"
echo "   cd backend && npm run start:dev"
