import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsSection from './ResultsSection';
import type { SearchResult } from '../types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr' },
  }),
}));

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    id: '1',
    title: 'Appartement 2 pièces',
    description: 'Beau logement',
    category: 'logement',
    country: 'France',
    city: 'Paris',
    date: '2026-01-01T00:00:00Z',
    link: 'https://example.com/1',
    tags: ['agence', 'meublé'],
    provider: 'SeLoger',
    urgency: 'medium',
    ...overrides,
  };
}

describe('ResultsSection', () => {
  const onLoadMore = vi.fn();

  beforeEach(() => {
    onLoadMore.mockClear();
    localStorage.clear();
  });

  it('shows loading skeletons when loading with no results yet', () => {
    const { container } = render(
      <ResultsSection results={[]} isLoading={true} viewMode="grid" onLoadMore={onLoadMore} />,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBe(6);
  });

  it('renders a ResultCard for a non-Adzuna result', () => {
    render(<ResultsSection results={[makeResult()]} isLoading={false} viewMode="grid" onLoadMore={onLoadMore} />);
    expect(screen.getByText('Appartement 2 pièces')).toBeInTheDocument();
  });

  it('renders a JobCard for an Adzuna emploi result', () => {
    render(
      <ResultsSection
        results={[makeResult({ category: 'emploi', provider: 'Adzuna', title: 'Dev fullstack' })]}
        isLoading={false}
        viewMode="grid"
        onLoadMore={onLoadMore}
      />,
    );
    expect(screen.getByText('Dev fullstack')).toBeInTheDocument();
  });

  it('shows the load-more button by default and calls onLoadMore', () => {
    render(<ResultsSection results={[makeResult()]} isLoading={false} viewMode="grid" onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByText('searchPage.loadMore'));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('hides the load-more button when showLoadMore is false', () => {
    render(
      <ResultsSection results={[makeResult()]} isLoading={false} viewMode="grid" onLoadMore={onLoadMore} showLoadMore={false} />,
    );
    expect(screen.queryByText('searchPage.loadMore')).not.toBeInTheDocument();
  });

  it('disables the load-more button and shows a loading label while loading with existing results', () => {
    render(<ResultsSection results={[makeResult()]} isLoading={true} viewMode="grid" onLoadMore={onLoadMore} />);
    const button = screen.getByText('searchPage.loading').closest('button');
    expect(button).toBeDisabled();
  });

  it('toggles favorite state and persists it to localStorage', () => {
    render(<ResultsSection results={[makeResult()]} isLoading={false} viewMode="list" onLoadMore={onLoadMore} />);
    const favoriteButton = document.querySelector('button.p-2.rounded-full') as HTMLButtonElement;
    fireEvent.click(favoriteButton);
    expect(JSON.parse(localStorage.getItem('skywalk-favorites') || '[]')).toContain('1');
  });

  it('renders nothing extra when there are no results and not loading', () => {
    const { container } = render(
      <ResultsSection results={[]} isLoading={false} viewMode="grid" onLoadMore={onLoadMore} />,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBe(0);
    expect(screen.queryByText('searchPage.loadMore')).not.toBeInTheDocument();
  });
});
