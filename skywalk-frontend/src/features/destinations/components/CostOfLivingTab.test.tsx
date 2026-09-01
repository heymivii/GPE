import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CostOfLivingTab from './CostOfLivingTab';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr' },
  }),
}));

function priceRange(avg: number, min = avg - 1, max = avg + 1) {
  return { avg, min, max, currency: 'EUR' };
}

const costOfLiving = {
  currency: { code: 'EUR' },
  categories: {
    salary: { averageMonthly: priceRange(2500), mortgageRate: { avg: 1.8 } },
    housing: {
      rent: {
        oneBedroom: { cityCenter: priceRange(1000), outsideCenter: priceRange(800) },
        threeBedroom: { cityCenter: priceRange(2000), outsideCenter: priceRange(1600) },
      },
      buy: { pricePerSqm: { cityCenter: priceRange(9000), outsideCenter: priceRange(6000) } },
    },
    food: { markets: { milk1L: priceRange(1.2) } },
    transportation: { publicTransport: { monthlyPass: priceRange(75), oneWayTicket: priceRange(2) }, taxi: { start: priceRange(4), per1km: priceRange(1.5), waitingHour: priceRange(30) }, personal: { gasoline1L: priceRange(1.8), newCar: priceRange(25000) } },
  },
  summary: { monthlyBudget: priceRange(1500), averageSalary: 2500 },
};

const cities = [
  { city_id: 1, id: 1, name: 'Paris', isCapital: true, costOfLiving },
  { city_id: 2, id: 2, name: 'Lyon', isCapital: false, costOfLiving: null },
];

describe('CostOfLivingTab', () => {
  it('shows an empty state when no city has cost-of-living data', () => {
    render(<CostOfLivingTab cities={[{ city_id: 1, id: 1, name: 'Lyon', costOfLiving: null }]} countryCurrency="EUR" />);
    expect(screen.getByText('costOfLivingTab.empty.title')).toBeInTheDocument();
  });

  it('lists only cities that have cost-of-living data', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByText('Lyon')).not.toBeInTheDocument();
  });

  it('shows the capital badge', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    expect(screen.getByText('costOfLivingTab.capital')).toBeInTheDocument();
  });

  it('shows the salary category by default with the monthly budget summary', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    expect(screen.getByText('costOfLivingTab.salary.monthlyBudget')).toBeInTheDocument();
  });

  it('switches category to housing and shows rent figures', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    fireEvent.click(screen.getByText('costOfLivingTab.categories.housing'));
    expect(screen.getByText('costOfLivingTab.housing.oneBedCityCenter')).toBeInTheDocument();
  });

  it('collapses and re-expands a city section', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    expect(screen.getByText('costOfLivingTab.salary.monthlyBudget')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Paris'));
    expect(screen.queryByText('costOfLivingTab.salary.monthlyBudget')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Paris'));
    expect(screen.getByText('costOfLivingTab.salary.monthlyBudget')).toBeInTheDocument();
  });

  it('shows the national average-housing summary when provided', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" averageHousing="1200" costCurrency="EUR" />);
    expect(screen.getByText('costOfLivingTab.nationalSummary')).toBeInTheDocument();
  });

  it('does not show the national summary without averageHousing', () => {
    render(<CostOfLivingTab cities={cities} countryCurrency="EUR" />);
    expect(screen.queryByText('costOfLivingTab.nationalSummary')).not.toBeInTheDocument();
  });

  it('shows a food-category empty message when there is no market data', () => {
    const noFood = { ...costOfLiving, categories: { ...costOfLiving.categories, food: { markets: null } } };
    render(<CostOfLivingTab cities={[{ city_id: 1, id: 1, name: 'Paris', costOfLiving: noFood }]} countryCurrency="EUR" />);
    fireEvent.click(screen.getByText('costOfLivingTab.categories.food'));
    expect(screen.getByText('costOfLivingTab.foodNoData')).toBeInTheDocument();
  });
});
