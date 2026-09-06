import { MapPin, Calendar, ExternalLink, Building2, Banknote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '../types';
import { getLocale } from '../../../data/supportedCountries';

interface JobCardProps {
  job: SearchResult;
  viewMode: 'grid' | 'list';
}

export default function JobCard({ job, viewMode }: JobCardProps) {
  const { t, i18n } = useTranslation();

  const formatSalary = (price?: number, currency?: string, period?: 'month' | 'year') => {
    if (!price) return t('searchPage.job.salaryNotSpecified');
    
    const locale = getLocale(i18n.language);
    const periodLabel = period === 'month'
      ? t('searchPage.job.perMonth')
      : t('searchPage.job.perYear');

    if (!currency) {
      return `${price.toLocaleString(locale)}+${periodLabel}`;
    }
    
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
      });
      
      return `${formatter.format(price)}+${periodLabel}`;
    } catch {
      return `${price.toLocaleString(locale)} ${currency}+${periodLabel}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('searchPage.job.today');
    if (diffDays === 1) return t('searchPage.job.yesterday');
    if (diffDays < 7) return t('searchPage.job.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('searchPage.job.weeksAgo', { count: Math.floor(diffDays / 7) });
    return t('searchPage.job.monthsAgo', { count: Math.floor(diffDays / 30) });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4 sm:p-6">
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  {job.tags[0] || t('searchPage.job.company')}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold text-blue-600 mb-1">
                  {formatSalary(job.price, job.currency, job.salaryPeriod)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(job.date)}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                <MapPin className="w-3 h-3" />
                {job.city}, {job.country}
              </span>
              {job.tags.slice(1, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('searchPage.job.viewOffer')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-4 pt-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {job.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.tags[0] || t('searchPage.job.company')}</span>
        </p>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{job.city}, {job.country}</span>
        </div>

        <div className="flex items-center gap-1 text-lg font-bold text-blue-600 mb-3">
          <Banknote className="w-5 h-5" />
          {formatSalary(job.price, job.currency, job.salaryPeriod)}
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-3 min-h-[3.75rem]">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
          {job.tags.slice(1, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md truncate max-w-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(job.date)}
          </div>
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('searchPage.view')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
