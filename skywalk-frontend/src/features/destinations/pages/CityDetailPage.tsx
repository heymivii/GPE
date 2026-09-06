import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Users,
  Clock,
  Star,
} from 'lucide-react';
import { useCityDetail } from '../hooks/useCityDetail';
import CostOfLivingTab from '../components/CostOfLivingTab';
import TrustBadge from '../../../components/TrustBadge';
import type { CityDestination } from '../types';
import { useCountryName } from '../../../hooks/useCountryName';

/** Une tuile de chiffre, sans barre de progression : les indices Numbeo n'ont
 *  pas tous la même échelle, une jauge donnerait une fausse impression de note. */
function StatTile({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
  hint?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">
        {value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
        {suffix && <span className="ml-1 text-sm font-medium text-gray-500">{suffix}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  sourceUrl,
  children,
}: {
  title: string;
  subtitle?: string;
  sourceUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {sourceUrl && <TrustBadge url={sourceUrl} />}
      </div>
      {children}
    </section>
  );
}

export default function CityDetailPage() {
  const { t } = useTranslation();
  const localizedCountry = useCountryName();
  const { countrySlug, cityId: cityIdParam } = useParams<{
    countrySlug: string;
    cityId: string;
  }>();
  const cityId = Number(cityIdParam);

  const {
    city,
    isLoading,
    isError,
    costOfLiving,
    isCostOfLivingLoading,
    qualityOfLife,
    propertyInvestment,
  } = useCityDetail(cityId);

  // CostOfLivingTab attend une liste de villes : on lui passe celle-ci seule,
  // ce qui évite de réécrire tout le rendu des catégories de prix.
  const citiesForCostTab = useMemo<CityDestination[]>(() => {
    if (!city || !costOfLiving) return [];
    return [
      {
        idCity: city.idCity,
        name: city.name,
        slug: '',
        isCapital: city.isCapital ?? false,
        priority: 0,
        country: city.country as never,
        costOfLiving: costOfLiving as never,
      },
    ];
  }, [city, costOfLiving]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-ink" />
      </div>
    );
  }

  if (isError || !city) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
        <h1 className="mb-2 text-lg font-bold text-gray-900">{t('cityDetail.notFound')}</h1>
        <Link
          to={countrySlug ? `/destinations/${countrySlug}` : '/destinations'}
          className="text-sm font-semibold text-brand-ink hover:underline"
        >
          {t('cityDetail.backToCountry')}
        </Link>
      </div>
    );
  }

  const countryName = localizedCountry(city.country?.countryName);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* En-tête illustré */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-200">
        {city.imageUrl && (
          <img src={city.imageUrl} alt={city.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-6 sm:px-6 lg:px-8">
          <Link
            to={countrySlug ? `/destinations/${countrySlug}` : '/destinations'}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {countryName || t('cityDetail.backToCountry')}
          </Link>
          <h1 className="text-4xl font-bold text-white">{city.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
            {city.isCapital && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-950">
                <Star className="h-3 w-3" /> {t('cityDetail.capital')}
              </span>
            )}
            {city.population != null && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {city.population.toLocaleString('fr-FR')} {t('cityDetail.inhabitants')}
              </span>
            )}
            {city.timezone && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {city.timezone}
              </span>
            )}
            {countryName && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {countryName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Coût de la vie */}
        <Section title={t('cityDetail.costOfLiving')} subtitle={t('cityDetail.costOfLivingDesc')}>
          {isCostOfLivingLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : citiesForCostTab.length > 0 ? (
            <CostOfLivingTab
              cities={citiesForCostTab}
              countryCurrency={costOfLiving?.currency?.code || 'EUR'}
            />
          ) : (
            <p className="text-sm text-gray-500">{t('cityDetail.noData')}</p>
          )}
        </Section>

        {/* Qualité de vie */}
        {qualityOfLife && (
          <Section
            title={t('cityDetail.qualityOfLife')}
            subtitle={t('cityDetail.qualityOfLifeDesc')}
            sourceUrl={qualityOfLife.sourceUrl}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile label={t('cityDetail.qol.global')} value={qualityOfLife.qualityOfLife} />
              <StatTile label={t('cityDetail.qol.safety')} value={qualityOfLife.safety} />
              <StatTile label={t('cityDetail.qol.healthCare')} value={qualityOfLife.healthCare} />
              <StatTile label={t('cityDetail.qol.purchasingPower')} value={qualityOfLife.purchasingPower} />
              <StatTile label={t('cityDetail.qol.pollution')} value={qualityOfLife.pollution} />
              <StatTile label={t('cityDetail.qol.climate')} value={qualityOfLife.climate} />
              <StatTile
                label={t('cityDetail.qol.traffic')}
                value={qualityOfLife.trafficCommuteTime}
                suffix={t('cityDetail.minutes')}
              />
              <StatTile label={t('cityDetail.qol.costIndex')} value={qualityOfLife.costOfLiving} />
              <StatTile
                label={t('cityDetail.qol.priceToIncome')}
                value={qualityOfLife.propertyPriceToIncome}
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              {t('cityDetail.indexScale')}
            </p>
          </Section>
        )}

        {/* Immobilier */}
        {propertyInvestment && (
          <Section
            title={t('cityDetail.property')}
            subtitle={t('cityDetail.propertyDesc')}
            sourceUrl={propertyInvestment.sourceUrl}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile
                label={t('cityDetail.prop.priceToIncome')}
                value={propertyInvestment.priceToIncomeRatio}
                hint={t('cityDetail.prop.priceToIncomeHint')}
              />
              <StatTile
                label={t('cityDetail.prop.mortgagePct')}
                value={propertyInvestment.mortgageAsPctIncome}
                suffix="%"
              />
              <StatTile
                label={t('cityDetail.prop.loanAffordability')}
                value={propertyInvestment.loanAffordabilityIndex}
              />
              <StatTile
                label={t('cityDetail.prop.priceToRentCentre')}
                value={propertyInvestment.priceToRentCityCentre}
                hint={t('cityDetail.prop.priceToRentHint')}
              />
              <StatTile
                label={t('cityDetail.prop.priceToRentOutside')}
                value={propertyInvestment.priceToRentOutside}
              />
            </div>
          </Section>
        )}

        {!qualityOfLife && !propertyInvestment && !isCostOfLivingLoading && (
          <p className="pt-2 text-center text-sm text-gray-500">{t('cityDetail.partialData')}</p>
        )}
      </div>
    </div>
  );
}
