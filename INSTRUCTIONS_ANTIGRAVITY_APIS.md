# 🤖 Instructions Antigravity - GeoDB Cities + REST Countries APIs

## 🎯 Objectif

Implémenter **2 APIs complémentaires** pour obtenir les informations des destinations :
1. **GeoDB Cities API** → Infos des villes (population, GPS, timezone)
2. **REST Countries API** → Infos des pays (drapeau, devise, langue)

---

## 📦 API 1 : GeoDB Cities (via RapidAPI)

### Utilisation

**Quand :** UNE FOIS au seed de la base de données  
**Pourquoi :** Récupérer population, coordonnées GPS, timezone des villes  
**Quota gratuit :** 500 requêtes/jour

### Service à créer

**Fichier :** `backend/src/services/geodb.service.ts`

```typescript
import axios from 'axios';

interface CityData {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

class GeoDBService {
  private readonly apiKey = process.env.RAPIDAPI_KEY!;
  private readonly baseURL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

  /**
   * Recherche une ville par nom et pays
   */
  async searchCity(cityName: string, countryCode: string): Promise<CityData | null> {
    try {
      const response = await axios.get(`${this.baseURL}/cities`, {
        params: {
          namePrefix: cityName,
          countryIds: countryCode,
          types: 'CITY',
          limit: 1,
          sort: '-population'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
      });

      const data = response.data;
      
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }

      return null;
    } catch (error: any) {
      console.error(`Error fetching city ${cityName}:`, error.message);
      return null;
    }
  }

  /**
   * Helper pour respecter le rate limit
   */
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new GeoDBService();
```

---

## 📦 API 2 : REST Countries

### Utilisation

**Quand :** À CHAQUE requête utilisateur (avec cache en mémoire)  
**Pourquoi :** Récupérer drapeau, devise, langue des pays  
**Quota gratuit :** Illimité

### Installer le package de cache

```bash
npm install node-cache
```

### Service à créer

**Fichier :** `backend/src/services/restCountries.service.ts`

```typescript
import axios from 'axios';
import NodeCache from 'node-cache';

interface CountryInfo {
  name: {
    common: string;
    official: string;
  };
  capital: string[];
  currencies: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
  languages: {
    [code: string]: string;
  };
  timezones: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
  };
  cca2: string; // Code pays 2 lettres (FR, CH, US)
}

class RestCountriesService {
  private baseURL = 'https://restcountries.com/v3.1';
  private cache = new NodeCache({ stdTTL: 86400 }); // Cache 24h

  /**
   * Récupère les infos d'un pays par code (FR, CH, US, etc.)
   */
  async getCountryByCode(countryCode: string): Promise<CountryInfo | null> {
    // Vérifier le cache
    const cacheKey = `country:${countryCode}`;
    const cached = this.cache.get<CountryInfo>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseURL}/alpha/${countryCode}`);
      const country = response.data[0];
      
      // Mettre en cache
      this.cache.set(cacheKey, country);
      
      return country;
    } catch (error) {
      console.error(`Error fetching country ${countryCode}:`, error);
      return null;
    }
  }

  /**
   * Extrait les infos essentielles d'un pays
   */
  extractEssentialInfo(country: CountryInfo) {
    return {
      code: country.cca2,
      name: country.name.common,
      capital: country.capital?.[0] || '',
      currency: Object.values(country.currencies || {})[0],
      primaryLanguage: Object.values(country.languages || {})[0],
      continent: country.continents[0],
      timezone: country.timezones[0],
      flag: country.flags.svg
    };
  }
}

export default new RestCountriesService();
```

---

## 🗄️ Mise à jour du schéma de base de données

**Fichier :** `backend/src/database/schema.sql` (ou migration)

```sql
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  
  -- Informations pays
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  
  -- Informations ville (de GeoDB)
  city_name VARCHAR(100) NOT NULL,
  population INTEGER,
  coordinates JSONB,           -- {"lat": 48.8566, "lng": 2.3522}
  timezone VARCHAR(50),
  
  -- Métadonnées
  is_capital BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Dates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(country_code, city_name)
);
```

---

## 🌱 Script de seed

**Fichier :** `backend/src/scripts/seed-cities.ts`

```typescript
import geoDBService from '../services/geodb.service';
import db from '../config/database';

// Liste des villes à seed
const CITIES_TO_SEED = [
  { name: 'Paris', countryCode: 'FR' },
  { name: 'Lyon', countryCode: 'FR' },
  { name: 'Marseille', countryCode: 'FR' },
  { name: 'Zurich', countryCode: 'CH' },
  { name: 'Geneva', countryCode: 'CH' },
  { name: 'Bern', countryCode: 'CH' },
  { name: 'Berlin', countryCode: 'DE' },
  { name: 'Munich', countryCode: 'DE' },
  { name: 'London', countryCode: 'GB' },
  { name: 'Madrid', countryCode: 'ES' },
  { name: 'Barcelona', countryCode: 'ES' },
  { name: 'Rome', countryCode: 'IT' },
  { name: 'Milan', countryCode: 'IT' },
  { name: 'Amsterdam', countryCode: 'NL' },
  { name: 'Brussels', countryCode: 'BE' },
  { name: 'Lisbon', countryCode: 'PT' },
  { name: 'Stockholm', countryCode: 'SE' },
  { name: 'Copenhagen', countryCode: 'DK' },
  { name: 'Vienna', countryCode: 'AT' },
  { name: 'New York', countryCode: 'US' },
  { name: 'Los Angeles', countryCode: 'US' },
  { name: 'San Francisco', countryCode: 'US' },
  { name: 'Chicago', countryCode: 'US' },
  { name: 'Toronto', countryCode: 'CA' },
  { name: 'Vancouver', countryCode: 'CA' },
  { name: 'Tokyo', countryCode: 'JP' },
  { name: 'Singapore', countryCode: 'SG' },
  { name: 'Sydney', countryCode: 'AU' },
  { name: 'Melbourne', countryCode: 'AU' }
  // ... Ajoute jusqu'à 50 villes
];

function generateSlug(city: string, country: string): string {
  return `${city.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase()}`;
}

async function seedCities() {
  console.log('🌍 Starting city seed...\n');

  for (let i = 0; i < CITIES_TO_SEED.length; i++) {
    const { name, countryCode } = CITIES_TO_SEED[i];
    
    console.log(`[${i + 1}/${CITIES_TO_SEED.length}] Fetching ${name}, ${countryCode}...`);

    try {
      // Récupérer les infos depuis GeoDB
      const cityData = await geoDBService.searchCity(name, countryCode);

      if (!cityData) {
        console.log(`  ❌ Not found\n`);
        continue;
      }

      // Insérer dans la BDD
      await db.query(`
        INSERT INTO destinations (
          country_code,
          country_name,
          city_name,
          population,
          coordinates,
          timezone,
          slug,
          priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (country_code, city_name) 
        DO UPDATE SET 
          population = $4,
          coordinates = $5,
          timezone = $6
      `, [
        cityData.countryCode,
        cityData.country,
        cityData.name,
        cityData.population,
        JSON.stringify({ lat: cityData.latitude, lng: cityData.longitude }),
        cityData.timezone,
        generateSlug(cityData.name, cityData.countryCode),
        1 // priority (0 = capitale, 1 = grande ville)
      ]);

      console.log(`  ✅ Success - Pop: ${cityData.population.toLocaleString()}\n`);

      // Pause 2 secondes pour respecter le rate limit
      await geoDBService.sleep(2000);

    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ Seed completed!');
  process.exit(0);
}

seedCities().catch(console.error);
```

**Exécution :**
```bash
ts-node src/scripts/seed-cities.ts
```

---

## 🎮 Controller combinant les 2 APIs

**Fichier :** `backend/src/controllers/destinations.controller.ts`

```typescript
import { Request, Response } from 'express';
import db from '../config/database';
import restCountriesService from '../services/restCountries.service';

class DestinationsController {
  /**
   * GET /api/destinations/:slug
   * Exemple: /api/destinations/paris-france
   */
  async getDestination(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      // 1. Récupérer ville depuis BDD (infos de GeoDB stockées)
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

      const city = result.rows[0];

      // 2. Enrichir avec REST Countries (infos pays)
      const countryInfo = await restCountriesService.getCountryByCode(
        city.country_code
      );

      const country = countryInfo 
        ? restCountriesService.extractEssentialInfo(countryInfo)
        : null;

      // 3. Retourner combiné
      res.json({
        success: true,
        data: {
          city: {
            name: city.city_name,
            population: city.population,      // ← De GeoDB
            coordinates: city.coordinates,    // ← De GeoDB
            timezone: city.timezone,          // ← De GeoDB
            description: city.description,
            image: city.image_url
          },
          country: country  // ← De REST Countries
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
   * GET /api/destinations
   * Liste toutes les destinations
   */
  async getAllDestinations(req: Request, res: Response) {
    try {
      const result = await db.query(`
        SELECT * FROM destinations
        ORDER BY priority ASC, city_name ASC
        LIMIT 50
      `);

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
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

## 🛣️ Routes

**Fichier :** `backend/src/routes/destinations.routes.ts`

```typescript
import { Router } from 'express';
import destinationsController from '../controllers/destinations.controller';

const router = Router();

// Liste toutes les destinations
router.get('/', destinationsController.getAllDestinations);

// Détails d'une destination
router.get('/:slug', destinationsController.getDestination);

export default router;
```

**Fichier :** `backend/src/app.ts`

```typescript
import destinationsRoutes from './routes/destinations.routes';

// ... autres imports

app.use('/api/destinations', destinationsRoutes);
```

---

## 🔐 Variables d'environnement

**Fichier :** `.env`

```bash
# GeoDB Cities (utilise la même clé RapidAPI que Cost of Living)
RAPIDAPI_KEY=ta_cle_rapidapi_ici

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/expatriation_db
```

---

## ✅ Checklist d'implémentation

- [ ] Installer `node-cache` : `npm install node-cache`
- [ ] Créer `services/geodb.service.ts`
- [ ] Créer `services/restCountries.service.ts`
- [ ] Créer/Mettre à jour la table `destinations` en BDD
- [ ] Créer `scripts/seed-cities.ts`
- [ ] Exécuter le seed : `ts-node src/scripts/seed-cities.ts`
- [ ] Créer `controllers/destinations.controller.ts`
- [ ] Créer `routes/destinations.routes.ts`
- [ ] Ajouter la route dans `app.ts`
- [ ] Tester : `curl http://localhost:3000/api/destinations/paris-france`

---

## 🧪 Test de l'API

```bash
# Lister toutes les destinations
curl http://localhost:3000/api/destinations

# Détails de Paris
curl http://localhost:3000/api/destinations/paris-france
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "city": {
      "name": "Paris",
      "population": 2138551,
      "coordinates": { "lat": 48.8566, "lng": 2.3522 },
      "timezone": "Europe/Paris"
    },
    "country": {
      "code": "FR",
      "name": "France",
      "flag": "https://flagcdn.com/fr.svg",
      "currency": { "name": "Euro", "symbol": "€" },
      "primaryLanguage": "French",
      "continent": "Europe"
    }
  }
}
```

---

## 📊 Résumé des 2 APIs

| API | Usage | Fréquence | Stockage | Coût |
|-----|-------|-----------|----------|------|
| **GeoDB Cities** | Population, GPS, timezone des villes | 1x au seed | ✅ PostgreSQL | 0€ |
| **REST Countries** | Drapeau, devise, langue des pays | Chaque requête | Cache mémoire (24h) | 0€ |

---

## 🎯 Workflow final

```
1. SEED (une fois)
   GeoDB → Récupère infos 50 villes → Stocke en BDD

2. RUNTIME (chaque requête user)
   BDD → Récupère ville
   REST Countries → Récupère infos pays (avec cache)
   → Combine et retourne au frontend
```

---

**Voilà Antigravity, tu as toutes les instructions ! 🚀**
