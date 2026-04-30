# 💾 Stratégie de cache pour Cost of Living - Guide complet

## ❌ Pourquoi ne PAS créer des colonnes

**Problème :**
- 60+ items dans l'API = 180+ colonnes (min, avg, max)
- Impossible à maintenir
- Schéma rigide
- Données qui changent mensuellement

---

## ✅ **Solution recommandée : Cache JSON dans table séparée**

### Architecture

```
destinations (table principale)
├─ id
├─ city_name
├─ country_code
└─ ... (infos statiques)

cost_of_living_cache (table séparée)
├─ id
├─ destination_id (FK)
├─ data (JSONB)              ← Toutes les données ici !
├─ cached_at
└─ expires_at
```

---

## 🗄️ **Schéma de base de données**

### Table de cache

```sql
CREATE TABLE cost_of_living_cache (
  id SERIAL PRIMARY KEY,
  
  -- Référence à la destination
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  
  -- Données complètes en JSON
  data JSONB NOT NULL,
  
  -- Métadonnées du cache
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Index pour recherche rapide
  UNIQUE(destination_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_col_cache_destination ON cost_of_living_cache(destination_id);
CREATE INDEX idx_col_cache_expires ON cost_of_living_cache(expires_at);

-- Index GIN pour requêtes JSON (optionnel, pour filtres avancés)
CREATE INDEX idx_col_cache_data ON cost_of_living_cache USING GIN (data);
```

---

## 💻 **Service de cache Cost of Living**

### Fichier: `backend/src/services/costOfLivingCache.service.ts`

```typescript
import db from '../config/database';
import costOfLivingService from './costOfLiving.service';
import costOfLivingCleanerService from './costOfLivingCleaner.service';

interface CacheOptions {
  forceRefresh?: boolean;
  ttl?: number; // Time to live en secondes (défaut: 30 jours)
}

class CostOfLivingCacheService {
  private readonly DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 jours en secondes

  /**
   * Récupère les données de coût de vie (avec cache)
   */
  async getCachedData(
    destinationId: number,
    cityName: string,
    countryName: string,
    options: CacheOptions = {}
  ) {
    const { forceRefresh = false, ttl = this.DEFAULT_TTL } = options;

    // 1. Vérifier le cache si pas de refresh forcé
    if (!forceRefresh) {
      const cached = await this.getCacheFromDB(destinationId);
      
      if (cached && !this.isCacheExpired(cached.expires_at)) {
        console.log(`✅ Cache hit for destination ${destinationId}`);
        return cached.data;
      }
    }

    // 2. Cache expiré ou inexistant → Récupérer depuis l'API
    console.log(`🔄 Fetching fresh data for ${cityName}, ${countryName}`);
    
    try {
      const rawData = await costOfLivingService.getRawCityData(cityName, countryName);
      const cleanedData = costOfLivingCleanerService.cleanData(rawData);

      // 3. Sauvegarder en cache
      await this.saveCacheToDB(destinationId, cleanedData, ttl);

      return cleanedData;
    } catch (error: any) {
      // Si erreur API, retourner cache expiré si disponible
      const expired = await this.getCacheFromDB(destinationId);
      if (expired) {
        console.warn(`⚠️ API error, using expired cache for destination ${destinationId}`);
        return expired.data;
      }
      throw error;
    }
  }

  /**
   * Récupère le cache depuis la BDD
   */
  private async getCacheFromDB(destinationId: number) {
    const result = await db.query(
      'SELECT data, expires_at FROM cost_of_living_cache WHERE destination_id = $1',
      [destinationId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Sauvegarde les données en cache
   */
  private async saveCacheToDB(
    destinationId: number,
    data: any,
    ttl: number
  ) {
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await db.query(`
      INSERT INTO cost_of_living_cache (destination_id, data, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (destination_id)
      DO UPDATE SET
        data = $2,
        cached_at = CURRENT_TIMESTAMP,
        expires_at = $3
    `, [destinationId, JSON.stringify(data), expiresAt]);

    console.log(`💾 Cached data for destination ${destinationId} (expires: ${expiresAt.toISOString()})`);
  }

  /**
   * Vérifie si le cache est expiré
   */
  private isCacheExpired(expiresAt: Date): boolean {
    return new Date(expiresAt) < new Date();
  }

  /**
   * Invalide le cache d'une destination
   */
  async invalidateCache(destinationId: number) {
    await db.query(
      'DELETE FROM cost_of_living_cache WHERE destination_id = $1',
      [destinationId]
    );
    console.log(`🗑️ Cache invalidated for destination ${destinationId}`);
  }

  /**
   * Nettoie tous les caches expirés
   */
  async cleanExpiredCache() {
    const result = await db.query(
      'DELETE FROM cost_of_living_cache WHERE expires_at < CURRENT_TIMESTAMP RETURNING destination_id'
    );
    
    console.log(`🧹 Cleaned ${result.rowCount} expired cache entries`);
    return result.rowCount;
  }

  /**
   * Pré-remplit le cache pour toutes les destinations
   * ATTENTION: Consomme 1 requête API par destination
   */
  async warmUpCache() {
    const destinations = await db.query(`
      SELECT id, city_name, country_name 
      FROM destinations 
      ORDER BY priority ASC
    `);

    console.log(`🔥 Warming up cache for ${destinations.rows.length} destinations...`);

    let successCount = 0;
    let errorCount = 0;

    for (const dest of destinations.rows) {
      try {
        await this.getCachedData(
          dest.id,
          dest.city_name,
          dest.country_name,
          { forceRefresh: true }
        );
        
        successCount++;
        console.log(`  ✅ [${successCount}/${destinations.rows.length}] ${dest.city_name}`);

        // Pause pour éviter rate limit (100 req/mois = ~3/jour safe)
        await this.sleep(30000); // 30 secondes entre chaque

      } catch (error: any) {
        errorCount++;
        console.log(`  ❌ [${successCount + errorCount}/${destinations.rows.length}] ${dest.city_name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Cache warm-up completed: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount };
  }

  /**
   * Statistiques du cache
   */
  async getCacheStats() {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE expires_at > CURRENT_TIMESTAMP) as valid,
        COUNT(*) FILTER (WHERE expires_at <= CURRENT_TIMESTAMP) as expired,
        MIN(cached_at) as oldest,
        MAX(cached_at) as newest
      FROM cost_of_living_cache
    `);

    return stats.rows[0];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new CostOfLivingCacheService();
```

---

## 🎮 **Controller mis à jour**

### Fichier: `backend/src/controllers/destinations.controller.ts`

```typescript
import { Request, Response } from 'express';
import db from '../config/database';
import restCountriesService from '../services/restCountries.service';
import costOfLivingCacheService from '../services/costOfLivingCache.service';

class DestinationsController {
  /**
   * GET /api/destinations/:slug
   */
  async getDestination(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { refresh } = req.query; // ?refresh=true pour forcer le rafraîchissement

      // 1. Récupérer destination
      const result = await db.query(
        'SELECT * FROM destinations WHERE slug = $1',
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      const destination = result.rows[0];

      // 2. Récupérer infos pays
      const countryInfo = await restCountriesService.getCountryByCode(
        destination.country_code
      );

      // 3. Récupérer coût de la vie (AVEC CACHE)
      const costOfLiving = await costOfLivingCacheService.getCachedData(
        destination.id,
        destination.city_name,
        destination.country_name,
        { forceRefresh: refresh === 'true' }
      );

      // 4. Retourner tout
      res.json({
        success: true,
        data: {
          city: {
            name: destination.city_name,
            population: destination.population,
            coordinates: destination.coordinates,
            timezone: destination.timezone,
            description: destination.description,
            image: destination.image_url
          },
          country: countryInfo 
            ? restCountriesService.extractEssentialInfo(countryInfo)
            : null,
          costOfLiving: costOfLiving
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/destinations/:slug/refresh-cache
   * Force le rafraîchissement du cache
   */
  async refreshCache(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const result = await db.query(
        'SELECT * FROM destinations WHERE slug = $1',
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      const destination = result.rows[0];

      // Rafraîchir le cache
      const freshData = await costOfLivingCacheService.getCachedData(
        destination.id,
        destination.city_name,
        destination.country_name,
        { forceRefresh: true }
      );

      res.json({
        success: true,
        message: 'Cache refreshed successfully',
        data: freshData
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new DestinationsController();
```

---

## 🛠️ **Scripts utilitaires**

### Script de warm-up du cache

**Fichier:** `backend/src/scripts/warmup-cache.ts`

```typescript
import costOfLivingCacheService from '../services/costOfLivingCache.service';

async function warmUpCache() {
  console.log('🔥 Starting cache warm-up...\n');
  console.log('⚠️  This will consume API quota (1 request per destination)\n');

  const stats = await costOfLivingCacheService.warmUpCache();

  console.log('\n📊 Final stats:');
  console.log(`  Success: ${stats.successCount}`);
  console.log(`  Errors: ${stats.errorCount}`);

  process.exit(0);
}

warmUpCache().catch(console.error);
```

**Exécution:**
```bash
ts-node src/scripts/warmup-cache.ts
```

---

### Script de nettoyage du cache

**Fichier:** `backend/src/scripts/clean-cache.ts`

```typescript
import costOfLivingCacheService from '../services/costOfLivingCache.service';

async function cleanCache() {
  console.log('🧹 Cleaning expired cache...\n');

  const cleaned = await costOfLivingCacheService.cleanExpiredCache();

  console.log(`✅ Cleaned ${cleaned} expired entries`);

  const stats = await costOfLivingCacheService.getCacheStats();
  
  console.log('\n📊 Cache statistics:');
  console.log(`  Total entries: ${stats.total}`);
  console.log(`  Valid: ${stats.valid}`);
  console.log(`  Expired: ${stats.expired}`);

  process.exit(0);
}

cleanCache().catch(console.error);
```

---

## ⏰ **Cron job pour mise à jour automatique**

### Option 1: Node-cron (dans l'application)

```bash
npm install node-cron
```

**Fichier:** `backend/src/jobs/cache.job.ts`

```typescript
import cron from 'node-cron';
import costOfLivingCacheService from '../services/costOfLivingCache.service';

export function startCacheJobs() {
  // Nettoyer les caches expirés tous les jours à 3h du matin
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Running daily cache cleanup...');
    await costOfLivingCacheService.cleanExpiredCache();
  });

  // Rafraîchir 1 destination aléatoire toutes les heures
  // (pour maintenir le cache à jour progressivement)
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Refreshing random destination cache...');
    // TODO: implémenter la sélection aléatoire
  });

  console.log('✅ Cache jobs scheduled');
}
```

**Fichier:** `backend/src/app.ts`

```typescript
import { startCacheJobs } from './jobs/cache.job';

// ... après démarrage du serveur
startCacheJobs();
```

---

### Option 2: Cron système (Linux)

```bash
# Éditer le crontab
crontab -e

# Ajouter:
# Nettoyer le cache tous les jours à 3h
0 3 * * * cd /path/to/project && ts-node src/scripts/clean-cache.ts

# Warm-up partiel une fois par semaine (dimanche 2h)
0 2 * * 0 cd /path/to/project && ts-node src/scripts/warmup-cache.ts
```

---

## 📊 **Stratégie de mise à jour du cache**

### **Option 1 : Lazy loading (RECOMMANDÉ pour MVP)**

```
User demande Paris
  ↓
Cache existe et valide ? → Retourner cache
  ↓ NON
API Cost of Living → Sauvegarder en cache → Retourner
```

**Avantages:**
- ✅ Consomme quota seulement quand nécessaire
- ✅ Simple à implémenter
- ✅ Pas de maintenance

**Inconvénients:**
- ⚠️ Première visite = lente (appel API)

---

### **Option 2 : Warm-up initial + Lazy**

```
SEED (1 fois)
  Warm-up cache pour 20-30 destinations principales
  
RUNTIME
  Lazy loading pour le reste
```

**Avantages:**
- ✅ Destinations populaires = rapides
- ✅ Consommation quota contrôlée

**Commande:**
```bash
# Warm-up des 30 premières destinations
ts-node src/scripts/warmup-cache.ts --limit=30
```

---

### **Option 3 : Mise à jour rotative**

```
Tous les jours à 3h:
  Rafraîchir 3 destinations aléatoires
  
Résultat:
  Toutes les destinations rafraîchies tous les ~17 jours
  Consommation: 3 req/jour = 90 req/mois (dans le quota gratuit)
```

---

## 🎯 **Requêtes SQL utiles**

### Voir le cache d'une ville

```sql
SELECT 
  d.city_name,
  d.country_name,
  c.cached_at,
  c.expires_at,
  c.data->'summary'->'monthlyBudget'->>'avg' as monthly_budget
FROM destinations d
JOIN cost_of_living_cache c ON d.id = c.destination_id
WHERE d.slug = 'paris-france';
```

### Statistiques du cache

```sql
SELECT 
  COUNT(*) as total_cached,
  COUNT(*) FILTER (WHERE expires_at > CURRENT_TIMESTAMP) as valid,
  COUNT(*) FILTER (WHERE expires_at <= CURRENT_TIMESTAMP) as expired,
  ROUND(AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cached_at))/86400), 1) as avg_age_days
FROM cost_of_living_cache;
```

### Destinations sans cache

```sql
SELECT d.city_name, d.country_name
FROM destinations d
LEFT JOIN cost_of_living_cache c ON d.id = c.destination_id
WHERE c.id IS NULL
ORDER BY d.priority ASC;
```

---

## ✅ **Avantages de cette approche**

| Aspect | Colonnes SQL | JSON Cache |
|--------|-------------|------------|
| **Flexibilité** | ❌ Rigide | ✅ Flexible |
| **Maintenance** | ❌ Difficile | ✅ Facile |
| **Performance** | ✅ Rapide | ✅ Rapide (index GIN) |
| **Stockage** | ❌ 200+ colonnes | ✅ 1 colonne JSONB |
| **Mise à jour** | ❌ Schéma change | ✅ Juste update JSON |
| **Quota API** | ⚠️ Consommé au seed | ✅ Consommé à la demande |

---

## 🚀 **Résumé de la stratégie**

### **Architecture finale**

```
destinations (villes)
  ↓ FK
cost_of_living_cache (JSONB)
  ├─ data: {...}           ← Toutes les données
  ├─ cached_at
  └─ expires_at (30 jours)
```

### **Workflow**

```
1. User demande Paris
   ↓
2. Backend vérifie cache
   ↓
   Cache valide ? → Retourner
   ↓ NON
3. Appeler API Cost of Living
   ↓
4. Sauvegarder en cache (30 jours)
   ↓
5. Retourner au user
```

### **Maintenance**

```
Cron quotidien (3h):
  Nettoyer caches expirés
  
Optionnel:
  Rafraîchir 3 destinations/jour
```

---

**Ne crée PAS de colonnes, utilise du JSON cache ! 💾**
