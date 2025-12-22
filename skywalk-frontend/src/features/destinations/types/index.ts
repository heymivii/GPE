
export interface DestinationStats {
  memberCount: number;
  jobOffersCount: number;
  forumTopicsCount: number;
  resourcesCount: number;
}

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
