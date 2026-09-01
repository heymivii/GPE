import {
  allowedActionKeys,
  isAllowedKey,
  defaultLabel,
  hashContent,
  otherKey,
  clampActionKey,
  OTHER_KEY,
} from './action-keys';

describe('action-keys', () => {
  describe('allowedActionKeys', () => {
    it('returns the base keys for a category with no country extension', () => {
      const keys = allowedActionKeys('de', 'visa');
      expect(keys.map((k) => k.key)).toEqual([
        'determine_need',
        'gather_docs',
        'complete_form',
        'submit',
      ]);
    });

    it('appends the country extension keys after the base keys', () => {
      const keys = allowedActionKeys('fr', 'demarches');
      expect(keys.map((k) => k.key)).toEqual([
        'prepare_request',
        'gather_docs',
        'book_appointment',
        'submit',
        'fr.demarches.validate_vls_ts',
      ]);
    });

    it('is case-insensitive on the country code', () => {
      const lower = allowedActionKeys('fr', 'sante');
      const upper = allowedActionKeys('FR', 'sante');
      expect(upper).toEqual(lower);
      expect(lower.map((k) => k.key)).toContain('fr.sante.puma');
    });

    it('returns an empty array for an unknown category', () => {
      expect(allowedActionKeys('fr', 'unknown-category')).toEqual([]);
    });
  });

  describe('isAllowedKey', () => {
    it('accepts a valid base key', () => {
      expect(isAllowedKey('de', 'visa', 'gather_docs')).toBe(true);
    });

    it('accepts a valid country-extension key', () => {
      expect(isAllowedKey('fr', 'sante', 'fr.sante.puma')).toBe(true);
    });

    it('rejects a key that belongs to a different category', () => {
      expect(isAllowedKey('fr', 'visa', 'fr.sante.puma')).toBe(false);
    });

    it('rejects a key that belongs to a different country', () => {
      expect(isAllowedKey('us', 'sante', 'fr.sante.puma')).toBe(false);
    });

    it('rejects an unknown key', () => {
      expect(isAllowedKey('fr', 'visa', 'made_up_key')).toBe(false);
    });
  });

  describe('defaultLabel', () => {
    it('returns the French label for a valid key', () => {
      expect(defaultLabel('de', 'visa', 'gather_docs')).toBe(
        'Rassembler les documents requis',
      );
    });

    it('returns undefined for an unknown key', () => {
      expect(defaultLabel('de', 'visa', 'made_up_key')).toBeUndefined();
    });
  });

  describe('hashContent', () => {
    it('is deterministic for the same input', () => {
      expect(hashContent('some checklist text')).toBe(
        hashContent('some checklist text'),
      );
    });

    it('differs for different inputs', () => {
      expect(hashContent('text A')).not.toBe(hashContent('text B'));
    });

    it('returns a short base36 string', () => {
      const hash = hashContent('some checklist text');
      expect(hash.length).toBeLessThanOrEqual(8);
      expect(hash).toMatch(/^[0-9a-z]+$/);
    });
  });

  describe('otherKey', () => {
    it('namespaces the hash under the OTHER_KEY prefix', () => {
      const key = otherKey('unrecognized action text');
      expect(key).toBe(
        `${OTHER_KEY}:${hashContent('unrecognized action text')}`,
      );
    });
  });

  describe('clampActionKey', () => {
    it('keeps a proposed key that is allowed for the (country, category)', () => {
      const result = clampActionKey(
        'de',
        'visa',
        'gather_docs',
        'ignored text',
      );
      expect(result).toBe('gather_docs');
    });

    it('falls back to an other:<hash> key when the proposed key is not allowed', () => {
      const result = clampActionKey('de', 'visa', 'made_up_key', 'some text');
      expect(result).toBe(otherKey('some text'));
    });

    it('falls back to an other:<hash> key when no key was proposed', () => {
      const result = clampActionKey('de', 'visa', undefined, 'some text');
      expect(result).toBe(otherKey('some text'));
    });
  });
});
