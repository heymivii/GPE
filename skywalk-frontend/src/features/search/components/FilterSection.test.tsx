import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSection from './FilterSection';
import type { SearchFilters } from '../types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { code: 'FR', name: 'France', i18nKey: 'countries.france', flag: '🇫🇷' },
      { code: 'US', name: 'États-Unis', i18nKey: 'countries.unitedStates', flag: '🇺🇸' },
    ],
    citiesByCountry: { France: ['Paris', 'Lyon'] },
  }),
}));

function makeFilters(overrides: Partial<SearchFilters> = {}): SearchFilters {
  return {
    query: '',
    category: '',
    country: '',
    city: '',
    priceRange: [0, 10000],
    dateRange: ['', ''],
    sortBy: 'relevance',
    sortOrder: 'asc',
    contractType: [],
    ...overrides,
  };
}

describe('FilterSection', () => {
  const onFiltersChange = vi.fn();

  beforeEach(() => {
    onFiltersChange.mockClear();
  });

  it('does not show the "clear all" button when no filter is active', () => {
    render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    expect(screen.queryByText('searchPage.filter.clearAll')).not.toBeInTheDocument();
  });

  it('shows the active filter count and a "clear all" button once a filter is set', () => {
    render(<FilterSection filters={makeFilters({ country: 'France' })} onFiltersChange={onFiltersChange} />);
    expect(screen.getByText('(1)')).toBeInTheDocument();
    expect(screen.getByText('searchPage.filter.clearAll')).toBeInTheDocument();
  });

  // La recherche ne couvre plus que l'emploi : le filtre catégorie a été retiré
  // et « tout effacer » garde category='emploi' (une catégorie vide vidait la liste).
  it('resets every filter when "clear all" is clicked, keeping the job category', () => {
    render(<FilterSection filters={makeFilters({ country: 'France' })} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText('searchPage.filter.clearAll'));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'emploi', country: '', city: '', contractType: [] }),
    );
  });

  it('does not render the removed category filter', () => {
    render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    expect(screen.queryByText('searchPage.filter.category')).not.toBeInTheDocument();
    expect(screen.queryByText('searchPage.filter.categories.emploi')).not.toBeInTheDocument();
    expect(screen.queryByText('searchPage.filter.categories.logement')).not.toBeInTheDocument();
  });

  it('selects and deselects a country', () => {
    const { rerender } = render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText('countries.france'));
    expect(onFiltersChange).toHaveBeenCalledWith({ country: 'France' });

    rerender(<FilterSection filters={makeFilters({ country: 'France' })} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText('countries.france'));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ country: '' });
  });

  it('toggles a contract type', () => {
    render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText('searchPage.filter.contracts.permanent'));
    expect(onFiltersChange).toHaveBeenCalledWith({ contractType: ['permanent'] });
  });

  it('expands the price range panel and updates the minimum', () => {
    render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText('searchPage.filter.allPrices'));
    fireEvent.change(screen.getByPlaceholderText('Min'), { target: { value: '500' } });
    expect(onFiltersChange).toHaveBeenCalledWith({ priceRange: [500, 10000] });
  });

  it('shows a formatted price range instead of the placeholder once set', () => {
    render(<FilterSection filters={makeFilters({ priceRange: [200, 800] })} onFiltersChange={onFiltersChange} />);
    expect(screen.getByText('200€ - 800€')).toBeInTheDocument();
  });

  it('shows the city chips only once a country with cities is selected', () => {
    const { rerender } = render(<FilterSection filters={makeFilters()} onFiltersChange={onFiltersChange} />);
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();

    rerender(<FilterSection filters={makeFilters({ country: 'France' })} onFiltersChange={onFiltersChange} />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Paris'));
    expect(onFiltersChange).toHaveBeenCalledWith({ city: 'Paris' });
  });
});
