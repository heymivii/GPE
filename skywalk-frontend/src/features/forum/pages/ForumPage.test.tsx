import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForumPage from './ForumPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../hooks/useForum', () => ({
  useForumTopics: vi.fn(),
  useFollowedTopics: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useForumTopics, useFollowedTopics } from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';

const mockedUseTopics = vi.mocked(useForumTopics);
const mockedUseFollowed = vi.mocked(useFollowedTopics);
const mockedUseAuth = vi.mocked(useAuth);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ForumPage />
    </MemoryRouter>,
  );
}

const topic = (overrides: any = {}) => ({
  topic_id: 1,
  title: 'Topic',
  category: 'question',
  created_at: new Date().toISOString(),
  messages: [],
  user: { idUser: 1 },
  country: null,
  ...overrides,
});

describe('ForumPage', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: null } as any);
    mockedUseFollowed.mockReturnValue({ data: [] } as any);
    mockedUseTopics.mockReturnValue({ data: [], isLoading: false, error: null } as any);
  });

  it('shows a loading state', () => {
    mockedUseTopics.mockReturnValue({ data: undefined, isLoading: true, error: null } as any);
    renderPage();
    expect(screen.getByText('forum.loading')).toBeInTheDocument();
  });

  it('shows an error state with the error message', () => {
    mockedUseTopics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('network down'),
    } as any);
    renderPage();
    expect(screen.getByText('forum.error')).toBeInTheDocument();
    expect(screen.getByText('network down')).toBeInTheDocument();
  });

  it('shows an empty state when there are no topics', () => {
    renderPage();
    expect(screen.getByText('forum.noTopics')).toBeInTheDocument();
  });

  it('computes total topics, replies, and distinct category count', () => {
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, category: 'question', messages: [{}, {}] }),
        topic({ topic_id: 2, category: 'advice', messages: [{}] }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    expect(screen.getByText('forum.stats.replies').previousElementSibling).toHaveTextContent('3');
    expect(screen.getByText('forum.stats.categories').previousElementSibling).toHaveTextContent('2');
  });

  it('counts topics created within the last 24h', () => {
    const now = new Date();
    const old = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, created_at: now.toISOString() }),
        topic({ topic_id: 2, created_at: old.toISOString() }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    expect(screen.getByText('forum.stats.last24h').previousElementSibling).toHaveTextContent('1');
  });

  it('filters topics by search text (case-insensitive, title only)', () => {
    mockedUseTopics.mockReturnValue({
      data: [topic({ topic_id: 1, title: 'Visa Advice' }), topic({ topic_id: 2, title: 'Housing tips' })],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('forum.search'), { target: { value: 'visa' } });
    expect(screen.getByText('Visa Advice')).toBeInTheDocument();
    expect(screen.queryByText('Housing tips')).not.toBeInTheDocument();
  });

  it('shows only the current user\'s topics via the "my topics" quick filter', () => {
    mockedUseAuth.mockReturnValue({ user: { idUser: 1 } } as any);
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'Mine', user: { idUser: 1 } }),
        topic({ topic_id: 2, title: 'Not mine', user: { idUser: 2 } }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /forum.stats.myTopics/ }));
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.queryByText('Not mine')).not.toBeInTheDocument();
  });

  it('shows only followed topics via the "followed" quick filter', () => {
    mockedUseAuth.mockReturnValue({ user: { idUser: 1 } } as any);
    mockedUseFollowed.mockReturnValue({ data: [{ topic_id: 2 }] } as any);
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'Not followed' }),
        topic({ topic_id: 2, title: 'Followed' }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /forum.followedTopics/ }));
    expect(screen.getByText('Followed')).toBeInTheDocument();
    expect(screen.queryByText('Not followed')).not.toBeInTheDocument();
  });

  it('filters by country and dedupes the country filter list', () => {
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'FR topic 1', country: { idCountry: 1, countryName: 'France' } }),
        topic({ topic_id: 2, title: 'FR topic 2', country: { idCountry: 1, countryName: 'France' } }),
        topic({ topic_id: 3, title: 'DE topic', country: { idCountry: 2, countryName: 'Allemagne' } }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    // Scope to the country-filter sidebar — topic rows also show a country badge,
    // so "France" appears more than once on the page as a whole.
    const sidebar = within(screen.getByText('forum.filterByCountry').closest('div')!.parentElement!);
    // Deduped: only one "France" filter button despite two France topics.
    expect(sidebar.getAllByText('France')).toHaveLength(1);

    fireEvent.click(sidebar.getByText('France'));
    expect(screen.getByText('FR topic 1')).toBeInTheDocument();
    expect(screen.getByText('FR topic 2')).toBeInTheDocument();
    expect(screen.queryByText('DE topic')).not.toBeInTheDocument();
  });

  it('filters by category and toggles it off on a second click, with a reset button', () => {
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'A question', category: 'question' }),
        topic({ topic_id: 2, title: 'An advice', category: 'advice' }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();

    const categoriesSection = screen.getByText('forum.filterByCategory').closest('div')!.parentElement!;
    fireEvent.click(within(categoriesSection).getByText('forum.categories.question.name'));
    expect(screen.getByText('A question')).toBeInTheDocument();
    expect(screen.queryByText('An advice')).not.toBeInTheDocument();

    // Reset button appears once a category is selected.
    fireEvent.click(within(categoriesSection).getByText('forum.reset'));
    expect(screen.getByText('An advice')).toBeInTheDocument();
  });

  it('navigates to login when an anonymous user clicks "log in for more"', () => {
    mockedUseAuth.mockReturnValue({ user: null } as any);
    renderPage();
    fireEvent.click(screen.getByText('forum.loginForMore'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
  });

  it('resets every filter via the sidebar "reset filters" button', () => {
    mockedUseTopics.mockReturnValue({
      data: [topic({ topic_id: 1, title: 'Visa Advice' })],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('forum.search'), { target: { value: 'zzz' } });
    expect(screen.queryByText('Visa Advice')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('forum.resetFilters'));
    expect(screen.getByText('Visa Advice')).toBeInTheDocument();
  });

  it('shows an alert with the count of topics from the last 24h via the quick filter', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const now = new Date();
    mockedUseTopics.mockReturnValue({
      data: [topic({ topic_id: 1, created_at: now.toISOString() })],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.click(screen.getByText('forum.recent24h'));
    expect(alertSpy).toHaveBeenCalledWith('1 forum.stats.last24h');
    alertSpy.mockRestore();
  });

  it('clears the category via the "all categories" quick filter', () => {
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'A question', category: 'question' }),
        topic({ topic_id: 2, title: 'An advice', category: 'advice' }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();

    const categoriesSection = screen.getByText('forum.filterByCategory').closest('div')!.parentElement!;
    fireEvent.click(within(categoriesSection).getByText('forum.categories.question.name'));
    expect(screen.queryByText('An advice')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('forum.allCategories'));
    expect(screen.getByText('An advice')).toBeInTheDocument();
  });

  it('clears the selected country via its sidebar reset button', () => {
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'FR topic', country: { idCountry: 1, countryName: 'France' } }),
        topic({ topic_id: 2, title: 'DE topic', country: { idCountry: 2, countryName: 'Allemagne' } }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();

    const countrySidebar = within(screen.getByText('forum.filterByCountry').closest('div')!.parentElement!);
    fireEvent.click(countrySidebar.getByText('France'));
    expect(screen.queryByText('DE topic')).not.toBeInTheDocument();

    fireEvent.click(countrySidebar.getByText('forum.reset'));
    expect(screen.getByText('DE topic')).toBeInTheDocument();
  });

  it('shows a formatted date for topics older than a week', () => {
    const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    mockedUseTopics.mockReturnValue({
      data: [topic({ topic_id: 1, title: 'Old topic', created_at: old.toISOString() })],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    expect(screen.getByText(old.toLocaleDateString())).toBeInTheDocument();
  });

  it('resets all filters via the reset button', () => {
    mockedUseAuth.mockReturnValue({ user: { idUser: 1 } } as any);
    mockedUseTopics.mockReturnValue({
      data: [
        topic({ topic_id: 1, title: 'Mine', category: 'question', user: { idUser: 1 } }),
        topic({ topic_id: 2, title: 'Other', category: 'advice', user: { idUser: 2 } }),
      ],
      isLoading: false,
      error: null,
    } as any);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /forum.stats.myTopics/ }));
    expect(screen.queryByText('Other')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^forum\.reset$/ }));
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
