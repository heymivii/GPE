import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import Dropdown from './Dropdown';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

const mockedUseQuery = vi.mocked(useQuery);

describe('Dropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseQuery.mockReturnValue({
      data: [
        { idCountry: 1, countryName: 'France' },
        { idCountry: 2, countryName: 'Japon' },
      ],
    } as any);
  });

  it('shows the default origin and the destination placeholder', () => {
    render(<Dropdown />);
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getAllByText('common.select').length).toBeGreaterThan(0);
  });

  it('opens the destination dropdown and selects a country', () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText('landing.search.destination').closest('div[class*="cursor-pointer"]')!);
    fireEvent.click(screen.getByText('Japon'));
    expect(screen.getAllByText('Japon').length).toBeGreaterThan(0);
  });

  it('does not select a disabled category option', () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText('landing.search.category').closest('div[class*="cursor-pointer"]')!);
    fireEvent.click(screen.getByText('landing.search.options.housing'));
    // still shows the default "job" category, not housing (dropdown stays open on a disabled pick)
    expect(screen.getAllByText('landing.search.options.job').length).toBeGreaterThan(0);
  });

  it('selects a position and searches with all params', () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText('landing.search.destination').closest('div[class*="cursor-pointer"]')!);
    fireEvent.click(screen.getByText('Japon'));
    fireEvent.click(screen.getByText('landing.search.position').closest('div[class*="cursor-pointer"]')!);
    fireEvent.click(screen.getByText('landing.search.positions.developer'));
    fireEvent.click(screen.getByText('landing.search.button'));
    expect(navigate).toHaveBeenCalledWith('/search?country=Japon&category=emploi&query=developer');
  });

  it('searches with only the default params when nothing else is selected', () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText('landing.search.button'));
    expect(navigate).toHaveBeenCalledWith('/search?category=emploi');
  });
});
