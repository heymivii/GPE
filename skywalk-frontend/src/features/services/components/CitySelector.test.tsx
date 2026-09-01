import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CitySelector from './CitySelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

const cities = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
] as any;

describe('CitySelector', () => {
  const onCityChange = vi.fn();

  beforeEach(() => {
    onCityChange.mockClear();
  });

  it('renders nothing when there are 0 or 1 available cities', () => {
    const { container: c0 } = render(
      <CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={[]} />,
    );
    expect(c0.firstChild).toBeNull();

    const { container: c1 } = render(
      <CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={[cities[0]]} />,
    );
    expect(c1.firstChild).toBeNull();
  });

  it('shows the placeholder when no city is selected', () => {
    render(<CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={cities} />);
    expect(screen.getByText('Sélectionner')).toBeInTheDocument();
  });

  it('shows the selected city name', () => {
    render(<CitySelector selectedCity="paris" onCityChange={onCityChange} availableCities={cities} />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('opens the dropdown and lists every available city on click', () => {
    render(<CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={cities} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Lyon')).toBeInTheDocument();
  });

  it('calls onCityChange and closes the dropdown when a city is picked', () => {
    render(<CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={cities} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Lyon'));
    expect(onCityChange).toHaveBeenCalledWith('lyon');
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
  });

  it('closes the dropdown when the backdrop is clicked', () => {
    render(<CitySelector selectedCity={null} onCityChange={onCityChange} availableCities={cities} />);
    fireEvent.click(screen.getByRole('button'));
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(screen.queryByText('Lyon')).not.toBeInTheDocument();
  });
});
