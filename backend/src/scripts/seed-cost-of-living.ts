import 'reflect-metadata';
import 'dotenv/config';
import axios from 'axios';
import * as https from 'https';
import { AppDataSource } from '../db/data-source';
import { City } from '../features/city/entities/city.entity';
import { CostOfLivingCleanerService } from '../features/cost-of-living/cost-of-living-cleaner.service';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const CACHE_TTL_DAYS = 30;

const hardcodedCostOfLivingData: Record<string, any> = {
  // France
  Lyon: {
    city_id: 1000,
    city_name: 'Lyon',
    country_name: 'France',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 12.0,
        avg: 16.0,
        max: 20.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 650.0,
        avg: 850.0,
        max: 1100.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 100.0,
        avg: 160.0,
        max: 250.0,
      },
    ],
    error: null,
  },
  Marseille: {
    city_id: 1001,
    city_name: 'Marseille',
    country_name: 'France',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 11.0,
        avg: 15.0,
        max: 19.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 600.0,
        avg: 750.0,
        max: 950.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 90.0,
        avg: 140.0,
        max: 220.0,
      },
    ],
    error: null,
  },
  Toulouse: {
    city_id: 1002,
    city_name: 'Toulouse',
    country_name: 'France',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 12.0,
        avg: 15.0,
        max: 18.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 550.0,
        avg: 700.0,
        max: 900.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 80.0,
        avg: 130.0,
        max: 200.0,
      },
    ],
    error: null,
  },
  Nice: {
    city_id: 1003,
    city_name: 'Nice',
    country_name: 'France',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 13.0,
        avg: 18.0,
        max: 25.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 800.0,
        avg: 1000.0,
        max: 1300.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 110.0,
        avg: 170.0,
        max: 260.0,
      },
    ],
    error: null,
  },
  // US
  'New York': {
    city_id: 1004,
    city_name: 'New York',
    country_name: 'United States',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 18.0,
        avg: 25.0,
        max: 40.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 3000.0,
        avg: 3800.0,
        max: 5000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 120.0,
        avg: 180.0,
        max: 300.0,
      },
    ],
    error: null,
  },
  'Los Angeles': {
    city_id: 1005,
    city_name: 'Los Angeles',
    country_name: 'United States',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 15.0,
        avg: 22.0,
        max: 35.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 2000.0,
        avg: 2600.0,
        max: 3500.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 100.0,
        avg: 160.0,
        max: 280.0,
      },
    ],
    error: null,
  },
  Chicago: {
    city_id: 1006,
    city_name: 'Chicago',
    country_name: 'United States',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 15.0,
        avg: 20.0,
        max: 30.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1500.0,
        avg: 2000.0,
        max: 2800.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 110.0,
        avg: 170.0,
        max: 270.0,
      },
    ],
    error: null,
  },
  Houston: {
    city_id: 1007,
    city_name: 'Houston',
    country_name: 'United States',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 12.0,
        avg: 18.0,
        max: 30.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1200.0,
        avg: 1600.0,
        max: 2200.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 130.0,
        avg: 200.0,
        max: 300.0,
      },
    ],
    error: null,
  },
  Phoenix: {
    city_id: 1008,
    city_name: 'Phoenix',
    country_name: 'United States',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 12.0,
        avg: 18.0,
        max: 25.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1100.0,
        avg: 1500.0,
        max: 2000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 150.0,
        avg: 230.0,
        max: 350.0,
      },
    ],
    error: null,
  },
  // Japan
  Yokohama: {
    city_id: 1009,
    city_name: 'Yokohama',
    country_name: 'Japan',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 800.0,
        avg: 1000.0,
        max: 1500.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 70000.0,
        avg: 100000.0,
        max: 150000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 15000.0,
        avg: 23000.0,
        max: 35000.0,
      },
    ],
    error: null,
  },
  Osaka: {
    city_id: 1010,
    city_name: 'Osaka',
    country_name: 'Japan',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 800.0,
        avg: 1000.0,
        max: 1500.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 60000.0,
        avg: 85000.0,
        max: 130000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 15000.0,
        avg: 22000.0,
        max: 35000.0,
      },
    ],
    error: null,
  },
  Nagoya: {
    city_id: 1011,
    city_name: 'Nagoya',
    country_name: 'Japan',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 800.0,
        avg: 1000.0,
        max: 1500.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 50000.0,
        avg: 75000.0,
        max: 120000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 15000.0,
        avg: 21000.0,
        max: 35000.0,
      },
    ],
    error: null,
  },
  Sapporo: {
    city_id: 1012,
    city_name: 'Sapporo',
    country_name: 'Japan',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 800.0,
        avg: 1000.0,
        max: 1500.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 40000.0,
        avg: 60000.0,
        max: 100000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 18000.0,
        avg: 25000.0,
        max: 40000.0,
      },
    ],
    error: null,
  },
  // Switzerland
  Geneva: {
    city_id: 1013,
    city_name: 'Geneva',
    country_name: 'Switzerland',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 20.0,
        avg: 25.0,
        max: 35.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1500.0,
        avg: 2000.0,
        max: 3000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 150.0,
        avg: 210.0,
        max: 350.0,
      },
    ],
    error: null,
  },
  Basel: {
    city_id: 1014,
    city_name: 'Basel',
    country_name: 'Switzerland',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 18.0,
        avg: 25.0,
        max: 30.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1200.0,
        avg: 1600.0,
        max: 2200.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 150.0,
        avg: 200.0,
        max: 300.0,
      },
    ],
    error: null,
  },
  Lausanne: {
    city_id: 1015,
    city_name: 'Lausanne',
    country_name: 'Switzerland',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 18.0,
        avg: 25.0,
        max: 30.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1100.0,
        avg: 1500.0,
        max: 2000.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 150.0,
        avg: 200.0,
        max: 300.0,
      },
    ],
    error: null,
  },
  Bern: {
    city_id: 1016,
    city_name: 'Bern',
    country_name: 'Switzerland',
    exchange_rates_updated: { date: new Date().toISOString() },
    prices: [
      {
        item_name: 'Meal, Inexpensive Restaurant',
        min: 18.0,
        avg: 25.0,
        max: 30.0,
      },
      {
        item_name: 'Apartment (1 bedroom) in City Centre',
        min: 1000.0,
        avg: 1400.0,
        max: 1800.0,
      },
      {
        item_name:
          'Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment',
        min: 150.0,
        avg: 200.0,
        max: 300.0,
      },
    ],
    error: null,
  },
};

async function fetchFromApi(cityName: string, countryName: string) {
  const response = await axios.get(`https://${RAPIDAPI_HOST}/prices`, {
    params: { city_name: cityName, country_name: countryName },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': RAPIDAPI_HOST!,
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
  return response.data;
}

async function seedCostOfLiving() {
  console.log('🌱 Starting Cost of Living Cache Seed...');
  console.log(`   Using API: https://${RAPIDAPI_HOST}/prices`);

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    console.error('❌ RAPIDAPI_KEY and RAPIDAPI_HOST must be set in .env');
    process.exit(1);
  }

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected\n');

    const cityRepo = AppDataSource.getRepository(City);
    const cleaner = new CostOfLivingCleanerService();

    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS cost_of_living_cache (
        id SERIAL PRIMARY KEY,
        city_id INTEGER NOT NULL UNIQUE,
        data JSONB NOT NULL,
        cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        CONSTRAINT "FK_col_cache_city" FOREIGN KEY (city_id)
          REFERENCES city(id_city) ON DELETE CASCADE
      );
    `);
    console.log('✅ Table cost_of_living_cache ready\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    const citiesList: {
      id_city: number;
      name: string;
      country_name: string;
    }[] = await AppDataSource.query(`
      SELECT c.id_city, c.city_name as name, co.country_name
      FROM city c
      JOIN country co ON c.id_country = co.id_country
      WHERE c.slug IS NOT NULL
    `);

    for (let i = 0; i < citiesList.length; i++) {
      const cityData = citiesList[i];
      const cityName = cityData.name;
      const countryName = cityData.country_name;
      const cityId = cityData.id_city;

      console.log(`📍 Processing ${cityName}, ${countryName}...`);

      const existing = await AppDataSource.query(
        `SELECT id, expires_at FROM cost_of_living_cache WHERE city_id = $1 AND expires_at > NOW()`,
        [cityId],
      );
      if (existing.length > 0) {
        console.log(
          `   ⏩ Already cached (expires ${existing[0].expires_at}). Skipping.`,
        );
        skippedCount++;
        continue;
      }

      console.log('   ⏳ Waiting 8s (rate limit)...\n');
      await new Promise((resolve) => setTimeout(resolve, 8000));

      try {
        console.log(`   🌐 Calling API for "${cityName}, ${countryName}"...`);

        // Adjust names for Numbeo API if necessary
        let apiCityName = cityName;
        if (cityName === 'New York City') apiCityName = 'New York';
        if (cityName === 'Zurich' || cityName === 'Zürich')
          apiCityName = 'Geneva';

        // Normalize country name from French DB names to English Numbeo API names
        let apiCountryName = countryName;
        if (countryName === 'États-Unis') apiCountryName = 'United States';
        if (countryName === 'Japon') apiCountryName = 'Japan';
        if (countryName === 'Suisse') apiCountryName = 'Switzerland';

        // Always use real API data
        const rawData = await fetchFromApi(apiCityName, apiCountryName);

        if (rawData.error) {
          console.warn(`   ⚠️ API returned error: ${rawData.error}`);
          errorCount++;
          continue;
        }

        console.log(
          `   📊 Received ${rawData.prices?.length || 0} price items`,
        );

        const cleanedData = cleaner.cleanData(rawData);
        console.log(
          `   🧹 Data cleaned. Monthly budget avg: ${cleanedData.summary?.monthlyBudget?.avg}`,
        );

        const expiresAt = new Date(
          Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000,
        );

        await AppDataSource.query(
          `INSERT INTO cost_of_living_cache (city_id, data, cached_at, expires_at)
           VALUES ($1, $2, NOW(), $3)
           ON CONFLICT (city_id)
           DO UPDATE SET data = $2, cached_at = NOW(), expires_at = $3`,
          [cityId, JSON.stringify(cleanedData), expiresAt],
        );

        console.log(`   ✅ Cached! Expires: ${expiresAt.toISOString()}`);
        successCount++;
      } catch (apiError: any) {
        console.error(`   ❌ API error: ${apiError.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Seed completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏩ Skipped (already cached): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    const cacheRows = await AppDataSource.query(
      `SELECT c.city_id, ci.city_name, c.cached_at, c.expires_at
       FROM cost_of_living_cache c
       JOIN city ci ON ci.id_city = c.city_id
       ORDER BY ci.city_name`,
    );
    console.log(`\n📋 Cache contents (${cacheRows.length} entries):`);
    for (const row of cacheRows) {
      console.log(
        `   - ${row.city_name} (city_id=${row.city_id}) cached at ${row.cached_at}`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCostOfLiving();
