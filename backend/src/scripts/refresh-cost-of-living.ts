import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  fetchNumbeoHtml,
  parseNumbeo,
} from '../features/cost-of-living/numbeo-parser';
import { CITY_REGISTRY } from './curated-cost-of-living/registry';

// Refreshes the curated cost-of-living snapshots from Numbeo (build-time, grounded).
// For each registry city: fetch the page, parse it deterministically, and write a
// committed JSON snapshot under curated-cost-of-living/data/<slug>.json.
// The runtime never does this — it only reads the snapshots via the loader.
//
//   npm run col:refresh            # all registry cities
//   npm run col:refresh -- Paris   # only matching city/slug
const OUT_DIR = path.join(__dirname, 'curated-cost-of-living', 'data');
const CAPTURED = new Date().toISOString().slice(0, 10);

async function run(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const filters = process.argv.slice(2).map((s) => s.toLowerCase());
  const cities = filters.length
    ? CITY_REGISTRY.filter(
        (c) =>
          filters.includes(c.slug.toLowerCase()) ||
          filters.includes(c.city.toLowerCase()),
      )
    : CITY_REGISTRY;

  let ok = 0;
  let failed = 0;
  for (const ref of cities) {
    try {
      const html = await fetchNumbeoHtml(ref.slug);
      const data = parseNumbeo(html, ref, CAPTURED);
      const file = path.join(OUT_DIR, `${ref.slug.toLowerCase()}.json`);
      fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
      const missing = data.meta.unavailable?.length ?? 0;
      console.log(
        `✅ ${ref.city} → ${path.basename(file)} (salary ${data.summary.averageSalary}, budget ${data.summary.monthlyBudget.avg}, ${missing} unavailable)`,
      );
      ok++;
      await new Promise((r) => setTimeout(r, 1500)); // be polite to Numbeo
    } catch (e) {
      console.error(`❌ ${ref.city} (${ref.slug}): ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(
    `\n✨ Refresh done — ${ok} ok, ${failed} failed of ${cities.length}.`,
  );
}

run().catch((err) => {
  console.error('Refresh crashed:', err);
  process.exit(1);
});
