import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobCard from './JobCard';
import type { SearchResult } from '../types';

const NOW = new Date('2026-01-15T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.count != null ? `${key}:${opts.count}` : key),
    i18n: { language: 'fr' },
  }),
}));

function makeJob(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    id: '1',
    title: 'Développeur React',
    description: 'Une belle offre',
    category: 'emploi',
    country: 'France',
    city: 'Paris',
    date: new Date().toISOString(),
    link: 'https://example.com/job/1',
    tags: ['Acme Corp', 'CDI', 'Remote'],
    provider: 'adzuna',
    urgency: 'low',
    ...overrides,
  };
}

describe('JobCard', () => {
  it('renders the job title, company and location in grid mode', () => {
    render(<JobCard job={makeJob()} viewMode="grid" />);
    expect(screen.getByText('Développeur React')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
  });

  it('renders the job title in list mode', () => {
    render(<JobCard job={makeJob()} viewMode="list" />);
    expect(screen.getByText('Développeur React')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
  });

  it('falls back to a placeholder company label when no tag is present', () => {
    render(<JobCard job={makeJob({ tags: [] })} viewMode="grid" />);
    expect(screen.getByText('searchPage.job.company')).toBeInTheDocument();
  });

  it('shows "salary not specified" when there is no price', () => {
    render(<JobCard job={makeJob({ price: undefined })} viewMode="grid" />);
    expect(screen.getByText('searchPage.job.salaryNotSpecified')).toBeInTheDocument();
  });

  it('formats the salary with a currency when both are provided', () => {
    render(<JobCard job={makeJob({ price: 45000, currency: 'EUR', salaryPeriod: 'year' })} viewMode="grid" />);
    expect(screen.getByText(/45.*000/)).toBeInTheDocument();
  });

  it('formats the salary without a currency', () => {
    render(<JobCard job={makeJob({ price: 3000, currency: undefined, salaryPeriod: 'month' })} viewMode="grid" />);
    expect(screen.getByText(/3.*000\+searchPage\.job\.perMonth/)).toBeInTheDocument();
  });

  it('falls back gracefully for an invalid currency code', () => {
    render(<JobCard job={makeJob({ price: 1000, currency: 'NOTACURRENCY' })} viewMode="grid" />);
    expect(screen.getByText(/1.*000 NOTACURRENCY/)).toBeInTheDocument();
  });

  it('shows "today" for a job posted today', () => {
    render(<JobCard job={makeJob({ date: NOW.toISOString() })} viewMode="grid" />);
    expect(screen.getByText('searchPage.job.today')).toBeInTheDocument();
  });

  it('shows a days-ago count for an older job', () => {
    const fiveDaysAgo = new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    render(<JobCard job={makeJob({ date: fiveDaysAgo })} viewMode="grid" />);
    expect(screen.getByText('searchPage.job.daysAgo:5')).toBeInTheDocument();
  });

  it('links out to the job posting', () => {
    render(<JobCard job={makeJob({ link: 'https://example.com/job/42' })} viewMode="grid" />);
    const link = screen.getByText('searchPage.view').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com/job/42');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders up to two extra tags in grid mode', () => {
    render(<JobCard job={makeJob({ tags: ['Acme', 'CDI', 'Remote', 'Extra'] })} viewMode="grid" />);
    expect(screen.getByText('CDI')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
  });
});
