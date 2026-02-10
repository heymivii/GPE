# 🧹 Instructions pour Antigravity/Copilot - Nettoyage des données Cost of Living

## 🎯 Objectif

Créer un service backend qui récupère les données de l'API "Cost of Living and Prices" (RapidAPI) et les nettoie/organise proprement par catégories pour les afficher dans le frontend.

---

## 📊 Structure des données brutes (API Response)

L'API renvoie un objet avec cette structure :

```typescript
interface RawAPIResponse {
  city_id: number;
  city_name: string;
  state_code: string | null;
  country_name: string;
  exchange_rate: {
    EUR: number;
    USD: number;
    GBP: number;
    // ... autres devises
  };
  exchange_rates_updated: {
    date: string;
    timestamp: number;
  };
  prices: Array<{
    good_id: number;
    item_name: string;
    category_id: number;
    category_name: string;
    min: number;
    avg: number;
    max: number;
    usd: {
      min: string;
      avg: string;
      max: string;
    };
    measure: 'money' | 'percent';
    currency_code: string;
  }>;
  error: null | string;
}
```

---

## 🏗️ Structure de données nettoyées (Output souhaité)

Créer cette interface TypeScript pour les données nettoyées :

```typescript
interface CleanedCostOfLivingData {
  city: {
    id: number;
    name: string;
    country: string;
    state?: string;
  };
  
  currency: {
    code: string;
    exchangeRates: {
      [key: string]: number;
    };
    lastUpdated: string;
  };
  
  categories: {
    housing: HousingData;
    food: FoodData;
    transportation: TransportationData;
    utilities: UtilitiesData;
    restaurants: RestaurantsData;
    clothing: ClothingData;
    childcare: ChildcareData;
    sports: SportsData;
    salary: SalaryData;
  };
  
  summary: {
    monthlyBudget: {
      min: number;
      avg: number;
      max: number;
    };
    averageSalary: number;
  };
}

// Interfaces détaillées pour chaque catégorie

interface HousingData {
  rent: {
    oneBedroom: {
      cityCenter: PriceRange;
      outsideCenter: PriceRange;
    };
    threeBedroom: {
      cityCenter: PriceRange;
      outsideCenter: PriceRange;
    };
  };
  buy: {
    pricePerSqm: {
      cityCenter: PriceRange;
      outsideCenter: PriceRange;
    };
  };
}

interface FoodData {
  markets: {
    milk1L: PriceRange;
    bread500g: PriceRange;
    eggs12: PriceRange;
    chicken1kg: PriceRange;
    beef1kg: PriceRange;
    cheese1kg: PriceRange;
    rice1kg: PriceRange;
    potato1kg: PriceRange;
    tomato1kg: PriceRange;
    onion1kg: PriceRange;
    apple1kg: PriceRange;
    banana1kg: PriceRange;
    orange1kg: PriceRange;
    lettuce: PriceRange;
    water15L: PriceRange;
    wine: PriceRange;
    domesticBeer: PriceRange;
    importedBeer: PriceRange;
    cigarettes: PriceRange;
  };
}

interface TransportationData {
  publicTransport: {
    oneWayTicket: PriceRange;
    monthlyPass: PriceRange;
  };
  taxi: {
    start: PriceRange;
    per1km: PriceRange;
    waitingHour: PriceRange;
  };
  personal: {
    gasoline1L: PriceRange;
    newCar: PriceRange; // Volkswagen Golf equivalent
  };
}

interface UtilitiesData {
  basic85m2: PriceRange; // Électricité, chauffage, eau, ordures
  internet: PriceRange;
  mobileMinute: PriceRange;
}

interface RestaurantsData {
  inexpensiveMeal: PriceRange;
  midRangeMeal2People: PriceRange;
  mcMeal: PriceRange;
  cappuccino: PriceRange;
  cocaCola: PriceRange;
  domesticBeer: PriceRange;
  importedBeer: PriceRange;
}

interface ClothingData {
  jeans: PriceRange;
  summerDress: PriceRange;
  runningShoes: PriceRange;
  leatherShoes: PriceRange;
}

interface ChildcareData {
  preschool: PriceRange; // Par mois
  primarySchool: PriceRange; // Par an
}

interface SportsData {
  cinema: PriceRange;
  gym: PriceRange;
  tennis: PriceRange;
}

interface SalaryData {
  averageMonthly: PriceRange;
  mortgageRate: {
    min: number;
    avg: number;
    max: number;
  };
}

interface PriceRange {
  min: number;
  avg: number;
  max: number;
  currency: string;
}
```

---

## 💻 Code à implémenter

### 1. Service de nettoyage des données

Créer le fichier : `backend/src/services/costOfLivingCleaner.service.ts`

```typescript
import { RawAPIResponse, CleanedCostOfLivingData, PriceRange } from '../types/costOfLiving.types';

class CostOfLivingCleanerService {
  /**
   * Nettoie et organise les données brutes de l'API
   */
  cleanData(rawData: RawAPIResponse): CleanedCostOfLivingData {
    return {
      city: this.extractCityInfo(rawData),
      currency: this.extractCurrencyInfo(rawData),
      categories: {
        housing: this.extractHousingData(rawData.prices),
        food: this.extractFoodData(rawData.prices),
        transportation: this.extractTransportationData(rawData.prices),
        utilities: this.extractUtilitiesData(rawData.prices),
        restaurants: this.extractRestaurantsData(rawData.prices),
        clothing: this.extractClothingData(rawData.prices),
        childcare: this.extractChildcareData(rawData.prices),
        sports: this.extractSportsData(rawData.prices),
        salary: this.extractSalaryData(rawData.prices)
      },
      summary: this.calculateSummary(rawData)
    };
  }

  /**
   * Extrait les informations de la ville
   */
  private extractCityInfo(data: RawAPIResponse) {
    return {
      id: data.city_id,
      name: data.city_name,
      country: data.country_name,
      state: data.state_code || undefined
    };
  }

  /**
   * Extrait les informations de devise
   */
  private extractCurrencyInfo(data: RawAPIResponse) {
    return {
      code: data.prices[0]?.currency_code || 'EUR',
      exchangeRates: data.exchange_rate,
      lastUpdated: data.exchange_rates_updated.date
    };
  }

  /**
   * Extrait les données de logement
   */
  private extractHousingData(prices: any[]): HousingData {
    return {
      rent: {
        oneBedroom: {
          cityCenter: this.findPrice(prices, 'One bedroom apartment in city centre'),
          outsideCenter: this.findPrice(prices, 'One bedroom apartment outside of city centre')
        },
        threeBedroom: {
          cityCenter: this.findPrice(prices, 'Three bedroom apartment in city centre'),
          outsideCenter: this.findPrice(prices, 'Three bedroom apartment outside of city centre')
        }
      },
      buy: {
        pricePerSqm: {
          cityCenter: this.findPrice(prices, 'Price per square meter to Buy Apartment in City Center'),
          outsideCenter: this.findPrice(prices, 'Price per square meter to Buy Apartment Outside of City Center')
        }
      }
    };
  }

  /**
   * Extrait les données de nourriture
   */
  private extractFoodData(prices: any[]): FoodData {
    return {
      markets: {
        milk1L: this.findPrice(prices, 'Milk, Regular,1 liter'),
        bread500g: this.findPrice(prices, 'Loaf of Fresh White Bread, 0.5 kg'),
        eggs12: this.findPrice(prices, 'Eggs, 12 pack'),
        chicken1kg: this.findPrice(prices, 'Chicken Breasts, Boneless and Skinless, 1 kg'),
        beef1kg: this.findPrice(prices, 'Beef Round or Equivalent Back Leg Red Meat, 1 kg'),
        cheese1kg: this.findPrice(prices, 'Local Cheese, 1 kg'),
        rice1kg: this.findPrice(prices, 'White Rice, 1 kg'),
        potato1kg: this.findPrice(prices, 'Potato, 1 kg'),
        tomato1kg: this.findPrice(prices, 'Tomato, 1 kg'),
        onion1kg: this.findPrice(prices, 'Onion, 1 kg'),
        apple1kg: this.findPrice(prices, 'Apples, 1 kg'),
        banana1kg: this.findPrice(prices, 'Banana, 1 kg'),
        orange1kg: this.findPrice(prices, 'Oranges, 1 kg'),
        lettuce: this.findPrice(prices, 'Lettuce, 1 head'),
        water15L: this.findPrice(prices, 'Water, 1.5 liter Bottle'),
        wine: this.findPrice(prices, 'Bottle of Wine, Mid-Range Price'),
        domesticBeer: this.findPrice(prices, 'Domestic Beer, 0.5 liter Bottle'),
        importedBeer: this.findPrice(prices, 'Imported Beer, 0.33 liter Bottle'),
        cigarettes: this.findPrice(prices, 'Pack of Cigarettes')
      }
    };
  }

  /**
   * Extrait les données de transport
   */
  private extractTransportationData(prices: any[]): TransportationData {
    return {
      publicTransport: {
        oneWayTicket: this.findPrice(prices, 'One-way Ticket, Local Transport'),
        monthlyPass: this.findPrice(prices, 'Monthly Pass, Regular Price')
      },
      taxi: {
        start: this.findPrice(prices, 'Taxi Start, Normal Tariff'),
        per1km: this.findPrice(prices, 'Taxi, price for 1 km, Normal Tariff'),
        waitingHour: this.findPrice(prices, 'Taxi, price for 1 hour Waiting, Normal Tariff')
      },
      personal: {
        gasoline1L: this.findPrice(prices, 'Gasoline, 1 liter'),
        newCar: this.findPrice(prices, 'Volkswagen Golf 1.4 90 KW Trendline (Or Equivalent New Car)')
      }
    };
  }

  /**
   * Extrait les données d'utilities
   */
  private extractUtilitiesData(prices: any[]): UtilitiesData {
    return {
      basic85m2: this.findPrice(prices, 'Basic utilities for 85 square meter Apartment including Electricity, Heating or Cooling, Water and Garbage'),
      internet: this.findPrice(prices, 'Internet, 60 Mbps or More, Unlimited Data, Cable/ADSL'),
      mobileMinute: this.findPrice(prices, 'Prepaid Mobile Tariff Local, price per 1 min, No Discounts or Plans')
    };
  }

  /**
   * Extrait les données de restaurants
   */
  private extractRestaurantsData(prices: any[]): RestaurantsData {
    return {
      inexpensiveMeal: this.findPrice(prices, 'Meal in Inexpensive Restaurant'),
      midRangeMeal2People: this.findPrice(prices, 'Meal for 2 People, Mid-range Restaurant, Three-course'),
      mcMeal: this.findPrice(prices, 'McMeal at McDonalds or Alternative Combo Meal'),
      cappuccino: this.findPrice(prices, 'Cappuccino'),
      cocaCola: this.findPrice(prices, 'Coca-Cola, 0.33 liter Bottle'),
      domesticBeer: this.findPrice(prices, 'Domestic Beer, 0.5 liter Draught'),
      importedBeer: this.findPrice(prices, 'Imported Beer, 0.33 liter Bottle')
    };
  }

  /**
   * Extrait les données de vêtements
   */
  private extractClothingData(prices: any[]): ClothingData {
    return {
      jeans: this.findPrice(prices, 'Pair of Jeans in a Chain Store Like George, H&M, Zara, etc.'),
      summerDress: this.findPrice(prices, 'Summer Dress in a Chain Store Like George, H&M, Zara, etc.'),
      runningShoes: this.findPrice(prices, 'Pair of Running Shoes, Mid-Range Price'),
      leatherShoes: this.findPrice(prices, 'Pair of Leather Business Shoes')
    };
  }

  /**
   * Extrait les données de garde d'enfants
   */
  private extractChildcareData(prices: any[]): ChildcareData {
    return {
      preschool: this.findPrice(prices, 'Private Preschool or Kindergarten, Monthly for 1 Child'),
      primarySchool: this.findPrice(prices, 'International Primary School, Yearly for 1 Child')
    };
  }

  /**
   * Extrait les données de sports et loisirs
   */
  private extractSportsData(prices: any[]): SportsData {
    return {
      cinema: this.findPrice(prices, 'Cinema ticket, 1 Seat'),
      gym: this.findPrice(prices, 'Fitness Club, Monthly Fee for 1 Adult'),
      tennis: this.findPrice(prices, 'Tennis Court Rent, 1 Hour on Weekend')
    };
  }

  /**
   * Extrait les données de salaire
   */
  private extractSalaryData(prices: any[]): SalaryData {
    const salary = this.findPrice(prices, 'Average Monthly Net Salary, After Tax');
    const mortgageItem = prices.find(p => p.item_name.includes('Mortgage Interest Rate'));

    return {
      averageMonthly: salary,
      mortgageRate: mortgageItem ? {
        min: mortgageItem.min,
        avg: mortgageItem.avg,
        max: mortgageItem.max
      } : { min: 0, avg: 0, max: 0 }
    };
  }

  /**
   * Calcule un résumé du budget mensuel
   */
  private calculateSummary(data: RawAPIResponse) {
    const rent = data.prices.find(p => p.item_name.includes('One bedroom apartment in city centre'));
    const utilities = data.prices.find(p => p.item_name.includes('Basic utilities'));
    const transport = data.prices.find(p => p.item_name.includes('Monthly Pass'));
    const food = 400; // Estimation moyenne nourriture/mois
    const salary = data.prices.find(p => p.item_name.includes('Average Monthly Net Salary'));

    const monthlyBudget = {
      min: (rent?.min || 0) + (utilities?.min || 0) + (transport?.min || 0) + food,
      avg: (rent?.avg || 0) + (utilities?.avg || 0) + (transport?.avg || 0) + food,
      max: (rent?.max || 0) + (utilities?.max || 0) + (transport?.max || 0) + food
    };

    return {
      monthlyBudget,
      averageSalary: salary?.avg || 0
    };
  }

  /**
   * Trouve un prix dans le tableau par nom d'item
   */
  private findPrice(prices: any[], itemName: string): PriceRange {
    const item = prices.find(p => p.item_name === itemName);
    
    if (!item) {
      return {
        min: 0,
        avg: 0,
        max: 0,
        currency: 'EUR'
      };
    }

    return {
      min: item.min || 0,
      avg: item.avg || 0,
      max: item.max || 0,
      currency: item.currency_code
    };
  }
}

export default new CostOfLivingCleanerService();
```

---

### 2. Mettre à jour le service Cost of Living

Modifier le fichier : `backend/src/services/costOfLiving.service.ts`

```typescript
import axios from 'axios';
import costOfLivingCleanerService from './costOfLivingCleaner.service';

class CostOfLivingService {
  private readonly apiKey = process.env.RAPIDAPI_KEY!;
  private readonly baseURL = 'https://cost-of-living-and-prices.p.rapidapi.com';

  /**
   * Récupère les données brutes de l'API
   */
  async getRawCityData(city: string, country: string) {
    try {
      const response = await axios.get(`${this.baseURL}/prices`, {
        params: {
          city_name: city,
          country_name: country
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Cost of Living API Error:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les données de coût de vie');
    }
  }

  /**
   * Récupère et nettoie les données d'une ville
   */
  async getCityData(city: string, country: string) {
    const rawData = await this.getRawCityData(city, country);
    return costOfLivingCleanerService.cleanData(rawData);
  }
}

export default new CostOfLivingService();
```

---

### 3. Controller

Créer/Mettre à jour : `backend/src/controllers/costOfLiving.controller.ts`

```typescript
import { Request, Response } from 'express';
import costOfLivingService from '../services/costOfLiving.service';

class CostOfLivingController {
  /**
   * GET /api/cost-of-living/:city/:country
   */
  async getCityData(req: Request, res: Response) {
    try {
      const { city, country } = req.params;
      
      const data = await costOfLivingService.getCityData(city, country);
      
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CostOfLivingController();
```

---

### 4. Routes

Créer/Mettre à jour : `backend/src/routes/costOfLiving.routes.ts`

```typescript
import { Router } from 'express';
import costOfLivingController from '../controllers/costOfLiving.controller';

const router = Router();

/**
 * GET /api/cost-of-living/:city/:country
 * Exemple: /api/cost-of-living/Paris/France
 */
router.get('/:city/:country', costOfLivingController.getCityData);

export default router;
```

---

### 5. Types TypeScript

Créer le fichier : `backend/src/types/costOfLiving.types.ts`

Copier toutes les interfaces définies au début de ce document (RawAPIResponse, CleanedCostOfLivingData, etc.)

---

## 🧪 Tests

Créer le fichier : `backend/tests/costOfLivingCleaner.test.ts`

```typescript
import costOfLivingCleanerService from '../src/services/costOfLivingCleaner.service';
import mockParisData from './mocks/parisData.json';

describe('CostOfLivingCleanerService', () => {
  test('should clean Paris data correctly', () => {
    const cleaned = costOfLivingCleanerService.cleanData(mockParisData);
    
    expect(cleaned.city.name).toBe('Paris');
    expect(cleaned.city.country).toBe('France');
    expect(cleaned.categories.housing.rent.oneBedroom.cityCenter.avg).toBeGreaterThan(0);
  });

  test('should extract all categories', () => {
    const cleaned = costOfLivingCleanerService.cleanData(mockParisData);
    
    expect(cleaned.categories.housing).toBeDefined();
    expect(cleaned.categories.food).toBeDefined();
    expect(cleaned.categories.transportation).toBeDefined();
    expect(cleaned.categories.utilities).toBeDefined();
    expect(cleaned.categories.restaurants).toBeDefined();
  });

  test('should calculate monthly budget summary', () => {
    const cleaned = costOfLivingCleanerService.cleanData(mockParisData);
    
    expect(cleaned.summary.monthlyBudget.avg).toBeGreaterThan(0);
    expect(cleaned.summary.averageSalary).toBeGreaterThan(0);
  });
});
```

---

## 📝 Exemple de réponse API nettoyée

Après nettoyage, l'API devrait retourner :

```json
{
  "success": true,
  "data": {
    "city": {
      "id": 627,
      "name": "Paris",
      "country": "France"
    },
    "currency": {
      "code": "EUR",
      "exchangeRates": {
        "USD": 1,
        "EUR": 0.846,
        "GBP": 0.734
      },
      "lastUpdated": "2026-02-07"
    },
    "categories": {
      "housing": {
        "rent": {
          "oneBedroom": {
            "cityCenter": { "min": 928.74, "avg": 1260.61, "max": 1857.47, "currency": "EUR" },
            "outsideCenter": { "min": 670.76, "avg": 903.76, "max": 1238.32, "currency": "EUR" }
          },
          "threeBedroom": {
            "cityCenter": { "min": 2063.86, "avg": 2845.9, "max": 3921.34, "currency": "EUR" },
            "outsideCenter": { "min": 1238.32, "avg": 1824.76, "max": 2786.22, "currency": "EUR" }
          }
        },
        "buy": {
          "pricePerSqm": {
            "cityCenter": { "min": 10319.31, "avg": 12643.57, "max": 15905.16, "currency": "EUR" },
            "outsideCenter": { "min": 7739.48, "avg": 9488.27, "max": 11654.63, "currency": "EUR" }
          }
        }
      },
      "food": {
        "markets": {
          "milk1L": { "min": 0.74, "avg": 1.11, "max": 1.75, "currency": "EUR" },
          "bread500g": { "min": 1.03, "avg": 1.8, "max": 4.13, "currency": "EUR" },
          "eggs12": { "min": 1.61, "avg": 4.03, "max": 6.45, "currency": "EUR" }
        }
      },
      "transportation": {
        "publicTransport": {
          "oneWayTicket": { "min": 1.74, "avg": 1.96, "max": 2.18, "currency": "EUR" },
          "monthlyPass": { "min": 69.66, "avg": 77.4, "max": 85.14, "currency": "EUR" }
        },
        "taxi": {
          "start": { "min": 3.1, "avg": 5.16, "max": 7.22, "currency": "EUR" },
          "per1km": { "min": 1.1, "avg": 1.55, "max": 3.1, "currency": "EUR" }
        }
      },
      "restaurants": {
        "inexpensiveMeal": { "min": 10.32, "avg": 15.48, "max": 20.64, "currency": "EUR" },
        "cappuccino": { "min": 1.96, "avg": 3.74, "max": 6.19, "currency": "EUR" }
      }
    },
    "summary": {
      "monthlyBudget": {
        "min": 1232.87,
        "avg": 1609.16,
        "max": 2232.87
      },
      "averageSalary": 2633.86
    }
  }
}
```

---

## ✅ Checklist d'implémentation

- [ ] Créer les interfaces TypeScript dans `types/costOfLiving.types.ts`
- [ ] Implémenter `costOfLivingCleaner.service.ts`
- [ ] Mettre à jour `costOfLiving.service.ts`
- [ ] Créer/Mettre à jour le controller
- [ ] Créer/Mettre à jour les routes
- [ ] Ajouter la route dans `app.ts`
- [ ] Écrire les tests unitaires
- [ ] Tester avec `curl` ou Postman
- [ ] Intégrer dans le frontend

---

## 🎯 Commandes pour tester

```bash
# Test Paris
curl http://localhost:3000/api/cost-of-living/Paris/France

# Test Genève
curl http://localhost:3000/api/cost-of-living/Geneva/Switzerland

# Test Berlin
curl http://localhost:3000/api/cost-of-living/Berlin/Germany
```

---

**Voilà Antigravity/Copilot, tu as toutes les instructions pour nettoyer et organiser les données ! 🚀**
