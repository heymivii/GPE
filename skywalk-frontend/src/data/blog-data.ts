import type { TFunction } from 'i18next';

export interface BlogArticle {
  id: string;
  category: BlogCategory;
  readTime: number;
  date: string;
  coverImage: string;
  featured?: boolean;
  countries?: string[];
}

export type BlogCategory =
  | 'preparation'
  | 'administrative'
  | 'finance'
  | 'culture'
  | 'career'
  | 'housing'
  | 'health'
  | 'testimonial';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'preparation',
  'administrative',
  'finance',
  'culture',
  'career',
  'housing',
  'health',
  'testimonial',
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'checklist-avant-depart',
    category: 'preparation',
    readTime: 8,
    date: '2026-02-05',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    featured: true,
    countries: ['JP', 'US', 'CH', 'FR'],
  },
  {
    id: 'budget-expatriation',
    category: 'finance',
    readTime: 10,
    date: '2026-01-28',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    featured: true,
    countries: ['JP', 'US', 'CH', 'FR'],
  },
  {
    id: 'demarches-visa',
    category: 'administrative',
    readTime: 12,
    date: '2026-01-20',
    coverImage: 'https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=800&q=80',
    featured: true,
    countries: ['JP', 'US', 'CH'],
  },
  {
    id: 'choc-culturel',
    category: 'culture',
    readTime: 7,
    date: '2026-01-15',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    countries: ['JP', 'US'],
  },
  {
    id: 'trouver-emploi-etranger',
    category: 'career',
    readTime: 9,
    date: '2026-01-10',
    coverImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    countries: ['US', 'CH', 'FR'],
  },
  {
    id: 'logement-premier-mois',
    category: 'housing',
    readTime: 6,
    date: '2026-01-05',
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    countries: ['JP', 'US', 'CH', 'FR'],
  },
  {
    id: 'assurance-sante-expatrie',
    category: 'health',
    readTime: 8,
    date: '2025-12-28',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    countries: ['US', 'CH', 'FR'],
  },
  {
    id: 'temoignage-suisse',
    category: 'testimonial',
    readTime: 5,
    date: '2025-12-20',
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    countries: ['CH'],
  },
  {
    id: 'banque-etranger',
    category: 'finance',
    readTime: 7,
    date: '2025-12-15',
    coverImage: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80',
    countries: ['JP', 'US', 'CH', 'FR'],
  },
  {
    id: 'apprendre-langue',
    category: 'culture',
    readTime: 6,
    date: '2025-12-10',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    countries: ['JP'],
  },
  {
    id: 'enfants-expatriation',
    category: 'preparation',
    readTime: 9,
    date: '2025-12-05',
    coverImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    countries: ['US', 'CH', 'FR'],
  },
  {
    id: 'temoignage-japon',
    category: 'testimonial',
    readTime: 6,
    date: '2025-11-28',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    countries: ['JP'],
  },
];

export function getArticleTranslation(
  articleId: string,
  field: 'title' | 'excerpt' | 'content',
  t: TFunction,
): string {
  return t(`blog.articles.${articleId}.${field}`);
}

export function getCategoryTranslation(category: BlogCategory, t: TFunction): string {
  return t(`blog.categories.${category}`);
}

export function getArticleById(id: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.id === id);
}

export function getFeaturedArticles(): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.featured);
}

export function getArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.category === category);
}

export function getArticlesByCountry(isoCode: string): BlogArticle[] {
  const code = isoCode.toUpperCase();
  return BLOG_ARTICLES.filter((a) => a.countries?.includes(code));
}

export function getArticlesCountByCountry(isoCode: string): number {
  return getArticlesByCountry(isoCode).length;
}
