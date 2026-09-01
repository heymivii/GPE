import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

let mockRates: Record<string, number> | undefined = { EUR: 0.86, USD: 1, GBP: 0.75 };
vi.mock('../hooks/useExchangeRates', () => ({
  useExchangeRates: () => ({ rates: mockRates, isLoading: false, error: null }),
}));

vi.mock('../data/supportedCountries', () => ({
  getCurrentLocale: () => 'fr-FR',
}));

import { CurrencyProvider, useCurrency } from './CurrencyContext';

function wrapper({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockRates = { EUR: 0.86, USD: 1, GBP: 0.75 };
  });

  it('defaults to EUR when nothing is stored', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.displayCurrency).toBe('EUR');
    expect(result.current.displaySymbol).toBe('€');
  });

  it('restores a previously stored currency', () => {
    localStorage.setItem('skywalk_display_currency', 'GBP');
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.displayCurrency).toBe('GBP');
  });

  it('ignores an invalid stored currency and falls back to EUR', () => {
    localStorage.setItem('skywalk_display_currency', 'XXX');
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.displayCurrency).toBe('EUR');
  });

  it('persists a new currency selection to localStorage', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('USD'));
    expect(result.current.displayCurrency).toBe('USD');
    expect(localStorage.getItem('skywalk_display_currency')).toBe('USD');
  });

  it('convert() returns the amount unchanged when already in the display currency', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.convert(100, 'EUR')).toBe(100);
  });

  it('convert() pivots through USD using the context exchange rates', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('GBP'));
    // 100 EUR -> USD: 100 / 0.86 = 116.28 -> GBP: * 0.75 = 87.21
    expect(result.current.convert(100, 'EUR')).toBeCloseTo(87.21, 1);
  });

  it('convert() prefers explicit exchangeRates over the context rates', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('GBP'));
    const explicitRates = { EUR: 1, GBP: 1 }; // 1:1, so 100 EUR -> 100 GBP
    expect(result.current.convert(100, 'EUR', explicitRates)).toBe(100);
  });

  it('convert() returns null when the amount is null/undefined', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.convert(null, 'EUR')).toBeNull();
    expect(result.current.convert(undefined, 'EUR')).toBeNull();
  });

  it('convert() returns null when no rates are available at all', () => {
    mockRates = undefined;
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('GBP'));
    expect(result.current.convert(100, 'EUR')).toBeNull();
  });

  it('convert() returns null when the source currency is not in the rate table', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('GBP'));
    expect(result.current.convert(100, 'ZZZ')).toBeNull();
  });

  it('isSameCurrency() compares against the current display currency', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.isSameCurrency('EUR')).toBe(true);
    expect(result.current.isSameCurrency('USD')).toBe(false);
  });

  it('formatPrice() renders the localized amount with the display symbol', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.formatPrice(1000, 'EUR', undefined, 0)).toContain('€');
  });

  it('formatPrice() renders an em dash when conversion is impossible', () => {
    mockRates = undefined;
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setDisplayCurrency('GBP'));
    expect(result.current.formatPrice(100, 'EUR')).toBe('—');
  });

  it('throws when useCurrency is used outside of the provider', () => {
    const { result } = renderHook(() => {
      try {
        return useCurrency();
      } catch (e) {
        return e;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
  });
});
