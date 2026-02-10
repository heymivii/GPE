import 'reflect-metadata';
import 'dotenv/config';
import axios from 'axios';
import { AppDataSource } from '../db/data-source';
import { City } from '../features/city/entities/city.entity';
import { CostOfLivingCleanerService } from '../features/cost-of-living/cost-of-living-cleaner.service';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const CACHE_TTL_DAYS = 30;

/**
 * Villes MVP à seeder (doivent exister dans la table city)
 * apiName = nom reconnu par l'API RapidAPI (peut différer du nom en BDD)
 */
const targetCities = [
  { cityName: 'Paris', countryName: 'France', apiName: 'Paris' },
  { cityName: 'Lyon', countryName: 'France', apiName: 'Lyon' },
  { cityName: 'New York City', countryName: 'United States', apiName: 'New York' },
  { cityName: 'Tokyo', countryName: 'Japan', apiName: 'Tokyo' },
  { cityName: 'Zurich', countryName: 'Switzerland', apiName: 'Geneva' },
];

async function fetchFromApi(cityName: string, countryName: string) {
  const response = await axios.get(
    `https://${RAPIDAPI_HOST}/prices`,
    {
      params: { city_name: cityName, country_name: countryName },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY!,
        'x-rapidapi-host': RAPIDAPI_HOST!,
      },
    },
  );
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

    // Create the cache table if it doesn't exist
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

    for (const target of targetCities) {
      console.log(`📍 Processing ${target.cityName}, ${target.countryName}...`);

      // 1. Find city in DB
      const city = await cityRepo.findOne({
        where: { name: target.cityName },
        relations: ['country'],
      });

      if (!city) {
        console.warn(`   ⚠️ City "${target.cityName}" not found in DB. Skipping.`);
        errorCount++;
        continue;
      }
      console.log(`   Found city: ${city.name} (id=${city.city_id})`);

      // 1b. Check if already cached (skip if valid cache exists)
      const existing = await AppDataSource.query(
        `SELECT id, expires_at FROM cost_of_living_cache WHERE city_id = $1 AND expires_at > NOW()`,
        [city.city_id],
      );
      if (existing.length > 0) {
        console.log(`   ⏩ Already cached (expires ${existing[0].expires_at}). Skipping.`);
        skippedCount++;
        continue;
      }

      // 2. Fetch from RapidAPI
      try {
        console.log(`   🌐 Calling API for "${target.apiName}, ${target.countryName}"...`);
        const rawData = await fetchFromApi(target.apiName, target.countryName);

        if (rawData.error) {
          console.warn(`   ⚠️ API returned error: ${rawData.error}`);
          errorCount++;
          continue;
        }

        console.log(`   📊 Received ${rawData.prices?.length || 0} price items`);

        // 3. Clean data
        const cleanedData = cleaner.cleanData(rawData);
        console.log(`   🧹 Data cleaned. Monthly budget avg: ${cleanedData.summary?.monthlyBudget?.avg}`);

        // 4. Upsert into cache
        const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);

        await AppDataSource.query(
          `INSERT INTO cost_of_living_cache (city_id, data, cached_at, expires_at)
           VALUES ($1, $2, NOW(), $3)
           ON CONFLICT (city_id)
           DO UPDATE SET data = $2, cached_at = NOW(), expires_at = $3`,
          [city.city_id, JSON.stringify(cleanedData), expiresAt],
        );

        console.log(`   ✅ Cached! Expires: ${expiresAt.toISOString()}`);
        successCount++;

      } catch (apiError: any) {
        console.error(`   ❌ API error: ${apiError.message}`);
        errorCount++;
      }

      // 5. Respect rate limits (wait 2 seconds between calls)
      if (targetCities.indexOf(target) < targetCities.length - 1) {
        console.log('   ⏳ Waiting 2s (rate limit)...\n');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Seed completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏩ Skipped (already cached): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Show what's in cache
    const cacheRows = await AppDataSource.query(
      `SELECT c.city_id, ci.city_name, c.cached_at, c.expires_at
       FROM cost_of_living_cache c
       JOIN city ci ON ci.id_city = c.city_id
       ORDER BY ci.city_name`,
    );
    console.log(`\n📋 Cache contents (${cacheRows.length} entries):`);
    for (const row of cacheRows) {
      console.log(`   - ${row.city_name} (city_id=${row.city_id}) cached at ${row.cached_at}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCostOfLiving();
