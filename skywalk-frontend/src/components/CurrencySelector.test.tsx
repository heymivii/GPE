import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencySelector from './CurrencySelector';
import { useCurrency } from '../contexts/CurrencyContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../contexts/CurrencyContext', async () => {
  const actual = await vi.importActual<any>('../contexts/CurrencyContext');
  return { ...actual, useCurrency: vi.fn() };
});

const mockedUseCurrency = vi.mocked(useCurrency);
const setDisplayCurrency = vi.fn();

function setup(displayCurrency = 'EUR') {
  mockedUseCurrency.mockReturnValue({ displayCurrency, setDisplayCurrency, displaySymbol: '€' } as any);
}

describe('CurrencySelector', () => {
  it('shows the current currency', () => {
    setup();
    render(<CurrencySelector />);
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('opens the list and selects another currency', () => {
    setup();
    render(<CurrencySelector />);
    fireEvent.click(screen.getByText('EUR'));
    fireEvent.click(screen.getByText('USD'));
    expect(setDisplayCurrency).toHaveBeenCalledWith('USD');
  });

  it('closes when clicking outside', () => {
    setup();
    render(<CurrencySelector />);
    fireEvent.click(screen.getByText('EUR'));
    expect(screen.getByText('USD')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.fixed.inset-0')!);
    expect(screen.queryByText('USD')).not.toBeInTheDocument();
  });
});
