import { describe, it, expect } from 'vitest';
import { getCityId } from './cityId';
import type { CityDestination } from './types';

const city = (o: Partial<CityDestination>) => o as CityDestination;

describe('getCityId', () => {
  it('lit idCity, le champ réellement renvoyé par l’API', () => {
    expect(getCityId(city({ idCity: 25 }))).toBe(25);
  });

  it('accepte les anciens noms de champ', () => {
    expect(getCityId(city({ city_id: 7 }))).toBe(7);
    expect(getCityId(city({ id: 9 }))).toBe(9);
  });

  it('donne la priorité à idCity', () => {
    expect(getCityId(city({ idCity: 1, city_id: 2, id: 3 }))).toBe(1);
  });

  it('retombe sur 0 quand aucun identifiant n’est présent', () => {
    // C'était le cas de TOUTES les villes avant le correctif : clé React
    // dupliquée et dépliage groupé dans l'onglet coût de la vie.
    expect(getCityId(city({ name: 'Paris' }))).toBe(0);
  });
})
