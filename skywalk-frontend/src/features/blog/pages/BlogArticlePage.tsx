import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ArrowLeft, ArrowRight, Calendar, Tag } from 'lucide-react';
import {
  getArticleById,
  getArticleTranslation,
  getCategoryTranslation,
  getArticlesByCategory,
} from '../../../data/blog-data';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function BlogArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const article = id ? getArticleById(id) : undefined;

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const title = getArticleTranslation(article.id, 'title', t);
  const content = getArticleTranslation(article.id, 'content', t);
  const categoryLabel = getCategoryTranslation(article.category, t);

  const related = getArticlesByCategory(article.category)
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs
          items={[
            { label: t('blog.page.title'), path: '/blog' },
            { label: title },
          ]}
        />
      </div>

      <div className="relative h-64 md:h-96 mt-6 overflow-hidden">
        <img
          src={article.coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-700 rounded-full">
              <Tag className="w-3 h-3" />
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {article.readTime} min {t('blog.article.readTime')}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight font-outfit">
            {title}
          </h1>

          <div className="prose prose-gray max-w-none">
            {paragraphs.map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    className="text-xl font-bold text-gray-900 mt-10 mb-4"
                  >
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg font-semibold text-gray-800 mt-8 mb-3"
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(Boolean);
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2 my-4 text-gray-600">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-gray-600 leading-relaxed mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.article.backToList')}
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('blog.article.relatedArticles')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.id}`}
                className="group block rounded-2xl border border-gray-200 overflow-hidden hover:border-[#5EA3C0] transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={rel.coverImage}
                    alt={getArticleTranslation(rel.id, 'title', t)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#5EA3C0] transition-colors line-clamp-2">
                    {getArticleTranslation(rel.id, 'title', t)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {rel.readTime} min
                    <ArrowRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-[#5EA3C0] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
