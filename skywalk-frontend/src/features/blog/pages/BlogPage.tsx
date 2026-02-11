import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ArrowRight, Search, BookOpen } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  getArticleTranslation,
  getCategoryTranslation,
  getFeaturedArticles,
  type BlogCategory,
} from '../../../data/blog-data';

export default function BlogPage() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = getFeaturedArticles();

  const filteredArticles = useMemo(() => {
    let articles = BLOG_ARTICLES;

    if (activeCategory !== 'all') {
      articles = articles.filter((a) => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter((a) => {
        const title = getArticleTranslation(a.id, 'title', t).toLowerCase();
        const excerpt = getArticleTranslation(a.id, 'excerpt', t).toLowerCase();
        return title.includes(q) || excerpt.includes(q);
      });
    }

    return articles;
  }, [activeCategory, searchQuery, t]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title={t('blog.page.title')}
        description={t('blog.page.description')}
      />

      {activeCategory === 'all' && !searchQuery && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('blog.page.featured')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((article, idx) => (
              <Link
                key={article.id}
                to={`/blog/${article.id}`}
                className={`group block rounded-2xl border border-gray-200 overflow-hidden hover:border-[#5EA3C0] transition-all duration-300 ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`relative overflow-hidden ${idx === 0 ? 'h-64 md:h-80' : 'h-48'}`}>
                  <img
                    src={article.coverImage}
                    alt={getArticleTranslation(article.id, 'title', t)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full mb-2">
                      {getCategoryTranslation(article.category, t)}
                    </span>
                    <h3 className={`font-bold text-white leading-tight ${idx === 0 ? 'text-2xl' : 'text-lg'}`}>
                      {getArticleTranslation(article.id, 'title', t)}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {getArticleTranslation(article.id, 'excerpt', t)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(article.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5EA3C0] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('blog.page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5EA3C0]/30 focus:border-[#5EA3C0]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('blog.page.allCategories')}
            </button>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryTranslation(cat, t)}
              </button>
            ))}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('blog.page.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.id}`}
                className="group block rounded-2xl border border-gray-200 overflow-hidden hover:border-[#5EA3C0] transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={getArticleTranslation(article.id, 'title', t)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full">
                    {getCategoryTranslation(article.category, t)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5EA3C0] transition-colors line-clamp-2">
                    {getArticleTranslation(article.id, 'title', t)}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {getArticleTranslation(article.id, 'excerpt', t)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(article.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#5EA3C0] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {t('blog.page.readMore')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
