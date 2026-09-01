import { parseNumbeo, CityRef } from './numbeo-parser';

const row = (label: string, avg: string, min?: string, max?: string) => `
<tr>
  <td>${label}</td>
  <td class="first_currency">${avg}</td>
  ${
    min !== undefined
      ? `<td><span class="barTextLeft">${min}</span><span class="barTextRight">${max}</span></td>`
      : ''
  }
</tr>`;

const ref: CityRef = {
  city: 'Paris',
  country: 'France',
  currency: 'EUR',
  slug: 'Paris',
};

describe('parseNumbeo', () => {
  it('extracts a known row with min/max from the price bar', () => {
    const html = row(
      '1 Bedroom Apartment in City Centre',
      '1,200.00€',
      '900.00€',
      '1,500.00€',
    );
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.housing.rent.oneBedroom.cityCenter).toEqual({
      min: 900,
      avg: 1200,
      max: 1500,
      currency: 'EUR',
    });
  });

  it('falls back to avg for min/max when the price bar is absent', () => {
    const html = row('Milk, Regular (1 liter)', '1.20€');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.food.markets.milk1L).toEqual({
      min: 1.2,
      avg: 1.2,
      max: 1.2,
      currency: 'EUR',
    });
  });

  it('marks a missing field as unavailable with a zeroed range', () => {
    const html = row('Milk, Regular (1 liter)', '1.20€');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.salary.mortgageRate).toEqual({
      min: 0,
      avg: 0,
      max: 0,
    });
    expect(result.meta.unavailable).toContain('categories.salary.mortgageRate');
  });

  it('resolves newCar from the Volkswagen Golf row when present', () => {
    const html = row(
      'Volkswagen Golf 1.4 90 KW Trendline (Or Equivalent New Car)',
      '25,000.00€',
      '22,000.00€',
      '28,000.00€',
    );
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.transportation.personal.newCar).toEqual({
      min: 22000,
      avg: 25000,
      max: 28000,
      currency: 'EUR',
    });
  });

  it('falls back to the generic "Equivalent New" row when the Golf row is absent', () => {
    const html = row('Toyota Corolla (Or Equivalent New Car)', '24,000.00€');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.transportation.personal.newCar.avg).toBe(24000);
  });

  it('splits the two "Imported Beer" rows between restaurants (1st) and markets (2nd)', () => {
    const html = [
      row('Imported Beer (0.33 Liter Bottle)', '4.50€'),
      row('Imported Beer (0.33 Liter Bottle), Markets', '3.00€'),
    ].join('\n');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.categories.restaurants.importedBeer.avg).toBe(4.5);
    expect(result.categories.food.markets.importedBeer.avg).toBe(3);
  });

  it('computes the monthly budget from the single-person estimate + one-bedroom rent', () => {
    const html =
      row('1 Bedroom Apartment in City Centre', '1,000.00€') +
      '<p>A single person estimated monthly costs are (750.50€) without rent.</p>';
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.summary.monthlyBudget).toEqual({
      min: 1750.5,
      avg: 1750.5,
      max: 1750.5,
    });
  });

  it('leaves the monthly budget unavailable when there is no single-person estimate', () => {
    const html = row('1 Bedroom Apartment in City Centre', '1,000.00€');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.summary.monthlyBudget).toEqual({ min: 0, avg: 0, max: 0 });
    expect(result.meta.unavailable).toContain('summary.monthlyBudget');
  });

  it('captures provenance: last update date, sample size, and source metadata', () => {
    const html =
      row('Milk, Regular (1 liter)', '1.20€') +
      'Last update: 16 June 2026' +
      'Numbeo had 1,234 entries in the last 12 months by 567 different contributors.';
    const result = parseNumbeo(html, ref, '2026-01-01T00:00:00Z');

    expect(result.meta.curated).toBe(true);
    expect(result.meta.source).toBe('Numbeo');
    expect(result.meta.sourceUrl).toBe(
      'https://www.numbeo.com/cost-of-living/in/Paris',
    );
    expect(result.meta.sourceLastUpdate).toBe('16 June 2026');
    expect(result.meta.sample).toBe(
      '1,234 contributions / 567 contributors (last 12 months)',
    );
    expect(result.currency.code).toBe('EUR');
  });

  it('derives averageSalary from the parsed salary row', () => {
    const html = row('Average Monthly Net Salary (After Tax)', '2,500.00€');
    const result = parseNumbeo(html, ref, '2026-01-01');
    expect(result.summary.averageSalary).toBe(2500);
  });
});
