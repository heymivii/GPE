import { Test, TestingModule } from '@nestjs/testing';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { RawAPIResponse } from './types/cost-of-living.types';

const priceItem = (
  item_name: string,
  min: number,
  avg: number,
  max: number,
) => ({
  good_id: 1,
  item_name,
  category_id: 1,
  category_name: 'test',
  min,
  avg,
  max,
  usd: { min: String(min), avg: String(avg), max: String(max) },
  measure: 'money' as const,
  currency_code: 'EUR',
});

const buildRawData = (
  overrides: Partial<RawAPIResponse> = {},
): RawAPIResponse => ({
  city_id: 1,
  city_name: 'Paris',
  state_code: null,
  country_name: 'France',
  exchange_rate: { USD: 1.1 },
  exchange_rates_updated: { date: '2026-01-01', timestamp: 123 },
  prices: [
    priceItem('One bedroom apartment in city centre', 900, 1000, 1100),
    priceItem(
      'Basic utilities for 85 square meter Apartment including Electricity, Heating or Cooling, Water and Garbage',
      150,
      180,
      200,
    ),
    priceItem('Monthly Pass, Regular Price', 60, 75, 90),
    priceItem('Average Monthly Net Salary, After Tax', 2000, 2200, 2400),
  ],
  error: null,
  ...overrides,
});

describe('CostOfLivingCleanerService', () => {
  let service: CostOfLivingCleanerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostOfLivingCleanerService],
    }).compile();
    service = module.get<CostOfLivingCleanerService>(
      CostOfLivingCleanerService,
    );
  });

  it('extracts city info including optional state', () => {
    const result = service.cleanData(buildRawData({ state_code: 'IDF' }));
    expect(result.city).toEqual({
      id: 1,
      name: 'Paris',
      country: 'France',
      state: 'IDF',
    });
  });

  it('leaves state undefined when state_code is null', () => {
    const result = service.cleanData(buildRawData({ state_code: null }));
    expect(result.city.state).toBeUndefined();
  });

  it('extracts currency info, defaulting code to EUR when prices are empty', () => {
    const result = service.cleanData(buildRawData({ prices: [] }));
    expect(result.currency.code).toBe('EUR');
    expect(result.currency.lastUpdated).toBe('2026-01-01');
  });

  it('extracts the currency code from the first price entry', () => {
    const result = service.cleanData(buildRawData());
    expect(result.currency.code).toBe('EUR');
  });

  it('returns zeroed PriceRange for items missing from the source data', () => {
    const result = service.cleanData(buildRawData({ prices: [] }));
    expect(result.categories.food.markets.milk1L).toEqual({
      min: 0,
      avg: 0,
      max: 0,
      currency: 'EUR',
    });
  });

  it('maps a known item to its min/avg/max/currency', () => {
    const result = service.cleanData(buildRawData());
    expect(result.categories.housing.rent.oneBedroom.cityCenter).toEqual({
      min: 900,
      avg: 1000,
      max: 1100,
      currency: 'EUR',
    });
  });

  it('extracts the mortgage rate when present, else defaults to zeros', () => {
    const withoutMortgage = service.cleanData(buildRawData());
    expect(withoutMortgage.categories.salary.mortgageRate).toEqual({
      min: 0,
      avg: 0,
      max: 0,
    });

    const withMortgage = service.cleanData(
      buildRawData({
        prices: [
          ...buildRawData().prices,
          priceItem('Mortgage Interest Rate, %, Yearly', 2, 3, 4),
        ],
      }),
    );
    expect(withMortgage.categories.salary.mortgageRate).toEqual({
      min: 2,
      avg: 3,
      max: 4,
    });
  });

  it('sums rent + utilities + transport into the monthly budget summary', () => {
    const result = service.cleanData(buildRawData());
    expect(result.summary.monthlyBudget).toEqual({
      min: 900 + 150 + 60,
      avg: 1000 + 180 + 75,
      max: 1100 + 200 + 90,
    });
    expect(result.summary.averageSalary).toBe(2200);
  });

  it('treats missing summary source items as zero, not undefined', () => {
    const result = service.cleanData(buildRawData({ prices: [] }));
    expect(result.summary.monthlyBudget).toEqual({ min: 0, avg: 0, max: 0 });
    expect(result.summary.averageSalary).toBe(0);
  });
});
