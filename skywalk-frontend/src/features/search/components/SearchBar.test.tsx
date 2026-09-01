import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

const t = (key: string) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t }),
}));

describe('SearchBar', () => {
  const onSearch = vi.fn();

  beforeEach(() => {
    onSearch.mockClear();
    localStorage.clear();
  });

  it('renders the initial query in the input', () => {
    render(<SearchBar initialQuery="Paris" onSearch={onSearch} />);
    expect(screen.getByRole('textbox')).toHaveValue('Paris');
  });

  it('submits the trimmed query and saves it to recent searches', () => {
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  Lyon  ' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(onSearch).toHaveBeenCalledWith('Lyon');
    expect(JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')).toContain('  Lyon  ');
  });

  it('does not submit an empty/whitespace-only query', () => {
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows the clear button once there is text, and clears it on click', () => {
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button'));
    expect(input.value).toBe('');
  });

  it('shows recent and popular searches on focus when the query is empty', () => {
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('searchPage.recentSearches')).toBeInTheDocument();
    expect(screen.getByText('searchPage.popularSearchesList')).toBeInTheDocument();
  });

  it('filters suggestions once the query is longer than 2 characters', () => {
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'searchPage.popularSearchItems.itJobs' } });
    expect(screen.getByText('searchPage.suggestions')).toBeInTheDocument();
  });

  it('picks a suggestion, triggers the search and closes the panel', () => {
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    const suggestion = screen.getAllByText('searchPage.recentSearchItems.devToronto')[0];
    fireEvent.click(suggestion);
    expect(onSearch).toHaveBeenCalledWith('searchPage.recentSearchItems.devToronto');
  });
});
