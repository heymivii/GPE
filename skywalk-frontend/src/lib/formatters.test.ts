import { describe, it, expect } from 'vitest';
import { formatNumber, formatCompact } from './formatters';

describe('formatNumber', () => {
  it('returns — for null', () => {
    expect(formatNumber(null)).toBe('—');
  });
  it('returns — for undefined', () => {
    expect(formatNumber(undefined)).toBe('—');
  });
  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
  it('formats with decimals', () => {
    // Just verify it returns a string with the value
    const result = formatNumber(1234.5, 1, 'en-US');
    expect(result).toBe('1,234.5');
  });
  it('formats integer with en-US locale', () => {
    expect(formatNumber(1000, 0, 'en-US')).toBe('1,000');
  });
});

describe('formatCompact', () => {
  it('returns — for null', () => {
    expect(formatCompact(null)).toBe('—');
  });
  it('formats millions', () => {
    expect(formatCompact(1_200_000)).toBe('1.2M');
  });
  it('formats exact millions', () => {
    expect(formatCompact(2_000_000)).toBe('2M');
  });
  it('formats thousands >= 10k', () => {
    expect(formatCompact(15_000)).toBe('15k');
  });
  it('formats thousands < 10k', () => {
    expect(formatCompact(8_500)).toBe('8.5k');
  });
  it('formats small numbers', () => {
    expect(formatCompact(500)).toBe('500');
  });
});
