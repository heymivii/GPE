import { describe, it, expect } from 'vitest';
import {
  isValidPersonName,
  normalizePersonName,
  PERSON_NAME_MAX_LENGTH,
} from './personName';

describe('isValidPersonName', () => {
  it.each([
    ['<script>alert(1)</script>', 'balise HTML'],
    ['Jean123', 'chiffres'],
    ['@@@', 'symboles'],
    ['Jean_Pierre', 'underscore'],
    ['😀', 'emoji'],
    ['-Paul', 'commence par un tiret'],
    ['A', 'trop court'],
    ['   ', 'espaces uniquement'],
    ['a'.repeat(PERSON_NAME_MAX_LENGTH + 1), 'trop long'],
  ])('refuse « %s » (%s)', (value) => {
    expect(isValidPersonName(value)).toBe(false);
  });

  it.each(['Jean-Pierre', "O'Brien", 'Anne Marie', 'José', 'Müller', 'Nguyễn', 'Tené'])(
    'accepte « %s »',
    (value) => {
      expect(isValidPersonName(value)).toBe(true);
    },
  );

  it('valide sur la valeur normalisée, pas sur la saisie brute', () => {
    expect(isValidPersonName('  Jean Pierre  ')).toBe(true);
  });
});

describe('normalizePersonName', () => {
  it('retire les espaces de bord et réduit les espaces internes', () => {
    expect(normalizePersonName('  Jean   Pierre  ')).toBe('Jean Pierre');
  });
});
