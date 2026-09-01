import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import WeatherWidget from './WeatherWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr' },
  }),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);

describe('WeatherWidget', () => {
  it('shows a loading state', () => {
    mockedUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false } as any);
    const { container } = render(<WeatherWidget countryName="France" />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an error state', () => {
    mockedUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true } as any);
    render(<WeatherWidget countryName="France" />);
    expect(screen.getByText('dashboard.personalized.widgets.weather.error.title')).toBeInTheDocument();
  });

  it('renders the weather data', () => {
    mockedUseQuery.mockReturnValue({
      data: { temperature: 18, description: 'ciel dégagé', humidity: 60, windSpeed: 12, icon: '01d', feelsLike: 17 },
      isLoading: false,
      isError: false,
    } as any);
    render(<WeatherWidget countryName="France" cityName="Paris" />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('ciel dégagé')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('12 km/h')).toBeInTheDocument();
  });

  it('falls back to the country name when no city is given', () => {
    mockedUseQuery.mockReturnValue({
      data: { temperature: 20, description: 'clair', humidity: 50, windSpeed: 5, icon: '01d', feelsLike: 19 },
      isLoading: false,
      isError: false,
    } as any);
    render(<WeatherWidget countryName="France" />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});
