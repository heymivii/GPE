import { describe, it, expect } from 'vitest';
import { EU_EEA_CH, NATIONALITY_OPTIONS, isVisaExempt } from './freeMovement';

describe('EU_EEA_CH', () => {
  it('contains France, Switzerland and Norway', () => {
    expect(EU_EEA_CH.has('FR')).toBe(true);
    expect(EU_EEA_CH.has('CH')).toBe(true);
    expect(EU_EEA_CH.has('NO')).toBe(true);
  });

  it('does not contain non-EU/EEA/CH countries', () => {
    expect(EU_EEA_CH.has('US')).toBe(false);
    expect(EU_EEA_CH.has('GB')).toBe(false);
  });
});

describe('NATIONALITY_OPTIONS', () => {
  it('includes an OTHER fallback option', () => {
    expect(NATIONALITY_OPTIONS.some((o) => o.value === 'OTHER')).toBe(true);
  });

  it('every option has a value and a label', () => {
    for (const opt of NATIONALITY_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
    }
  });
});

describe('isVisaExempt', () => {
  it('is exempt when both nationality and destination are EU/EEA/CH', () => {
    expect(isVisaExempt('FR', 'DE')).toBe(true);
    expect(isVisaExempt('CH', 'FR')).toBe(true);
  });

  it('is not exempt when the nationality is outside EU/EEA/CH', () => {
    expect(isVisaExempt('US', 'FR')).toBe(false);
  });

  it('is not exempt when the destination is outside EU/EEA/CH', () => {
    expect(isVisaExempt('FR', 'US')).toBe(false);
  });

  it('is not exempt for OTHER nationality', () => {
    expect(isVisaExempt('OTHER', 'FR')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isVisaExempt('fr', 'de')).toBe(true);
  });

  it('is not exempt when nationality is missing', () => {
    expect(isVisaExempt(null, 'FR')).toBe(false);
    expect(isVisaExempt(undefined, 'FR')).toBe(false);
  });

  it('is not exempt when destination is missing', () => {
    expect(isVisaExempt('FR', null)).toBe(false);
    expect(isVisaExempt('FR', undefined)).toBe(false);
  });
});
