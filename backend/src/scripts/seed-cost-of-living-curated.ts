import 'reflect-metadata';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../db/data-source';

// Loads the committed curated snapshots (curated-cost-of-living/data/*.json) into
// cost_of_living_cache. Auto-discovers every snapshot (add a city = add a file via
// `npm run col:refresh`, no code change here). Auto-creates the city row if missing.
//
// Overwrites on conflict by design: a re-run is an intentional bulk refresh. Single
// corrections are made on the admin side; don't re-run the loader after those unless
// you want the bulk snapshot to win again.
const DATA_DIR = path.join(__dirname, 'curated-cost-of-living', 'data');

// Curated seeds are the source of truth, not a cache of a live API → long expiry so
// the runtime always serves them and never re-fetches the stale external API.
const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

// Curated country names are English; the local DB may also store French variants.
const COUNTRY_ALIASES: Record<string, string[]> = {
  France: ['France'],
  'United States': ['United States', 'États-Unis', 'Etats-Unis', 'USA'],
  Japan: ['Japan', 'Japon'],
  Switzerland: ['Switzerland', 'Suisse'],
};

async function resolveOrCreateCityId(
  cityName: string,
  country: string,
): Promise<number | null> {
  const countryAliases = (COUNTRY_ALIASES[country] ?? [country]).map((a) =>
    a.toLowerCase(),
  );

  const existing: Array<{ id_city: number }> = await AppDataSource.query(
    `SELECT c.id_city
       FROM city c
       JOIN country co ON c.country_id = co.id_country
      WHERE LOWER(c.name) = LOWER($1)
        AND LOWER(co.name) = ANY($2::text[])
      LIMIT 1`,
    [cityName, countryAliases],
  );
  if (existing[0]) return existing[0].id_city;

  const countryRow: Array<{ id_country: number }> = await AppDataSource.query(
    `SELECT id_country FROM country WHERE LOWER(name) = ANY($1::text[]) LIMIT 1`,
    [countryAliases],
  );
  if (!countryRow[0]) {
    console.warn(
      `⚠️  Country not found for ${cityName} (${country}) — seed the country first; skipping.`,
    );
    return null;
  }

  const created: Array<{ id_city: number }> = await AppDataSource.query(
    `INSERT INTO city (name, country_id, is_capital)
     VALUES ($1, $2, false)
     RETURNING id_city`,
    [cityName, countryRow[0].id_country],
  );
  console.log(`🏙️  Created city ${cityName} (${country})`);
  return created[0].id_city;
}

async function run(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(
      `No snapshots at ${DATA_DIR}. Run "npm run col:refresh" first.`,
    );
    process.exit(1);
  }
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));

  await AppDataSource.initialize();
  console.log(`📦 DB connected — loading ${files.length} curated snapshots\n`);

  let upserted = 0;
  let skipped = 0;
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    const cityName: string = data.city?.name;
    const country: string = data.city?.country;
    if (!cityName || !country) {
      console.warn(`⚠️  ${file}: missing city/country in snapshot — skipping.`);
      skipped++;
      continue;
    }

    const cityId = await resolveOrCreateCityId(cityName, country);
    if (!cityId) {
      skipped++;
      continue;
    }

    const expiresAt = new Date(Date.now() + TEN_YEARS_MS);
    await AppDataSource.query(
      `INSERT INTO cost_of_living_cache (city_id, data, cached_at, expires_at)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (city_id)
       DO UPDATE SET data = $2, cached_at = NOW(), expires_at = $3`,
      [cityId, JSON.stringify(data), expiresAt],
    );
    console.log(
      `✅ ${cityName}, ${country} (city_id=${cityId}) — ${data.meta?.source}, captured ${data.meta?.capturedAt}`,
    );
    upserted++;
  }

  console.log(
    `\n✨ Load done — ${upserted} upserted, ${skipped} skipped of ${files.length}.`,
  );
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('❌ Curated load failed:', err);
  process.exit(1);
});
