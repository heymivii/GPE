import {
  Briefcase, DollarSign, TrendingUp, Clock, Loader2, AlertCircle,
  ExternalLink, Building2, Globe, FileText, Shield, MapPin, Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { searchJobs } from '../../../api/jobOffers';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import type { AdzunaSearchResponse, AdzunaJobDto } from '../../../features/search/types/job';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getCountryMapping, getCurrentLocale } from '../../../data/supportedCountries';
import {
  emploiDataByCountry,
  inDemandSectorsByCountry,
  contractTypesByCountry,
  jobPlatformsByCountry,
  workPermitRequirements,
  employmentNotes,
} from '../../../data/emploi-data';

interface EmploiStatsProps {
  countryName?: string;
}

/** Slug (lowercase French) → Adzuna 2-letter country code */
const SLUG_TO_ADZUNA: Record<string, string> = {
  france: 'fr',
  'royaume-uni': 'gb',
  suisse: 'ch',
  'etats-unis': 'us',
  canada: 'ca',
  allemagne: 'de',
  espagne: 'es',
  italie: 'it',
  belgique: 'be',
  'pays-bas': 'nl',
  australie: 'au',
  'nouvelle-zelande': 'nz',
  bresil: 'br',
  mexique: 'mx',
  singapour: 'sg',
};

const fmtNum = (n: number): string =>
  n.toLocaleString(getCurrentLocale());

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const locale = getCurrentLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (days === 0) return rtf.format(0, 'day');
  if (days < 7) return rtf.format(-days, 'day');
  if (days < 30) return rtf.format(-Math.floor(days / 7), 'week');
  return rtf.format(-Math.floor(days / 30), 'month');
}

export default function EmploiStats({ countryName }: EmploiStatsProps) {
  const { t } = useTranslation();
  const countryKey = countryName || 'france';
  const mapping = getCountryMapping(countryName);
  const adzunaCode = SLUG_TO_ADZUNA[countryKey];
  const { formatPrice, isSameCurrency } = useCurrency();

  const displayName = mapping?.displayName
    || countryName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    || 'France';

  // ──── Adzuna: total job count + sample offers ────
  const {
    data: adzunaData,
    isLoading: isAdzunaLoading,
  } = useQuery<AdzunaSearchResponse>({
    queryKey: ['emploi-adzuna', adzunaCode],
    queryFn: () => searchJobs({ country: adzunaCode, resultsPerPage: 6, page: 1 }),
    enabled: !!adzunaCode,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  // ──── Cost of living API: real salary data ────
  const {
    data: colData,
    isLoading: isColLoading,
  } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', mapping?.city, mapping?.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(mapping.city, mapping.country),
    enabled: !!mapping,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  // ──── Static data (fallback + structural info) ────
  const staticData = emploiDataByCountry[countryKey] || emploiDataByCountry['france'];
  const sectors = inDemandSectorsByCountry[countryKey] || inDemandSectorsByCountry['france'] || [];
  const contracts = contractTypesByCountry[countryKey] || contractTypesByCountry['france'] || [];
  const platforms = jobPlatformsByCountry[countryKey] || jobPlatformsByCountry['france'] || [];
  const permits = workPermitRequirements[countryKey] || workPermitRequirements['france'] || [];
  const notes = employmentNotes[countryKey] || employmentNotes['france'] || [];

  const isLoading = isAdzunaLoading || isColLoading;

  // Resolve real values — prefer API data, fall back to static
  const realSalaryAvg = colData?.categories?.salary?.averageMonthly?.avg;
  const realSalaryMin = colData?.categories?.salary?.averageMonthly?.min;
  const realSalaryMax = colData?.categories?.salary?.averageMonthly?.max;
  const localCur = colData?.currency?.code || 'EUR';
  const rates = colData?.currency?.exchangeRates ?? null;
  const same = isSameCurrency(localCur);

  const totalJobs = adzunaData?.total ?? 0;
  const sampleJobs = adzunaData?.results ?? [];

  const getUnemploymentColor = () => {
    if (!staticData) return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    if (staticData.unemploymentRate < 3) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (staticData.unemploymentRate < 5) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    if (staticData.unemploymentRate < 7) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  };
  const unemploymentColors = getUnemploymentColor();

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
          <span className="text-gray-500">{t('services.stats.common.loading', { service: t('services.categories.emploi.title'), city: displayName })}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('services.stats.emploi.title', { city: displayName })}
        </h2>
        {adzunaCode && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Globe className="w-3 h-3" /> {t('services.stats.emploi.realTimeData')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <Search className="w-5 h-5 text-blue-600" />
            {adzunaCode && <span className="text-[10px] font-bold text-blue-400 bg-blue-100 px-1.5 py-0.5 rounded">LIVE</span>}
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            {t('services.stats.emploi.availableOffers')}
          </p>
          <p className="text-3xl font-bold text-blue-700 tracking-tight mb-1">
            {totalJobs > 0 ? fmtNum(totalJobs) : '—'}
          </p>
          <p className="text-xs text-gray-500">
            {adzunaCode ? t('services.stats.emploi.viaAdzuna') : t('services.stats.emploi.unavailableCountry')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
            {t('services.stats.emploi.averageSalary')}
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {realSalaryAvg
              ? formatPrice(realSalaryAvg, localCur, rates)
              : staticData ? `${fmtNum(staticData.avgSalaryNet)}€` : '—'}
          </p>
          {!same && realSalaryAvg != null && realSalaryAvg > 0 && (
            <p className="text-xs text-gray-400">
              {fmtNum(Math.round(realSalaryAvg))} {localCur}/{t('services.stats.emploi.perMonth', 'mo')}
            </p>
          )}
          {same && (
            <p className="text-xs text-gray-500">{t('services.stats.emploi.netPerMonth')}</p>
          )}
          {realSalaryMin != null && realSalaryMax != null && (
            <p className="text-[10px] text-gray-400 mt-1">
              min {formatPrice(realSalaryMin, localCur, rates)} — max {formatPrice(realSalaryMax, localCur, rates)}
            </p>
          )}
        </div>

        {staticData && (
          <div className={`rounded-xl p-6 border transition-all hover:shadow-sm ${unemploymentColors.bg} ${unemploymentColors.border}`}>
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className={`w-5 h-5 ${unemploymentColors.text}`} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
              {t('services.stats.emploi.unemploymentRate')}
            </p>
            <p className={`text-3xl font-bold tracking-tight mb-1 ${unemploymentColors.text}`}>
              {staticData.unemploymentRate}%
            </p>
            <p className="text-xs text-gray-500">{t('services.stats.emploi.estimate2025')}</p>
          </div>
        )}

        {staticData && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
              {t('services.stats.emploi.legalHours')}
            </p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              {staticData.workingHours}h
            </p>
            <p className="text-xs text-gray-500">
              {t('services.stats.emploi.paidLeave', { count: staticData.paidLeaveDays })}
            </p>
          </div>
        )}
      </div>

      {sampleJobs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            {t('services.stats.emploi.recentOffers')}
            <span className="text-xs font-normal text-gray-400 ml-auto">{t('services.stats.emploi.totalOffers', { count: String(fmtNum(totalJobs)) } as Record<string, string>)}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleJobs.map((job: AdzunaJobDto) => (
              <a
                key={job.id}
                href={job.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {job.title}
                  </h4>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 ml-2 mt-0.5" />
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" />
                  {job.location.displayName}
                </p>
                {job.salary && (
                  <p className="text-xs font-medium text-emerald-600 mb-2">
                    💰 {fmtNum(Math.round(job.salary.min))} – {fmtNum(Math.round(job.salary.max))} {job.salary.currency}/an
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400">{timeAgo(job.created_at)}</span>
                  <div className="flex gap-1">
                    {job.remote && (
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">Remote</span>
                    )}
                    {job.contract_type && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{job.contract_type}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {sectors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {t('services.stats.emploi.inDemandSectors')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectors.map((sector, i) => {
              const demandColor = {
                'emploiData.demand.veryHigh': 'bg-green-50 text-green-700 border-green-200',
                'emploiData.demand.high': 'bg-blue-50 text-blue-700 border-blue-200',
                'emploiData.demand.medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                'emploiData.demand.low': 'bg-gray-50 text-gray-600 border-gray-200',
              }[sector.demandKey] || 'bg-gray-50 text-gray-600 border-gray-200';

              return (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{t(sector.nameKey)}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demandColor}`}>
                      {t(sector.demandKey)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{t('services.stats.emploi.avgSalaryLabel')} {sector.avgSalary}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              {t('services.stats.emploi.contractTypes')}
            </h3>
            <ul className="space-y-2">
              {contracts.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  {t(c)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {platforms.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-600" />
              {t('services.stats.emploi.searchPlatforms')}
            </h3>
            <div className="space-y-2.5">
              {platforms.map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{p.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{t(p.typeKey)}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {permits.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-base font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              {t('services.stats.emploi.workPermit')}
            </h3>
            <ul className="space-y-2.5">
              {permits.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  {t(p)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes.length > 0 && (
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-base font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              {t('services.stats.emploi.goodToKnow')}
            </h3>
            <ul className="space-y-2.5">
              {notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  {t(n)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
