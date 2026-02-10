import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getCurrentLocale } from '../data/supportedCountries';

/* ── Supported display currencies ── */
export const DISPLAY_CURRENCIES = [
  { code: 'EUR', symbol: '€', nameKey: 'currencies.EUR' },
  { code: 'USD', symbol: '$', nameKey: 'currencies.USD' },
  { code: 'GBP', symbol: '£', nameKey: 'currencies.GBP' },
  { code: 'CHF', symbol: 'CHF', nameKey: 'currencies.CHF' },
  { code: 'JPY', symbol: '¥', nameKey: 'currencies.JPY' },
  { code: 'CAD', symbol: 'C$', nameKey: 'currencies.CAD' },
] as const;

export type CurrencyCode = (typeof DISPLAY_CURRENCIES)[number]['code'];

/* ── Context shape ── */
interface CurrencyContextType {
  /** The user's chosen display currency (default: EUR) */
  displayCurrency: CurrencyCode;
  /** Change the display currency */
  setDisplayCurrency: (code: CurrencyCode) => void;
  /** Symbol for the current display currency */
  displaySymbol: string;
  /**
   * Convert an amount from a source currency to the user's display currency.
   * `exchangeRates` is the map returned by the Cost of Living API
   * (keys = target currency codes, values = conversion factor FROM source).
   *
   * Example: source is JPY, exchangeRates = { EUR: 0.006, USD: 0.007 }
   *   convert(100000, 'JPY', { EUR: 0.006, USD: 0.007 }) → 600 (if display = EUR)
   *
   * Returns null if conversion is impossible.
   */
  convert: (
    amount: number | undefined | null,
    sourceCurrency: string,
    exchangeRates: Record<string, number> | undefined | null,
  ) => number | null;
  /**
   * Format a converted price with symbol, e.g. "1 234 €"
   */
  formatPrice: (
    amount: number | undefined | null,
    sourceCurrency: string,
    exchangeRates: Record<string, number> | undefined | null,
    decimals?: number,
  ) => string;
  /**
   * Returns true when source currency already matches display currency
   */
  isSameCurrency: (sourceCurrency: string) => boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'skywalk_display_currency';

function getInitialCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DISPLAY_CURRENCIES.some((c) => c.code === stored)) {
      return stored as CurrencyCode;
    }
  } catch {
    // localStorage unavailable
  }
  return 'EUR';
}

function getSymbol(code: CurrencyCode): string {
  return DISPLAY_CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>(getInitialCurrency);

  const setDisplayCurrency = useCallback((code: CurrencyCode) => {
    setDisplayCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // silent
    }
  }, []);

  const displaySymbol = getSymbol(displayCurrency);

  const isSameCurrency = useCallback(
    (sourceCurrency: string) => sourceCurrency === displayCurrency,
    [displayCurrency],
  );

  const convert = useCallback(
    (
      amount: number | undefined | null,
      sourceCurrency: string,
      exchangeRates: Record<string, number> | undefined | null,
    ): number | null => {
      if (amount == null || amount === 0) return null;

      // Same currency — no conversion needed
      if (sourceCurrency === displayCurrency) return amount;

      if (!exchangeRates) return null;

      // The exchange_rates from the API are ALL relative to USD:
      //   rates['EUR'] = 0.846  means 1 USD = 0.846 EUR
      //   rates['JPY'] = 157.2  means 1 USD = 157.2 JPY
      //
      // To convert: source → USD → display
      //   amountInUSD = amount / rates[sourceCurrency]
      //   result      = amountInUSD * rates[displayCurrency]

      const sourceRate = exchangeRates[sourceCurrency];
      const targetRate = exchangeRates[displayCurrency];

      if (!sourceRate || sourceRate <= 0 || !targetRate || targetRate <= 0) return null;

      const amountInUSD = amount / sourceRate;
      const converted = amountInUSD * targetRate;

      return Math.round(converted * 100) / 100;
    },
    [displayCurrency],
  );

  const formatPrice = useCallback(
    (
      amount: number | undefined | null,
      sourceCurrency: string,
      exchangeRates: Record<string, number> | undefined | null,
      decimals = 0,
    ): string => {
      const converted = convert(amount, sourceCurrency, exchangeRates);
      if (converted == null) return '—';
      const formatted = converted.toLocaleString(getCurrentLocale(), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${formatted} ${displaySymbol}`;
    },
    [convert, displaySymbol],
  );

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        displaySymbol,
        convert,
        formatPrice,
        isSameCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
