import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JobOpportunitiesWidget from './JobOpportunitiesWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.split('.').pop() ?? key }),
}));

vi.mock('../../../api/jobOffers', () => ({ searchJobs: vi.fn() }));

import { searchJobs } from '../../../api/jobOffers';
const mockedSearchJobs = vi.mocked(searchJobs);

function renderWidget(props: Partial<React.ComponentProps<typeof JobOpportunitiesWidget>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <JobOpportunitiesWidget {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('JobOpportunitiesWidget', () => {
  beforeEach(() => {
    mockedSearchJobs.mockResolvedValue({ results: [], total: 0, page: 1, perPage: 5, totalPages: 0 });
  });

  it('shows the "offer secured" branch and a checklist link when hasJobOffer is true', () => {
    renderWidget({ hasJobOffer: true, projectId: 9 });
    expect(screen.getByText(/déjà décrochée/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir mes démarches/ })).toHaveAttribute(
      'href',
      '/projects/9/checklist',
    );
  });

  it('omits the checklist link when hasJobOffer is true but no projectId is given', () => {
    renderWidget({ hasJobOffer: true });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the no-data state when the country has no job market info', () => {
    renderWidget({ countryData: { code: 'ZZ', name: 'X' } as any });
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  describe('offer count compaction', () => {
    it.each([
      [500, '500'],
      [2500, '2.5k'],
      [15000, '15k'],
      [2500000, '2.5M'],
    ])('formats %i jobs as %s', async (total, expected) => {
      mockedSearchJobs.mockResolvedValue({ results: [], total, page: 1, perPage: 5, totalPages: 1 });
      renderWidget({ countryData: { code: 'FR', name: 'France', jobMarket: { topSectors: [] } } as any });
      await waitFor(() => expect(screen.getByText(new RegExp(expected))).toBeInTheDocument());
    });
  });

  it('brings the teaching-related sector to the front for a study objective', () => {
    renderWidget({
      countryData: {
        code: 'FR',
        name: 'France',
        jobMarket: { topSectors: ['Finance', 'Enseignement', 'Santé', 'Tech'] },
      } as any,
      userProfile: { mainObjective: 'study' },
    });
    const sectorEls = document.querySelectorAll('.rounded-full.text-sm');
    const sectors = Array.from(sectorEls).map((el) => el.textContent?.trim());
    expect(sectors[0]).toBe('Enseignement');
    expect(sectors).toHaveLength(3); // capped at 3
  });

  it('leaves sector order untouched for a non-study objective', () => {
    renderWidget({
      countryData: {
        code: 'FR',
        name: 'France',
        jobMarket: { topSectors: ['Finance', 'Enseignement', 'Santé'] },
      } as any,
      userProfile: { mainObjective: 'work' },
    });
    const sectorEls = document.querySelectorAll('.rounded-full.text-sm');
    const sectors = Array.from(sectorEls).map((el) => el.textContent?.trim());
    expect(sectors[0]).toBe('Finance');
  });

  it('sorts the top sector salaries in descending order, capped at 3', () => {
    renderWidget({
      countryData: {
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        jobMarket: {
          topSectors: [],
          averageSalary: 2500,
          salaryBySector: { A: 3000, B: 5000, C: 4000, D: 1000 },
        },
      } as any,
    });
    const rows = Array.from(document.querySelectorAll('.space-y-1\\.5 > div')).map(
      (el) => el.textContent,
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain('B');
    expect(rows[1]).toContain('C');
    expect(rows[2]).toContain('A');
  });

  it('renders the immigration programs for a mapped country', () => {
    renderWidget({ countryData: { code: 'JP', name: 'Japan', jobMarket: { topSectors: [] } } as any });
    expect(screen.getByText('JET Programme')).toBeInTheDocument();
    expect(screen.getByText('CCIFJ')).toBeInTheDocument();
  });

  it('shows no programs section for an unmapped country', () => {
    renderWidget({ countryData: { code: 'ZZ', name: 'Nowhere', jobMarket: { topSectors: [] } } as any });
    expect(screen.queryByText('programsTitle')).not.toBeInTheDocument();
  });

  it('renders a "globe"-icon program with the default icon', () => {
    renderWidget({ countryData: { code: 'CA', name: 'Canada', jobMarket: { topSectors: [] } } as any });
    expect(screen.getByText('Express Entry')).toBeInTheDocument();
  });

  it('renders the key job sites, capped at 4', () => {
    renderWidget({
      countryData: {
        code: 'FR',
        name: 'France',
        jobMarket: {
          topSectors: [],
          keyJobSites: [
            { name: 'Site A', url: 'https://a.com' },
            { name: 'Site B', url: 'https://b.com' },
            { name: 'Site C', url: 'https://c.com' },
            { name: 'Site D', url: 'https://d.com' },
            { name: 'Site E', url: 'https://e.com' },
          ],
        },
      } as any,
    });
    expect(screen.getByText('Site A')).toBeInTheDocument();
    expect(screen.getByText('Site D')).toBeInTheDocument();
    expect(screen.queryByText('Site E')).not.toBeInTheDocument();
    expect(screen.getByText('Site A').closest('a')).toHaveAttribute('href', 'https://a.com');
  });

  it('formats a recent job salary as a min–max range with its currency', async () => {
    mockedSearchJobs.mockResolvedValue({
      results: [
        {
          id: '1',
          title: 'Dev',
          description: 'desc',
          company: 'Acme',
          location: { city: 'Paris', country: 'fr', displayName: 'Paris' },
          salary: { min: 40000, max: 55000, currency: 'EUR', period: 'year' },
          contract_type: 'permanent',
          remote: false,
          redirect_url: 'https://x/1',
          created_at: '2026-01-01',
        },
      ],
      total: 1,
      page: 1,
      perPage: 5,
      totalPages: 1,
    });
    renderWidget({ countryData: { code: 'FR', name: 'France', jobMarket: { topSectors: [] } } as any });

    await waitFor(() => expect(screen.getByText('Dev')).toBeInTheDocument());
    expect(screen.getByText('40,000–55,000 EUR')).toBeInTheDocument();
  });
});
