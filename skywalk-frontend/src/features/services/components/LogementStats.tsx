import { Home, DollarSign, TrendingUp, MapPin, Building2, Loader2, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getCountryMapping, getCurrentLocale } from '../../../data/supportedCountries';
import { formatNumber } from '../../../lib/formatters';

interface LogementStatsProps {
  countryName?: string;
  cityName?: string;
}

function PriceRow({ label, avg, min, max, localCur }: {
  label: string; avg?: number; min?: number; max?: number;
  localCur: string;
}) {
  const { formatPrice, isSameCurrency } = useCurrency();
  const same = isSameCurrency(localCur);
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="font-semibold text-sm text-gray-900">
          {formatPrice(avg, localCur)}
          {!same && avg != null && avg > 0 && (
            <span className="text-gray-400 text-xs font-normal ml-1.5">({formatNumber(avg)} {localCur})</span>
          )}
        </span>
      </div>
      {min != null && max != null && min !== 0 && max !== 0 && (
        <div className="flex justify-end gap-3 mt-0.5">
          <span className="text-xs text-gray-400">min {formatPrice(min, localCur)}</span>
          <span className="text-xs text-gray-400">max {formatPrice(max, localCur)}</span>
        </div>
      )}
    </div>
  );
}

export default function LogementStats({ countryName, cityName }: LogementStatsProps) {
  const { t } = useTranslation();
  const mapping = getCountryMapping(countryName);

  const { formatPrice, isSameCurrency, displayCurrency, displaySymbol } = useCurrency();

  const apiCity = cityName || mapping.city;

  const { data, isLoading, isError } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', apiCity, mapping.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(apiCity, mapping.country),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 10000),
  });

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
          <span className="text-gray-500">{t('services.stats.common.loading', { service: t('services.categories.logement.title'), city: mapping.displayName })}</span>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-600">{t('services.stats.common.errorLoad', { service: t('services.categories.logement.title'), city: mapping.displayName })}</p>
          <p className="text-sm text-gray-400 mt-1">{t('services.stats.common.retryLater')}</p>
        </div>
      </section>
    );
  }

  const housing = data.categories.housing;
  const utilities = data.categories.utilities;
  const salary = data.categories.salary;
  const localCur = data.currency.code;
  const numbeoCityName = data.city.name;

  const same = isSameCurrency(localCur);
  const fp = (v?: number) => formatPrice(v, localCur);

  const rent1BCenter = housing.rent.oneBedroom.cityCenter.avg;
  const rent1BOutside = housing.rent.oneBedroom.outsideCenter.avg;
  const rent3BCenter = housing.rent.threeBedroom.cityCenter.avg;
  const utilitiesAvg = utilities.basic85m2.avg;

  const HeadlinePrice = ({ value, prefix }: { value?: number; prefix?: string }) => (
    <>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}{fp(value)}
      </p>
      {!same && value != null && value > 0 && (
        <p className="text-xs text-gray-400 mt-0.5">{prefix}{formatNumber(value)} {localCur}</p>
      )}
    </>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('services.stats.logement.title', { city: mapping.displayName })}
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {!same && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                {localCur} → {displayCurrency}
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{numbeoCityName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Home className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t('services.stats.logement.center')}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.logement.rent1bedroom')}</p>
          <HeadlinePrice value={rent1BCenter} />
          <p className="text-xs text-gray-400 mt-1">{t('services.stats.common.perMonth').replace('/', '')}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Home className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{t('services.stats.logement.suburb')}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.logement.rent1bedroom')}</p>
          <HeadlinePrice value={rent1BOutside} />
          <p className="text-xs text-gray-400 mt-1">{t('services.stats.common.perMonth').replace('/', '')}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.logement.rent3bedrooms')}</p>
          <HeadlinePrice value={rent3BCenter} />
          <p className="text-xs text-gray-400 mt-1">{t('services.stats.logement.centerCity')}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-orange-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.logement.utilities')}</p>
          <HeadlinePrice value={utilitiesAvg} prefix="~" />
          <p className="text-xs text-gray-400 mt-1">{t('services.stats.logement.utilitiesDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.logement.monthlyRents')}</h3>
          </div>
          <PriceRow label={t('services.stats.logement.rent1BCenter')} avg={housing.rent.oneBedroom.cityCenter.avg} min={housing.rent.oneBedroom.cityCenter.min} max={housing.rent.oneBedroom.cityCenter.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.rent1BOutside')} avg={housing.rent.oneBedroom.outsideCenter.avg} min={housing.rent.oneBedroom.outsideCenter.min} max={housing.rent.oneBedroom.outsideCenter.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.rent3BCenter')} avg={housing.rent.threeBedroom.cityCenter.avg} min={housing.rent.threeBedroom.cityCenter.min} max={housing.rent.threeBedroom.cityCenter.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.rent3BOutside')} avg={housing.rent.threeBedroom.outsideCenter.avg} min={housing.rent.threeBedroom.outsideCenter.min} max={housing.rent.threeBedroom.outsideCenter.max} localCur={localCur} />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.logement.buyAndUtilities')}</h3>
          </div>
          <PriceRow label={t('services.stats.logement.pricePerSqmCenter')} avg={housing.buy.pricePerSqm.cityCenter.avg} min={housing.buy.pricePerSqm.cityCenter.min} max={housing.buy.pricePerSqm.cityCenter.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.pricePerSqmOutside')} avg={housing.buy.pricePerSqm.outsideCenter.avg} min={housing.buy.pricePerSqm.outsideCenter.min} max={housing.buy.pricePerSqm.outsideCenter.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.utilitiesLabel')} avg={utilities.basic85m2.avg} min={utilities.basic85m2.min} max={utilities.basic85m2.max} localCur={localCur} />
          <PriceRow label={t('services.stats.logement.internet')} avg={utilities.internet.avg} min={utilities.internet.min} max={utilities.internet.max} localCur={localCur} />
        </div>
      </div>

      {salary.averageMonthly.avg > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">{t('services.stats.logement.salaryContext')}</h3>
              <p className="text-sm text-blue-800">
                {t('services.stats.logement.avgNetSalary', { city: numbeoCityName })}{' '}
                <strong>
                  {fp(salary.averageMonthly.avg)}{t('services.stats.common.perMonth')}
                  {!same && (
                    <span className="font-normal text-blue-600"> ({formatNumber(salary.averageMonthly.avg)} {localCur})</span>
                  )}
                </strong>.
                {rent1BCenter > 0 && salary.averageMonthly.avg > 0 && (
                  <> {t('services.stats.logement.rentPercentOfSalary', { pct: Math.round((rent1BCenter / salary.averageMonthly.avg) * 100) })}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>{t('services.stats.common.source')}</strong> {t('services.stats.common.sourceNumbeo')} <strong>{numbeoCityName}</strong>.
          {!same && (
            <> {t('services.stats.common.pricesConverted', { symbol: displaySymbol, from: localCur, to: displayCurrency })}</>
          )}
          {' '}{t('services.stats.common.pricesIndicativeNeighborhood')}
          {data.currency.lastUpdated && (
            <span className="text-gray-400"> — {t('services.stats.common.lastUpdated')} {new Date(data.currency.lastUpdated).toLocaleDateString(getCurrentLocale())}</span>
          )}
        </p>
      </div>
    </section>
  );
}
