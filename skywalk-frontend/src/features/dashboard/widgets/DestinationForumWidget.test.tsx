import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DestinationForumWidget from './DestinationForumWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: any) =>
      opts?.defaultValue?.replace('{{country}}', opts.country) ?? _key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../../api/forum-topics', () => ({
  forumTopicsApi: { findAll: vi.fn() },
}));

import { forumTopicsApi } from '../../../api/forum-topics';
const mockedFindAll = vi.mocked(forumTopicsApi.findAll);

function renderWidget(props: Partial<React.ComponentProps<typeof DestinationForumWidget>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DestinationForumWidget {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const topic = (overrides: any = {}) => ({
  topic_id: 1,
  title: 'Topic',
  created_at: '2026-01-01T00:00:00Z',
  country: { idCountry: 1 },
  views_count: 0,
  ...overrides,
});

describe('DestinationForumWidget', () => {
  beforeEach(() => {
    mockedFindAll.mockResolvedValue([]);
  });

  it('shows a loading spinner while fetching', () => {
    mockedFindAll.mockReturnValue(new Promise(() => {}));
    const { container } = renderWidget({ countryId: 1 });
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an empty state with the country name interpolated, once loaded', async () => {
    renderWidget({ countryId: 1, countryName: 'France' });
    await waitFor(() =>
      expect(
        screen.getByText('Aucune discussion pour France pour le moment.'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: /Lancer une discussion/ })).toHaveAttribute(
      'href',
      '/forum/new',
    );
  });

  it('shows nothing (empty) when no countryId is given, even if topics exist', async () => {
    mockedFindAll.mockResolvedValue([topic()]);
    renderWidget({ countryName: 'France' });
    await waitFor(() => expect(screen.getByText(/Aucune discussion/)).toBeInTheDocument());
  });

  it('filters topics by countryId and sorts them newest first', async () => {
    mockedFindAll.mockResolvedValue([
      topic({ topic_id: 1, title: 'Old', created_at: '2026-01-01T00:00:00Z' }),
      topic({ topic_id: 2, title: 'New', created_at: '2026-02-01T00:00:00Z' }),
      topic({ topic_id: 3, title: 'Other country', country: { idCountry: 2 } }),
    ]);
    renderWidget({ countryId: 1, countryName: 'France' });

    await waitFor(() => expect(screen.getByText('New')).toBeInTheDocument());
    const titles = screen.getAllByText(/Old|New/).map((el) => el.textContent);
    expect(titles).toEqual(['New', 'Old']);
    expect(screen.queryByText('Other country')).not.toBeInTheDocument();
  });

  it('caps the displayed topics at 4', async () => {
    mockedFindAll.mockResolvedValue(
      Array.from({ length: 6 }, (_, i) =>
        topic({ topic_id: i, title: `Topic ${i}`, created_at: `2026-01-0${i + 1}T00:00:00Z` }),
      ),
    );
    renderWidget({ countryId: 1, countryName: 'France' });

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(4));
  });

  it('shows the view count only when present', async () => {
    mockedFindAll.mockResolvedValue([topic({ views_count: 12 })]);
    renderWidget({ countryId: 1, countryName: 'France' });
    await waitFor(() => expect(screen.getByText(/12 vues/)).toBeInTheDocument());
  });

  it('links each topic to its forum post page', async () => {
    mockedFindAll.mockResolvedValue([topic({ topic_id: 42 })]);
    renderWidget({ countryId: 1, countryName: 'France' });
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /Topic/ })).toHaveAttribute(
        'href',
        '/forum/post/42',
      ),
    );
  });
});
