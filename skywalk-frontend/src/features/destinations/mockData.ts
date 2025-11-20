import type { Destination } from './types';

/**
 * Mock data for popular destinations among Skywalk members
 * TODO: Replace with real API data from backend when available
 */
export const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Canada',
    slug: 'canada',
    flagEmoji: '🇨🇦',
    continent: 'Amérique du Nord',
    description:
      'Le Canada offre de nombreuses opportunités pour les expatriés, avec ses programmes d\'immigration attractifs et sa qualité de vie élevée.',
    stats: {
      memberCount: 1247,
      jobOffersCount: 89,
      forumTopicsCount: 156,
      resourcesCount: 45,
    },
    highlights: [
      'Système d\'immigration par points',
      'Marché du travail dynamique',
      'Excellente qualité de vie',
      'Système de santé universel',
    ],
  },
  {
    id: '2',
    name: 'France',
    slug: 'france',
    flagEmoji: '🇫🇷',
    continent: 'Europe',
    description:
      'La France attire de nombreux expatriés avec sa culture riche, son système de santé de qualité et ses opportunités professionnelles variées.',
    stats: {
      memberCount: 2134,
      jobOffersCount: 142,
      forumTopicsCount: 298,
      resourcesCount: 78,
    },
    highlights: [
      'Système de santé de qualité',
      'Culture et patrimoine riches',
      'Marché du travail européen',
      'Vie culturelle dynamique',
    ],
  },
  {
    id: '3',
    name: 'Allemagne',
    slug: 'allemagne',
    flagEmoji: '🇩🇪',
    continent: 'Europe',
    description:
      'L\'Allemagne est la première économie européenne avec de nombreuses opportunités dans le secteur technologique et industriel.',
    stats: {
      memberCount: 1856,
      jobOffersCount: 167,
      forumTopicsCount: 234,
      resourcesCount: 92,
    },
    highlights: [
      'Économie forte et stable',
      'Secteur technologique en croissance',
      'Salaires compétitifs',
      'Qualité de vie élevée',
    ],
  },
  {
    id: '4',
    name: 'Espagne',
    slug: 'espagne',
    flagEmoji: '🇪🇸',
    continent: 'Europe',
    description:
      'L\'Espagne séduit avec son climat agréable, sa culture vibrante et son coût de la vie abordable.',
    stats: {
      memberCount: 1523,
      jobOffersCount: 98,
      forumTopicsCount: 187,
      resourcesCount: 56,
    },
    highlights: [
      'Climat méditerranéen',
      'Coût de la vie abordable',
      'Culture vibrante',
      'Marché du travail en croissance',
    ],
  },
  {
    id: '5',
    name: 'Royaume-Uni',
    slug: 'royaume-uni',
    flagEmoji: '🇬🇧',
    continent: 'Europe',
    description:
      'Le Royaume-Uni reste une destination prisée malgré le Brexit, avec Londres comme centre financier mondial.',
    stats: {
      memberCount: 1689,
      jobOffersCount: 134,
      forumTopicsCount: 221,
      resourcesCount: 67,
    },
    highlights: [
      'Centre financier mondial',
      'Secteur tech dynamique',
      'Opportunités internationales',
      'Langue anglaise',
    ],
  },
  {
    id: '6',
    name: 'États-Unis',
    slug: 'etats-unis',
    flagEmoji: '🇺🇸',
    continent: 'Amérique du Nord',
    description:
      'Les États-Unis offrent des opportunités dans tous les secteurs, particulièrement dans la technologie et l\'innovation.',
    stats: {
      memberCount: 1892,
      jobOffersCount: 245,
      forumTopicsCount: 312,
      resourcesCount: 103,
    },
    highlights: [
      'Leader mondial de l\'innovation',
      'Salaires élevés',
      'Opportunités tech abondantes',
      'Marché du travail dynamique',
    ],
  },
  {
    id: '7',
    name: 'Australie',
    slug: 'australie',
    flagEmoji: '🇦🇺',
    continent: 'Océanie',
    description:
      'L\'Australie attire avec sa qualité de vie exceptionnelle, ses opportunités professionnelles et son climat agréable.',
    stats: {
      memberCount: 987,
      jobOffersCount: 76,
      forumTopicsCount: 143,
      resourcesCount: 52,
    },
    highlights: [
      'Qualité de vie exceptionnelle',
      'Salaires compétitifs',
      'Climat agréable',
      'Marché du travail ouvert',
    ],
  },
  {
    id: '8',
    name: 'Suisse',
    slug: 'suisse',
    flagEmoji: '🇨🇭',
    continent: 'Europe',
    description:
      'La Suisse offre les salaires les plus élevés d\'Europe avec une qualité de vie exceptionnelle.',
    stats: {
      memberCount: 1234,
      jobOffersCount: 89,
      forumTopicsCount: 165,
      resourcesCount: 71,
    },
    highlights: [
      'Salaires très élevés',
      'Qualité de vie exceptionnelle',
      'Centre financier',
      'Stabilité politique',
    ],
  },
  {
    id: '9',
    name: 'Émirats arabes unis',
    slug: 'emirats-arabes-unis',
    flagEmoji: '🇦🇪',
    continent: 'Moyen-Orient',
    description:
      'Les EAU offrent des salaires défiscalisés et de nombreuses opportunités dans divers secteurs.',
    stats: {
      memberCount: 845,
      jobOffersCount: 112,
      forumTopicsCount: 128,
      resourcesCount: 48,
    },
    highlights: [
      'Pas d\'impôt sur le revenu',
      'Salaires élevés',
      'Économie dynamique',
      'Hub international',
    ],
  },
  {
    id: '10',
    name: 'Singapour',
    slug: 'singapour',
    flagEmoji: '🇸🇬',
    continent: 'Asie',
    description:
      'Singapour est le hub technologique et financier de l\'Asie avec des opportunités exceptionnelles.',
    stats: {
      memberCount: 756,
      jobOffersCount: 98,
      forumTopicsCount: 134,
      resourcesCount: 61,
    },
    highlights: [
      'Hub technologique asiatique',
      'Fiscalité avantageuse',
      'Qualité de vie élevée',
      'Centre financier',
    ],
  },
  {
    id: '11',
    name: 'Portugal',
    slug: 'portugal',
    flagEmoji: '🇵🇹',
    continent: 'Europe',
    description:
      'Le Portugal attire les digital nomads et les retraités avec son climat, sa culture et son coût de la vie.',
    stats: {
      memberCount: 1345,
      jobOffersCount: 67,
      forumTopicsCount: 176,
      resourcesCount: 54,
    },
    highlights: [
      'Coût de la vie abordable',
      'Climat agréable',
      'Communauté d\'expatriés',
      'Programme NHR',
    ],
  },
  {
    id: '12',
    name: 'Pays-Bas',
    slug: 'pays-bas',
    flagEmoji: '🇳🇱',
    continent: 'Europe',
    description:
      'Les Pays-Bas offrent un excellent équilibre vie professionnelle/personnelle et un marché du travail international.',
    stats: {
      memberCount: 1123,
      jobOffersCount: 102,
      forumTopicsCount: 189,
      resourcesCount: 73,
    },
    highlights: [
      'Excellent équilibre vie-travail',
      'Marché du travail international',
      'Infrastructure de qualité',
      'Niveau d\'anglais élevé',
    ],
  },
];

/**
 * Get a destination by its slug
 */
export function getDestinationBySlug(slug: string): Destination | undefined {
  return mockDestinations.find((dest) => dest.slug === slug);
}

/**
 * Get top destinations sorted by member count
 */
export function getTopDestinations(limit: number = 6): Destination[] {
  return [...mockDestinations]
    .sort((a, b) => b.stats.memberCount - a.stats.memberCount)
    .slice(0, limit);
}
