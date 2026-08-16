import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getCurrentLocale } from '../data/supportedCountries';
import { useExchangeRates } from '../hooks/useExchangeRates';

export const DISPLAY_CURRENCIES = [
  { code: 'EUR', symbol: '€', nameKey: 'currencies.EUR' },
  { code: 'USD', symbol: '$', nameKey: 'currencies.USD' },
  { code: 'GBP', symbol: '£', nameKey: 'currencies.GBP' },
  { code: 'CHF', symbol: 'CHF', nameKey: 'currencies.CHF' },
  { code: 'JPY', symbol: '¥', nameKey: 'currencies.JPY' },
  { code: 'CAD', symbol: 'C$', nameKey: 'currencies.CAD' },
] as const;

export type CurrencyCode = (typeof DISPLAY_CURRENCIES)[number]['code'];

interface CurrencyContextType {
  displayCurrency: CurrencyCode;
  setDisplayCurrency: (code: CurrencyCode) => void;
  displaySymbol: string;
  convert: (
    amount: number | undefined | null,
    sourceCurrency: string,
    exchangeRates?: Record<string, number> | null,
  ) => number | null;
  formatPrice: (
    amount: number | undefined | null,
    sourceCurrency: string,
    exchangeRates?: Record<string, number> | null,
    decimals?: number,
  ) => string;
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
  }
  return 'EUR';
}

function getSymbol(code: CurrencyCode): string {
  return DISPLAY_CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>(getInitialCurrency);
  const { rates: contextRates } = useExchangeRates();

  const setDisplayCurrency = useCallback((code: CurrencyCode) => {
    setDisplayCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
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
      exchangeRates?: Record<string, number> | null,
    ): number | null => {
      if (amount == null) return null;

      if (sourceCurrency === displayCurrency) return amount;

      const effectiveRates =
        exchangeRates && Object.keys(exchangeRates).length > 0
          ? exchangeRates
          : contextRates ?? null;

      if (!effectiveRates) return null;

      const sourceRate = effectiveRates[sourceCurrency];
      const targetRate = effectiveRates[displayCurrency];

      if (!sourceRate || sourceRate <= 0 || !targetRate || targetRate <= 0) return null;

      const amountInUSD = amount / sourceRate;
      const converted = amountInUSD * targetRate;

      return Math.round(converted * 100) / 100;
    },
    [displayCurrency, contextRates],
  );

  const formatPrice = useCallback(
    (
      amount: number | undefined | null,
      sourceCurrency: string,
      exchangeRates?: Record<string, number> | null,
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
