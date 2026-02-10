import { Shield, DollarSign, AlertCircle, Loader2, ArrowRightLeft, MapPin, Heart, Stethoscope, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import { useCurrency } from '../../../contexts/CurrencyContext';
import CurrencySelector from '../../../components/CurrencySelector';
import { getCountryMapping, getCurrentLocale } from '../../../data/supportedCountries';

/* ------------------------------------------------------------------ */
/*  Static health-system metadata (not available in cost-of-living API) */
/* ------------------------------------------------------------------ */
interface HealthSystemMeta {
  systemTypeKey: string;
  systemLabelKey: string;
  coverageRate: number;
  insuranceMonthlyLocal: number;
  complementaryMonthlyLocal: number;
  alertColor: string;
  alertBg: string;
  alertBorder: string;
  alertIcon: string;
  alertTitleKey: string;
  alertTextKey: string;
}

const HEALTH_META: Record<string, HealthSystemMeta> = {
  france: {
    systemTypeKey: 'healthMeta.france.systemType',
    systemLabelKey: 'healthMeta.france.systemLabel',
    coverageRate: 70,
    insuranceMonthlyLocal: 0,
    complementaryMonthlyLocal: 70,
    alertColor: 'text-green-600',
    alertBg: 'bg-green-50',
    alertBorder: 'border-green-200',
    alertIcon: '🇫🇷',
    alertTitleKey: 'healthMeta.france.alertTitle',
    alertTextKey: 'healthMeta.france.alertText',
  },
  'etats-unis': {
    systemTypeKey: 'healthMeta.usa.systemType',
    systemLabelKey: 'healthMeta.usa.systemLabel',
    coverageRate: 60,
    insuranceMonthlyLocal: 450,
    complementaryMonthlyLocal: 0,
    alertColor: 'text-red-600',
    alertBg: 'bg-red-50',
    alertBorder: 'border-red-200',
    alertIcon: '🇺🇸',
    alertTitleKey: 'healthMeta.usa.alertTitle',
    alertTextKey: 'healthMeta.usa.alertText',
  },
  japon: {
    systemTypeKey: 'healthMeta.japan.systemType',
    systemLabelKey: 'healthMeta.japan.systemLabel',
    coverageRate: 70,
    insuranceMonthlyLocal: 25000,
    complementaryMonthlyLocal: 0,
    alertColor: 'text-blue-600',
    alertBg: 'bg-blue-50',
    alertBorder: 'border-blue-200',
    alertIcon: '🇯🇵',
    alertTitleKey: 'healthMeta.japan.alertTitle',
    alertTextKey: 'healthMeta.japan.alertText',
  },
  suisse: {
    systemTypeKey: 'healthMeta.switzerland.systemType',
    systemLabelKey: 'healthMeta.switzerland.systemLabel',
    coverageRate: 90,
    insuranceMonthlyLocal: 393,
    complementaryMonthlyLocal: 450,
    alertColor: 'text-orange-600',
    alertBg: 'bg-orange-50',
    alertBorder: 'border-orange-200',
    alertIcon: '🇨🇭',
    alertTitleKey: 'healthMeta.switzerland.alertTitle',
    alertTextKey: 'healthMeta.switzerland.alertText',
  },
};

interface HealthStatsProps {
  countryName?: string;
}

const fmtNum = (v: number, d = 0) =>
  v.toLocaleString(getCurrentLocale(), { minimumFractionDigits: d, maximumFractionDigits: d });

export default function HealthStats({ countryName }: HealthStatsProps) {
  const { t } = useTranslation();
  const countryKey = countryName || 'france';
  const mapping = getCountryMapping(countryName);
  const meta = HEALTH_META[countryKey] || HEALTH_META['france'];

  const { formatPrice, isSameCurrency, displayCurrency, displaySymbol } = useCurrency();

  const { data, isLoading, isError } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', mapping.city, mapping.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(mapping.city, mapping.country),
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
          <span className="text-gray-500">{t('services.stats.common.loading', { service: t('services.categories.sante.title'), city: mapping.displayName })}</span>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-600">{t('services.stats.common.errorLoad', { service: t('services.categories.sante.title'), city: mapping.displayName })}</p>
          <p className="text-sm text-gray-400 mt-1">{t('services.stats.common.retryLater')}</p>
        </div>
      </section>
    );
  }

  const localCur = data.currency.code;
  const cityName = data.city.name;
  const rates = data.currency.exchangeRates ?? null;
  const same = isSameCurrency(localCur);
  const fp = (v?: number) => formatPrice(v, localCur, rates);

  // Monthly budget from API
  const monthlyBudgetAvg = data.summary.monthlyBudget.avg;
  const avgSalary = data.summary.averageSalary;

  // Insurance cost (static meta, expressed in local currency)
  const insuranceMonthly = meta.insuranceMonthlyLocal;
  const complementaryMonthly = meta.complementaryMonthlyLocal;
  const totalHealthMonthly = insuranceMonthly + complementaryMonthly;

  // Childcare as a proxy for family health cost
  const preschool = data.categories.childcare?.preschool?.avg;

  // Health % of salary estimate
  const healthPctOfSalary = avgSalary > 0 ? Math.round((totalHealthMonthly / avgSalary) * 100) : null;

  const HeadlinePrice = ({ value, suffix }: { value?: number; suffix?: string }) => (
    <>
      <p className="text-2xl font-bold text-gray-900">
        {fp(value)}{suffix}
      </p>
      {!same && value != null && value > 0 && (
        <p className="text-xs text-gray-400 mt-0.5">{fmtNum(value, 0)} {localCur}{suffix}</p>
      )}
    </>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('services.stats.health.title', { city: mapping.displayName })}
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <CurrencySelector />
          {!same && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">{localCur} → {displayCurrency}</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{cityName}</span>
          </div>
        </div>
      </div>

      {/* Headline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* System type */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.health.system')}</p>
          <p className="text-2xl font-bold text-gray-900">{t(meta.systemTypeKey)}</p>
          <p className="text-xs text-gray-500 mt-1">{t(meta.systemLabelKey)}</p>
        </div>

        {/* Insurance monthly */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Heart className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {insuranceMonthly === 0 ? t('services.stats.health.viaTaxes') : t('services.stats.common.monthly')}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
            {countryKey === 'suisse' ? t('services.stats.health.primeLAMal') : countryKey === 'etats-unis' ? t('services.stats.health.healthInsurance') : t('services.stats.health.publicContribution')}
          </p>
          <HeadlinePrice value={insuranceMonthly} suffix={t('services.stats.common.perMonth')} />
        </div>

        {/* Coverage rate */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Stethoscope className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.health.reimbursement')}</p>
          <p className="text-2xl font-bold text-gray-900">{meta.coverageRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{t('services.stats.health.averageCoverage')}</p>
        </div>

        {/* Total health cost */}
        <div className={`rounded-xl p-5 border transition-all hover:shadow-sm ${
          totalHealthMonthly > 400 ? 'bg-red-50 border-red-200' :
          totalHealthMonthly > 150 ? 'bg-orange-50 border-orange-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className={`w-5 h-5 ${
              totalHealthMonthly > 400 ? 'text-red-600' :
              totalHealthMonthly > 150 ? 'text-orange-600' :
              'text-green-600'
            }`} />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.health.totalHealthCost')}</p>
          <HeadlinePrice value={totalHealthMonthly} suffix={t('services.stats.common.perMonth')} />
          {healthPctOfSalary != null && (
            <p className="text-xs text-gray-500 mt-1">{t('services.stats.health.ofAverageSalary', { pct: healthPctOfSalary })}</p>
          )}
        </div>
      </div>

      {/* Cost details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Health insurance breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.health.insuranceCosts')}</h3>
          </div>
          <PriceRow
            label={countryKey === 'suisse' ? t('services.stats.health.lamalBase') : countryKey === 'etats-unis' ? t('services.stats.health.privateInsurance') : countryKey === 'japon' ? t('services.stats.health.nhiInsurance') : t('services.stats.health.socialSecurity')}
            value={insuranceMonthly}
            suffix={t('services.stats.common.perMonth')}
            localCur={localCur}
            exchangeRates={rates}
          />
          {complementaryMonthly > 0 && (
            <PriceRow
              label={countryKey === 'suisse' ? t('services.stats.health.optionalComplementary') : t('services.stats.health.complementaryMutual')}
              value={complementaryMonthly}
              suffix={t('services.stats.common.perMonth')}
              localCur={localCur}
              exchangeRates={rates}
            />
          )}
          <PriceRow
            label={t('services.stats.health.totalInsurance')}
            value={totalHealthMonthly}
            suffix={t('services.stats.common.perMonth')}
            localCur={localCur}
            exchangeRates={rates}
            bold
          />
          <PriceRow
            label={t('services.stats.health.totalAnnual')}
            value={totalHealthMonthly * 12}
            suffix={t('services.stats.common.perYear')}
            localCur={localCur}
            exchangeRates={rates}
            bold
          />
        </div>

        {/* Context: cost of living */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.health.economicContext')}</h3>
          </div>
          <PriceRow
            label={t('services.stats.health.averageNetSalary')}
            value={avgSalary}
            suffix={t('services.stats.common.perMonth')}
            localCur={localCur}
            exchangeRates={rates}
          />
          <PriceRow
            label={t('services.stats.health.averageMonthlyBudget')}
            value={monthlyBudgetAvg}
            suffix={t('services.stats.common.perMonth')}
            localCur={localCur}
            exchangeRates={rates}
          />
          {preschool != null && preschool > 0 && (
            <PriceRow
              label={t('services.stats.health.preschool')}
              value={preschool}
              suffix={t('services.stats.common.perMonth')}
              localCur={localCur}
              exchangeRates={rates}
            />
          )}
          {healthPctOfSalary != null && (
            <div className="py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">{t('services.stats.health.healthSalaryRatio')}</span>
                <span className="font-semibold text-sm text-gray-900">{healthPctOfSalary}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Country-specific alert */}
      <div className={`mb-8 ${meta.alertBg} ${meta.alertBorder} border rounded-xl p-6`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl flex-shrink-0">{meta.alertIcon}</span>
          <div>
            <h3 className={`font-semibold mb-1 ${meta.alertColor.replace('text-', 'text-').replace('600', '900')}`}>
              {t(meta.alertTitleKey)}
            </h3>
            <p className={`text-sm leading-relaxed ${meta.alertColor.replace('600', '800')}`}>
              {t(meta.alertTextKey)}
            </p>
          </div>
        </div>
      </div>

      {/* Source note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>{t('services.stats.common.source')}</strong> {t('services.stats.health.sourceExtra', { city: cityName })}
          {!same && (
            <> {t('services.stats.common.pricesConverted', { symbol: displaySymbol, from: localCur, to: displayCurrency })}</>
          )}
          {' '}{t('services.stats.health.insuranceCostsNote')}
          {data.currency.lastUpdated && (
            <span className="text-gray-400"> — {t('services.stats.common.lastUpdated')} {new Date(data.currency.lastUpdated).toLocaleDateString(getCurrentLocale())}</span>
          )}
        </p>
      </div>
    </section>
  );
}

function PriceRow({ label, value, suffix, localCur, exchangeRates, bold }: {
  label: string; value?: number; suffix?: string;
  localCur: string; exchangeRates: Record<string, number> | null;
  bold?: boolean;
}) {
  const { formatPrice, isSameCurrency } = useCurrency();
  const same = isSameCurrency(localCur);
  return (
    <div className={`py-2.5 border-b border-gray-50 last:border-0 ${bold ? 'pt-3 mt-1 border-t border-gray-200' : ''}`}>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
        <span className={`text-sm text-gray-900 ${bold ? 'font-bold text-base' : 'font-semibold'}`}>
          {formatPrice(value, localCur, exchangeRates)}{suffix}
          {!same && value != null && value > 0 && (
            <span className="text-gray-400 text-xs font-normal ml-1.5">
              ({fmtNum(value, 0)} {localCur})
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
