import axios from 'axios';
import {
  CleanedCostOfLivingData,
  PriceRange,
} from './types/cost-of-living.types';

// Where a specific figure came from (jury-defensible provenance).
export interface SeedSourceRef {
  source: string;
  field?: string;
  url?: string;
  note?: string;
}

// Provenance metadata stored under data.meta. The frontend ignores it — it only reads
// the categories / summary / currency / city paths.
export interface SeedMeta {
  curated: true;
  source: string;
  sourceUrl: string;
  capturedAt: string;
  sourceLastUpdate?: string;
  sample?: string;
  references?: SeedSourceRef[];
  notes?: string[];
  unavailable?: string[];
}

// The full jsonb persisted to cost_of_living_cache.data (cleaned data + provenance).
export type CuratedData = CleanedCostOfLivingData & { meta: SeedMeta };

export interface CityRef {
  city: string;
  country: string; // English name used in the jsonb (matches the service's allow-list)
  currency: string;
  slug: string; // Numbeo URL slug, e.g. "Paris", "New-York"
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

export async function fetchNumbeoHtml(slug: string): Promise<string> {
  const url = `https://www.numbeo.com/cost-of-living/in/${slug}`;
  const { data } = await axios.get<string>(url, {
    timeout: 25000,
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
  });
  return data;
}

// Numbeo formats numbers US-style on the .com site (comma thousands, dot decimal),
// prefixed/suffixed by a currency symbol or HTML entity. Strip everything but the number.
function num(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/&#?\w+;/g, ' '); // drop HTML entities (currency symbols)
  const m = cleaned.match(/\d[\d,]*\.?\d*/);
  if (!m) return 0;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return Number.isNaN(v) ? 0 : v;
}

interface Row {
  label: string;
  avg: number;
  min: number;
  max: number;
}

// Parse every price row. We split on <tr> so each row is matched independently
// (a single multi-cell regex desyncs and skips every other row). A price row is any
// <tr> block that contains a `first_currency` value; its label is the first text-only
// <td>, and min/max come from the barTextLeft / barTextRight spans.
function parseRows(html: string): Row[] {
  const rows: Row[] = [];
  for (const block of html.split(/<tr[\s>]/)) {
    const avgM = block.match(/first_currency[^>]*>([^<]+)</);
    if (!avgM) continue; // not a price row
    // Label = first <td> before the value cell, with inner tags stripped (some labels
    // contain markup, e.g. "85 m<sup>2</sup>").
    const beforeAvg = block.slice(0, block.indexOf('first_currency'));
    const labelM = beforeAvg.match(/<td[^>]*>([\s\S]*?)<\/td>/);
    if (!labelM) continue;
    const label = labelM[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    if (!label) continue;
    const avg = num(avgM[1]);
    let min = num(block.match(/barTextLeft[^>]*>([^<]*)</)?.[1]);
    let max = num(block.match(/barTextRight[^>]*>([^<]*)</)?.[1]);
    if (!min) min = avg;
    if (!max) max = avg;
    rows.push({ label, avg, min, max });
  }
  return rows;
}

function findByKey(rows: Row[], key: string, occurrence = 0): Row | undefined {
  let count = 0;
  for (const r of rows) {
    if (r.label.includes(key)) {
      if (count === occurrence) return r;
      count++;
    }
  }
  return undefined;
}

export function parseNumbeo(
  html: string,
  ref: CityRef,
  capturedAt: string,
): CuratedData {
  const rows = parseRows(html);
  const unavailable: string[] = [];

  const f = (path: string, key: string, occurrence = 0): PriceRange => {
    const row = findByKey(rows, key, occurrence);
    if (!row || !row.avg) {
      unavailable.push(path);
      return { min: 0, avg: 0, max: 0, currency: ref.currency };
    }
    return { min: row.min, avg: row.avg, max: row.max, currency: ref.currency };
  };

  const housing = {
    rent: {
      oneBedroom: {
        cityCenter: f(
          'categories.housing.rent.oneBedroom.cityCenter',
          '1 Bedroom Apartment in City Centre',
        ),
        outsideCenter: f(
          'categories.housing.rent.oneBedroom.outsideCenter',
          '1 Bedroom Apartment Outside',
        ),
      },
      threeBedroom: {
        cityCenter: f(
          'categories.housing.rent.threeBedroom.cityCenter',
          '3 Bedroom Apartment in City Centre',
        ),
        outsideCenter: f(
          'categories.housing.rent.threeBedroom.outsideCenter',
          '3 Bedroom Apartment Outside',
        ),
      },
    },
    buy: {
      pricePerSqm: {
        cityCenter: f(
          'categories.housing.buy.pricePerSqm.cityCenter',
          'Buy Apartment in City Centre',
        ),
        outsideCenter: f(
          'categories.housing.buy.pricePerSqm.outsideCenter',
          'Buy Apartment Outside',
        ),
      },
    },
  };

  // newCar: Numbeo uses a Volkswagen Golf or (newer) Toyota Corolla reference row.
  const carRow =
    findByKey(rows, 'Volkswagen Golf') ?? findByKey(rows, 'Equivalent New');
  const newCar: PriceRange = carRow
    ? {
        min: carRow.min,
        avg: carRow.avg,
        max: carRow.max,
        currency: ref.currency,
      }
    : (unavailable.push('categories.transportation.personal.newCar'),
      { min: 0, avg: 0, max: 0, currency: ref.currency });

  const mortRow = findByKey(rows, 'Mortgage Interest Rate');
  const mortgageRate = mortRow
    ? { min: mortRow.min, avg: mortRow.avg, max: mortRow.max }
    : (unavailable.push('categories.salary.mortgageRate'),
      { min: 0, avg: 0, max: 0 });

  const categories: CleanedCostOfLivingData['categories'] = {
    housing,
    food: {
      markets: {
        milk1L: f('categories.food.markets.milk1L', 'Milk'),
        bread500g: f('categories.food.markets.bread500g', 'Bread'),
        eggs12: f('categories.food.markets.eggs12', 'Eggs'),
        chicken1kg: f('categories.food.markets.chicken1kg', 'Chicken'),
        beef1kg: f('categories.food.markets.beef1kg', 'Beef Round'),
        cheese1kg: f('categories.food.markets.cheese1kg', 'Local Cheese'),
        rice1kg: f('categories.food.markets.rice1kg', 'White Rice'),
        potato1kg: f('categories.food.markets.potato1kg', 'Potato'),
        tomato1kg: f('categories.food.markets.tomato1kg', 'Tomato'),
        onion1kg: f('categories.food.markets.onion1kg', 'Onion'),
        apple1kg: f('categories.food.markets.apple1kg', 'Apples'),
        banana1kg: f('categories.food.markets.banana1kg', 'Banana'),
        orange1kg: f('categories.food.markets.orange1kg', 'Oranges'),
        lettuce: f('categories.food.markets.lettuce', 'Lettuce'),
        water15L: f('categories.food.markets.water15L', '(1.5 Liter)'),
        wine: f('categories.food.markets.wine', 'Wine'),
        domesticBeer: f(
          'categories.food.markets.domesticBeer',
          'Domestic Beer (0.5 Liter Bottle',
        ),
        importedBeer: f(
          'categories.food.markets.importedBeer',
          'Imported Beer (0.33 Liter Bottle',
          1, // 2nd occurrence = Markets (1st is Restaurants)
        ),
        cigarettes: f('categories.food.markets.cigarettes', 'Cigarettes'),
      },
    },
    transportation: {
      publicTransport: {
        oneWayTicket: f(
          'categories.transportation.publicTransport.oneWayTicket',
          'One-Way Ticket',
        ),
        monthlyPass: f(
          'categories.transportation.publicTransport.monthlyPass',
          'Monthly Public Transport Pass',
        ),
      },
      taxi: {
        start: f('categories.transportation.taxi.start', 'Taxi Start'),
        per1km: f('categories.transportation.taxi.per1km', 'Taxi 1 km'),
        waitingHour: f(
          'categories.transportation.taxi.waitingHour',
          'Taxi 1 Hour Waiting',
        ),
      },
      personal: {
        gasoline1L: f(
          'categories.transportation.personal.gasoline1L',
          'Gasoline',
        ),
        newCar,
      },
    },
    utilities: {
      basic85m2: f('categories.utilities.basic85m2', 'Basic Utilities'),
      internet: f('categories.utilities.internet', 'Internet'),
      mobileMinute: f('categories.utilities.mobileMinute', 'Mobile Phone Plan'),
    },
    restaurants: {
      inexpensiveMeal: f(
        'categories.restaurants.inexpensiveMeal',
        'Inexpensive Restaurant',
      ),
      midRangeMeal2People: f(
        'categories.restaurants.midRangeMeal2People',
        'Mid-Range Restaurant',
      ),
      mcMeal: f('categories.restaurants.mcMeal', 'McDonald'),
      cappuccino: f('categories.restaurants.cappuccino', 'Cappuccino'),
      cocaCola: f('categories.restaurants.cocaCola', 'Coca-Cola or Pepsi'),
      domesticBeer: f(
        'categories.restaurants.domesticBeer',
        'Domestic Draft Beer',
      ),
      importedBeer: f(
        'categories.restaurants.importedBeer',
        'Imported Beer (0.33 Liter Bottle',
        0, // 1st occurrence = Restaurants
      ),
    },
    clothing: {
      jeans: f('categories.clothing.jeans', 'Jeans'),
      summerDress: f('categories.clothing.summerDress', 'Summer Dress'),
      runningShoes: f('categories.clothing.runningShoes', 'Running Shoes'),
      leatherShoes: f(
        'categories.clothing.leatherShoes',
        'Leather Business Shoes',
      ),
    },
    childcare: {
      preschool: f('categories.childcare.preschool', 'Preschool'),
      primarySchool: f('categories.childcare.primarySchool', 'Primary School'),
    },
    sports: {
      cinema: f('categories.sports.cinema', 'Cinema'),
      gym: f('categories.sports.gym', 'Fitness Club'),
      tennis: f('categories.sports.tennis', 'Tennis Court'),
    },
    salary: {
      averageMonthly: f(
        'categories.salary.averageMonthly',
        'Average Monthly Net Salary',
      ),
      mortgageRate,
    },
  };

  // Numbeo's own single-person monthly estimate excl. rent (local currency, in parens).
  // Strip tags in a window after "single person", then take the parenthesised figure.
  const spIdx = html.search(/single person/i);
  const spSeg =
    spIdx >= 0 ? html.slice(spIdx, spIdx + 300).replace(/<[^>]+>/g, ' ') : '';
  const singlePerson = num(spSeg.match(/\(([^)]*)\)/)?.[1]);
  const rent1c = categories.housing.rent.oneBedroom.cityCenter;
  let monthlyBudget = { min: 0, avg: 0, max: 0 };
  if (singlePerson && rent1c.avg) {
    monthlyBudget = {
      min: Math.round((rent1c.min + singlePerson) * 100) / 100,
      avg: Math.round((rent1c.avg + singlePerson) * 100) / 100,
      max: Math.round((rent1c.max + singlePerson) * 100) / 100,
    };
  } else {
    unavailable.push('summary.monthlyBudget');
  }

  const lastUpdate = html.match(
    /Last update:\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/,
  )?.[1];
  const smMatch = html.match(
    /had\s+([\d,]+)\s+entries[\s\S]*?by\s+([\d,]+)\s+different contributors/i,
  );
  const sample = smMatch
    ? `${smMatch[1]} contributions / ${smMatch[2]} contributors (last 12 months)`
    : undefined;

  const meta: SeedMeta = {
    curated: true,
    source: 'Numbeo',
    sourceUrl: `https://www.numbeo.com/cost-of-living/in/${ref.slug}`,
    capturedAt,
    sourceLastUpdate: lastUpdate,
    sample,
    notes: [
      singlePerson
        ? `summary.monthlyBudget = one-bedroom city-centre rent + ${singlePerson} (Numbeo single-person monthly estimate excl. rent).`
        : 'Numbeo provides no single-person monthly estimate for this city; summary.monthlyBudget left unavailable.',
      'categories.utilities.mobileMinute holds the Numbeo monthly mobile plan (per-minute item discontinued upstream).',
      'currency.exchangeRates intentionally empty — FX is a separate concern.',
    ],
    unavailable,
  };

  return {
    meta,
    city: { id: 0, name: ref.city, country: ref.country },
    currency: {
      code: ref.currency,
      exchangeRates: {},
      lastUpdated: lastUpdate ?? capturedAt,
    },
    categories,
    summary: {
      monthlyBudget,
      averageSalary: categories.salary.averageMonthly.avg,
    },
  };
}
