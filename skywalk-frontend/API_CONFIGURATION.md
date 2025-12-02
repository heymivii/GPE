# Configuration des API externes

## OpenWeatherMap (Widget Météo)

### Configuration rapide

1. **Copier le fichier d'exemple** :
   ```bash
   cp .env.example .env
   ```

2. **Obtenir une clé API gratuite** :
   - Créer un compte sur https://openweathermap.org/api
   - Récupérer votre clé API dans votre compte

3. **Ajouter la clé dans `.env`** :
   ```bash
   VITE_OPENWEATHER_API_KEY=votre_cle_api_ici
   ```

4. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

### Limites du plan gratuit
- 60 appels/minute
- 1 000 000 appels/mois
- Parfait pour un usage dashboard personnel !

### Sécurité
✅ La clé API est stockée dans `.env` (ignoré par Git)
✅ Ne jamais commit votre vraie clé API
✅ Utiliser `.env.example` comme template

## Fuseaux horaires (Widget Heure Locale)

✅ **Aucune configuration nécessaire** - Le widget utilise l'API native JavaScript `Intl` pour gérer les fuseaux horaires.

Les fuseaux sont déjà configurés dans `LocalTimeWidget.tsx` pour tous les pays principaux.
