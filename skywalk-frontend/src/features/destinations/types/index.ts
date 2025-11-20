/**
 * Destination types for popular countries
 */

/**
 * Statistics for a destination country
 */
export interface DestinationStats {
  memberCount: number;
  jobOffersCount: number;
  forumTopicsCount: number;
  resourcesCount: number;
}

/**
 * Destination country information
 */
export interface Destination {
  id: string;
  name: string;
  slug: string;
  flagEmoji: string;
  continent: string;
  description: string;
  stats: DestinationStats;
  highlights: string[];
}
