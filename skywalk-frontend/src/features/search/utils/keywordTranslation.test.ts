import { describe, it, expect } from 'vitest';
import {
  enhanceSearchKeyword,
  isFrenchKeyword,
  getEnglishTranslation,
} from './keywordTranslation';

describe('enhanceSearchKeyword', () => {
  it('returns empty values for a blank keyword', () => {
    expect(enhanceSearchKeyword('')).toEqual({ keyword: '', remainingWords: '' });
    expect(enhanceSearchKeyword('   ')).toEqual({ keyword: '', remainingWords: '' });
  });

  it('translates an exact French job term to English (fr locale)', () => {
    expect(enhanceSearchKeyword('développeur', undefined, 'fr')).toEqual({
      keyword: 'developer',
      remainingWords: '',
    });
  });

  it('is case-insensitive on the exact match', () => {
    expect(enhanceSearchKeyword('DÉVELOPPEUR', undefined, 'fr')).toEqual({
      keyword: 'developer',
      remainingWords: '',
    });
  });

  it('picks the longest matching French term and returns the leftover words', () => {
    const result = enhanceSearchKeyword('développeur senior', undefined, 'fr');
    expect(result.keyword).toBe('developer');
    expect(result.remainingWords).toBe('senior');
  });

  it('returns the keyword unchanged when nothing matches in fr locale', () => {
    expect(enhanceSearchKeyword('xyz123', undefined, 'fr')).toEqual({
      keyword: 'xyz123',
      remainingWords: '',
    });
  });

  it('translates an exact English job term back through the French key (en locale)', () => {
    expect(enhanceSearchKeyword('developer', undefined, 'en')).toEqual({
      keyword: 'developer',
      remainingWords: '',
    });
  });

  it('picks the longest matching English term and returns the leftover words (en locale)', () => {
    const result = enhanceSearchKeyword('developer senior', undefined, 'en');
    expect(result.keyword).toBe('developer');
    expect(result.remainingWords).toBe('senior');
  });

  it('returns the keyword unchanged when nothing matches in en locale', () => {
    expect(enhanceSearchKeyword('xyz123', undefined, 'en')).toEqual({
      keyword: 'xyz123',
      remainingWords: '',
    });
  });
});

describe('isFrenchKeyword', () => {
  it('returns false for an empty string', () => {
    expect(isFrenchKeyword('')).toBe(false);
  });

  it('returns true when the string contains a known French job term', () => {
    expect(isFrenchKeyword('recherche développeur junior')).toBe(true);
  });

  it('returns false when nothing matches', () => {
    expect(isFrenchKeyword('xyz123')).toBe(false);
  });
});

describe('getEnglishTranslation', () => {
  it('returns the English translation for a known French term', () => {
    expect(getEnglishTranslation('développeur')).toBe('developer');
  });

  it('is case-insensitive', () => {
    expect(getEnglishTranslation('DÉVELOPPEUR')).toBe('developer');
  });

  it('returns undefined for an unknown term', () => {
    expect(getEnglishTranslation('xyz123')).toBeUndefined();
  });
});
