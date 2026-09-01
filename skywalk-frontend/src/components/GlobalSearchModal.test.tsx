import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalSearchModal from './GlobalSearchModal';

// jsdom does not implement scrollIntoView; the modal calls it during keyboard navigation.
Element.prototype.scrollIntoView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts?.query ? `noResults:${opts.query}` : key.split('.').pop() ?? key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const setQuery = vi.fn();
const search = vi.fn();
const clear = vi.fn();
let hookState: any = {
  query: '',
  setQuery,
  results: [],
  isLoading: false,
  error: null,
  search,
  clear,
};
vi.mock('../hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => hookState,
}));

const result = (overrides: any = {}) => ({
  category: 'country',
  entityId: '1',
  title: 'France',
  description: 'Un beau pays',
  extra: '',
  url: null,
  countryName: '',
  imageUrl: null,
  rank: 1,
  ...overrides,
});

describe('GlobalSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState = {
      query: '',
      setQuery,
      results: [],
      isLoading: false,
      error: null,
      search,
      clear,
    };
  });

  it('renders nothing when closed', () => {
    const { container } = render(<GlobalSearchModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows quick links when the query is empty', () => {
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('destinations')).toBeInTheDocument();
    expect(screen.getByText('services')).toBeInTheDocument();
  });

  it('debounces the search call by 250ms after typing', () => {
    vi.useFakeTimers();
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('placeholder'), { target: { value: 'paris' } });

    expect(setQuery).toHaveBeenCalledWith('paris');
    expect(search).not.toHaveBeenCalled();

    vi.advanceTimersByTime(249);
    expect(search).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(search).toHaveBeenCalledWith('paris');
    vi.useRealTimers();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<GlobalSearchModal isOpen onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a no-results message once a search has run empty', () => {
    hookState = { ...hookState, query: 'zzz', results: [] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('noResults:zzz')).toBeInTheDocument();
  });

  it('shows the error message when the search fails', () => {
    hookState = { ...hookState, query: 'paris', error: 'Oops' };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('Oops')).toBeInTheDocument();
  });

  it('groups results by category, in the defined category order', () => {
    hookState = {
      ...hookState,
      query: 'x',
      results: [
        result({ category: 'forum', entityId: 'f1', title: 'Forum post' }),
        result({ category: 'country', entityId: 'c1', title: 'France' }),
      ],
    };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    const headings = screen.getAllByText(/^(country|forum)$/);
    expect(headings.map((h) => h.textContent)).toEqual(['country', 'forum']); // country before forum
  });

  it.each([
    ['guide', 'Suisse', '/destinations/suisse'],
    ['checklist', 'Suisse', '/destinations/suisse'],
    ['resource', 'Suisse', '/destinations/suisse'],
  ])('navigates to the country page for a %s result with a countryName', (category, countryName, expected) => {
    const r = result({ category, entityId: '9', title: 'Something', countryName });
    hookState = { ...hookState, query: 'x', results: [r] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Something'));
    expect(mockNavigate).toHaveBeenCalledWith(expected);
  });

  it('does not navigate for a guide/checklist/resource result without a countryName', () => {
    const r = result({ category: 'guide', entityId: '9', title: 'Something', countryName: '' });
    hookState = { ...hookState, query: 'x', results: [r] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Something'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it.each([
    ['procedure', '/services/demarches'],
    ['blog', '/blog/9'],
    ['faq', '/services'],
  ])('navigates correctly for a %s result', (category, expected) => {
    const r = result({ category, entityId: '9', title: 'Something' });
    hookState = { ...hookState, query: 'x', results: [r] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Something'));
    expect(mockNavigate).toHaveBeenCalledWith(expected);
  });

  it.each([
    ['country', 'France', undefined, '/destinations/france'],
    ['city', undefined, 'Suisse', '/destinations/suisse'],
    ['forum', undefined, undefined, undefined],
    ['service', undefined, undefined, undefined],
  ] as [string, string | undefined, string | undefined, string | undefined][])('navigates correctly when a %s result is clicked', async (category, title, countryName) => {
    const r = result({
      category,
      entityId: '9',
      title: title ?? 'Something',
      countryName: countryName ?? '',
      url: category === 'service' ? '/services/emploi' : null,
    });
    hookState = { ...hookState, query: 'x', results: [r] };
    const onClose = vi.fn();
    render(<GlobalSearchModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText(title ?? 'Something'));

    expect(onClose).toHaveBeenCalled();
    if (category === 'country') expect(mockNavigate).toHaveBeenCalledWith('/destinations/france');
    if (category === 'city') expect(mockNavigate).toHaveBeenCalledWith('/destinations/suisse');
    if (category === 'forum') expect(mockNavigate).toHaveBeenCalledWith('/forum/post/9');
    if (category === 'service') expect(mockNavigate).toHaveBeenCalledWith('/services/emploi');
  });

  it('navigates with keyboard: ArrowDown selects, Enter activates the selected result', () => {
    hookState = {
      ...hookState,
      query: 'x',
      results: [result({ entityId: '1', title: 'First' }), result({ entityId: '2', title: 'Second' })],
    };
    const onClose = vi.fn();
    render(<GlobalSearchModal isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/destinations/first');
  });

  it('highlights the matching substring in the result title', () => {
    hookState = {
      ...hookState,
      query: 'fra',
      results: [result({ title: 'France' })],
    };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    const mark = document.querySelector('mark');
    expect(mark).toHaveTextContent('Fra');
  });

  it('does not crash highlighting an empty description', () => {
    hookState = {
      ...hookState,
      query: 'fra',
      results: [result({ title: 'France', description: '' })],
    };
    expect(() => render(<GlobalSearchModal isOpen onClose={vi.fn()} />)).not.toThrow();
    expect(document.querySelector('mark')).toHaveTextContent('Fra');
  });

  it('navigates with keyboard: ArrowUp moves the selection up', () => {
    hookState = {
      ...hookState,
      query: 'x',
      results: [result({ entityId: '1', title: 'First' }), result({ entityId: '2', title: 'Second' })],
    };
    const onClose = vi.fn();
    render(<GlobalSearchModal isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/destinations/first');
  });

  it('ignores arrow keys when there are no results', () => {
    hookState = { ...hookState, query: '', results: [] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    expect(() => fireEvent.keyDown(window, { key: 'ArrowDown' })).not.toThrow();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clears the query via the clear button', () => {
    hookState = { ...hookState, query: 'paris', results: [] };
    render(<GlobalSearchModal isOpen onClose={vi.fn()} />);
    fireEvent.click(document.querySelector('button > svg.lucide-x')!.closest('button')!);
    expect(setQuery).toHaveBeenCalledWith('');
  });

  it('navigates and closes when a quick link is clicked', () => {
    const onClose = vi.fn();
    render(<GlobalSearchModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('destinations'));
    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });
});
