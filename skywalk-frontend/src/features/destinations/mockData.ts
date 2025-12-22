import type { Destination } from './types';
import countriesData from '../../data/countries-data.json';

const MARKETING_DESCRIPTIONS: Record<string, string> = {
  'Canada': 'Le Canada offre de nombreuses opportunités pour les expatriés, avec ses programmes d\'immigration attractifs et sa qualité de vie élevée.',
  'France': 'La France attire de nombreux expatriés avec sa culture riche, son système de santé de qualité et ses opportunités professionnelles variées.',
  'Suisse': 'La Suisse est reconnue pour sa qualité de vie exceptionnelle, ses salaires élevés et ses paysages alpins à couper le souffle.',
  'Allemagne': 'L\'Allemagne est la première économie européenne avec de nombreuses opportunités dans le secteur technologique et industriel.',
  'Espagne': 'L\'Espagne séduit avec son climat agréable, sa culture vibrante et son coût de la vie abordable.',
  'Royaume-Uni': 'Le Royaume-Uni reste une destination prisée malgré le Brexit, avec Londres comme centre financier mondial.',
  'États-Unis': 'Les États-Unis offrent des opportunités dans tous les secteurs, particulièrement dans la technologie et l\'innovation.',
  'Australie': 'L\'Australie attire avec sa qualité de vie exceptionnelle, ses opportunités professionnelles et son climat agréable.',
  'Émirats arabes unis': 'Les EAU offrent des salaires défiscalisés et de nombreuses opportunités dans divers secteurs.',
  'Singapour': 'Singapour est le hub technologique et financier de l\'Asie avec des opportunités exceptionnelles.',
  'Portugal': 'Le Portugal attire les digital nomads et les retraités avec son climat, sa culture et son coût de la vie.',
  'Pays-Bas': 'Les Pays-Bas offrent un excellent équilibre vie professionnelle/personnelle et un marché du travail international.',
};

const getDescription = (country: any) => {
  if (MARKETING_DESCRIPTIONS[country.name]) {
    return MARKETING_DESCRIPTIONS[country.name];
  }
  
  const bestFor = country.recommendations?.bestFor?.join(', ') || 'tous';
  return `Découvrez ${country.name}, une destination idéale pour ${bestFor}. Profitez d'une qualité de vie notée ${country.lifestyle?.safetyRating || 'N/A'}/10.`;
};

const getHighlights = (country: any) => {
  const highlights = [];
  
  if (country.recommendations?.bestFor && country.recommendations.bestFor.length > 0) {
    highlights.push(`Idéal pour: ${country.recommendations.bestFor[0]}`);
  }
  
  if (country.jobMarket?.topSectors && country.jobMarket.topSectors.length > 0) {
    highlights.push(`Secteur clé: ${country.jobMarket.topSectors[0]}`);
  }
  
  if (country.healthcare?.qualityRating) {
    highlights.push(`Santé: ${country.healthcare.qualityRating}`);
  }
  
  if (country.lifestyle?.workLifeBalance) {
    highlights.push(`Équilibre vie-pro: ${country.lifestyle.workLifeBalance}`);
  }
  
  if (highlights.length < 3 && country.languages) {
    highlights.push(`Langues: ${country.languages.join(', ')}`);
  }

  return highlights.slice(0, 4);
};

export const mockDestinations: Destination[] = countriesData.countries.map((country: any) => ({
  id: country.id.toString(),
  name: country.name,
  slug: country.name.toLowerCase(),
  flagEmoji: country.flagEmoji,
  continent: country.continent,
  description: getDescription(country),
  stats: {
    memberCount: country.expatCommunity?.size === 'Grande' ? 2000 + Math.floor(Math.random() * 1000) : 500 + Math.floor(Math.random() * 500),
    jobOffersCount: (country.jobMarket?.keyJobSites?.length || 2) * 25 + Math.floor(Math.random() * 50),
    forumTopicsCount: (country.expatCommunity?.forums?.length || 2) * 60 + Math.floor(Math.random() * 100),
    resourcesCount: (country.resources?.expatGuides?.length || 2) * 15 + Math.floor(Math.random() * 20),
  },
  highlights: getHighlights(country),
}));

export function getDestinationBySlug(slug: string): Destination | undefined {
  return mockDestinations.find((dest) => dest.slug === slug);
}

export function getTopDestinations(limit: number = 6): Destination[] {
  return [...mockDestinations]
    .sort((a, b) => b.stats.memberCount - a.stats.memberCount)
    .slice(0, limit);
}
