import { CityRef } from '../../features/cost-of-living/numbeo-parser';

// The single source of truth for which cities get a curated cost-of-living snapshot.
// `slug` is the Numbeo URL slug (https://www.numbeo.com/cost-of-living/in/<slug>).
// `country` is the English name stored in the jsonb (must match the cost-of-living
// service allow-list: France / United States / Japan / Switzerland).
//
// ── Marche à suivre pour ajouter / rafraîchir une ville ──────────────────────
// ⚠️ Le bouton admin « Récupérer depuis Numbeo » échoue souvent en prod : Numbeo
// bloque les IP de serveurs (anti-bot, HTTP 503). Le slug n'y est pour rien.
// Le chemin fiable passe par un poste de dev (IP résidentielle acceptée) :
//   1. Ajouter/vérifier la ligne de la ville ci-dessous
//   2. npm run col:refresh -- <slug>       (scrape local → data/<slug>.json)
//   3. Committer le snapshot + push        (le diff EST la revue des chiffres)
//   4. heroku run "npm run seed:cost-of-living:curated" -a skywalk-backend-api
//      (charge les snapshots dans la base prod)
export const CITY_REGISTRY: CityRef[] = [
  // 🇫🇷 France
  { city: 'Paris', country: 'France', currency: 'EUR', slug: 'Paris' },
  { city: 'Marseille', country: 'France', currency: 'EUR', slug: 'Marseille' },
  { city: 'Lyon', country: 'France', currency: 'EUR', slug: 'Lyon' },
  { city: 'Toulouse', country: 'France', currency: 'EUR', slug: 'Toulouse' },
  { city: 'Nice', country: 'France', currency: 'EUR', slug: 'Nice' },
  { city: 'Bordeaux', country: 'France', currency: 'EUR', slug: 'Bordeaux' },

  // 🇺🇸 United States
  {
    city: 'New York',
    country: 'United States',
    currency: 'USD',
    slug: 'New-York',
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    currency: 'USD',
    slug: 'Los-Angeles',
  },
  {
    city: 'Chicago',
    country: 'United States',
    currency: 'USD',
    slug: 'Chicago',
  },
  {
    city: 'Houston',
    country: 'United States',
    currency: 'USD',
    slug: 'Houston',
  },
  {
    city: 'Phoenix',
    country: 'United States',
    currency: 'USD',
    slug: 'Phoenix',
  },

  // 🇯🇵 Japan
  { city: 'Tokyo', country: 'Japan', currency: 'JPY', slug: 'Tokyo' },
  { city: 'Yokohama', country: 'Japan', currency: 'JPY', slug: 'Yokohama' },
  { city: 'Osaka', country: 'Japan', currency: 'JPY', slug: 'Osaka' },
  { city: 'Nagoya', country: 'Japan', currency: 'JPY', slug: 'Nagoya' },
  { city: 'Sapporo', country: 'Japan', currency: 'JPY', slug: 'Sapporo' },

  // 🇨🇭 Switzerland
  { city: 'Zurich', country: 'Switzerland', currency: 'CHF', slug: 'Zurich' },
  { city: 'Geneva', country: 'Switzerland', currency: 'CHF', slug: 'Geneva' },
  { city: 'Basel', country: 'Switzerland', currency: 'CHF', slug: 'Basel' },
  {
    city: 'Lausanne',
    country: 'Switzerland',
    currency: 'CHF',
    slug: 'Lausanne',
  },
  { city: 'Bern', country: 'Switzerland', currency: 'CHF', slug: 'Bern' },
];
