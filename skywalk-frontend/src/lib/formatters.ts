import { getCurrentLocale } from '../data/supportedCountries';

export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  locale?: string,
): string {
  if (value == null) return '—';
  return value.toLocaleString(locale ?? getCurrentLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(
  value: number | null | undefined,
  locale?: string,
): string {
  if (value == null) return '—';
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k`;
  }
  return value.toLocaleString(locale ?? getCurrentLocale());
}
