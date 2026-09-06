import type { CityDestination } from './types';

/**
 * Identifiant d'une ville, quel que soit le nom du champ.
 *
 * L'API renvoie `idCity` (clé primaire de l'entité City) mais le type autorise
 * aussi `city_id` et `id`, hérités de réponses plus anciennes. Le code lisait
 * `city.city_id || city.id || 0` : toutes les villes retombaient donc sur 0,
 * d'où une clé React dupliquée et un dépliage qui ouvrait toutes les villes
 * d'un coup dans l'onglet coût de la vie.
 */
export function getCityId(city: CityDestination): number {
  return city.idCity ?? city.city_id ?? city.id ?? 0;
}
