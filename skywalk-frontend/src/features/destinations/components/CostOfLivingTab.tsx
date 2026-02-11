import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  UtensilsCrossed,
  Bus,
  Zap,
  ShoppingCart,
  Shirt,
  Baby,
  Dumbbell,
  TrendingUp,
  DollarSign,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { CityDestination, CostOfLivingData } from '../types';
import { getLocale } from '../../../data/supportedCountries';


const fmtPrice = (v: number | undefined | null, locale: string, decimals = 0): string =>
  v != null && v !== 0
    ? v.toLocaleString(getLocale(locale), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—';

function PriceRow({ label, value, currency, decimals = 2, locale = 'fr' }: { label: string; value?: number; currency: string; decimals?: number; locale?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-sm text-gray-900">
        {fmtPrice(value, locale, decimals)} {currency}
      </span>
    </div>
  );
}

function PriceRowRange({ label, avg, min, max, currency, locale = 'fr' }: { label: string; avg?: number; min?: number; max?: number; currency: string; locale?: string }) {
  return (
    <div className="py-2 border-b border-gray-50 last:border-0">
      <div className="flex justify-between">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="font-medium text-sm text-gray-900">{fmtPrice(avg, locale, 2)} {currency}</span>
      </div>
      {min != null && max != null && min !== 0 && max !== 0 && (
        <div className="flex justify-end gap-3 mt-0.5">
          <span className="text-xs text-gray-400">min {fmtPrice(min, locale, 2)}</span>
          <span className="text-xs text-gray-400">max {fmtPrice(max, locale, 2)}</span>
        </div>
      )}
    </div>
  );
}


interface CategoryConfig {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'salary',         labelKey: 'costOfLivingTab.categories.salary',         icon: TrendingUp,      color: 'text-green-600',  bgColor: 'bg-green-50' },
  { id: 'housing',        labelKey: 'costOfLivingTab.categories.housing',        icon: Home,            color: 'text-blue-600',   bgColor: 'bg-blue-50' },
  { id: 'restaurants',    labelKey: 'costOfLivingTab.categories.restaurants',     icon: UtensilsCrossed, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'food',           labelKey: 'costOfLivingTab.categories.food',           icon: ShoppingCart,    color: 'text-teal-600',   bgColor: 'bg-teal-50' },
  { id: 'transportation', labelKey: 'costOfLivingTab.categories.transportation', icon: Bus,             color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'utilities',      labelKey: 'costOfLivingTab.categories.utilities',      icon: Zap,             color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'clothing',       labelKey: 'costOfLivingTab.categories.clothing',       icon: Shirt,           color: 'text-pink-600',   bgColor: 'bg-pink-50' },
  { id: 'childcare',      labelKey: 'costOfLivingTab.categories.childcare',      icon: Baby,            color: 'text-rose-600',   bgColor: 'bg-rose-50' },
  { id: 'sports',         labelKey: 'costOfLivingTab.categories.sports',         icon: Dumbbell,        color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
];

const MARKET_KEYS = [
  'milk1L', 'bread500g', 'eggs12', 'rice1kg', 'cheese1kg',
  'chicken1kg', 'beef1kg', 'apple1kg', 'banana1kg', 'orange1kg',
  'tomato1kg', 'potato1kg', 'onion1kg', 'lettuce', 'water15L',
  'wine', 'domesticBeer', 'importedBeer', 'cigarettes',
];


function renderCategory(categoryId: string, col: CostOfLivingData, cur: string, t: (key: string) => string, locale: string) {
  const cats = col?.categories;
  if (!cats) return null;

  switch (categoryId) {
    case 'salary':
      return (
        <div className="space-y-2">
          <PriceRowRange label={t('costOfLivingTab.salary.averageMonthlySalary')} avg={cats.salary?.averageMonthly?.avg} min={cats.salary?.averageMonthly?.min} max={cats.salary?.averageMonthly?.max} currency={cur} locale={locale} />
          <div className="flex justify-between py-2">
            <span className="text-gray-500 text-sm">{t('costOfLivingTab.salary.mortgageRate')}</span>
            <span className="font-medium text-sm text-gray-900">{cats.salary?.mortgageRate?.avg?.toFixed(2) ?? '—'} %</span>
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500">{t('costOfLivingTab.salary.monthlyBudget')}</p>
            <p className="text-lg font-bold text-green-700">{fmtPrice(col.summary?.monthlyBudget?.avg, locale)} {cur}<span className="text-xs font-normal text-gray-400"> {t('costOfLivingTab.salary.perMonth')}</span></p>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-gray-400">{t('costOfLivingTab.salary.min')} {fmtPrice(col.summary?.monthlyBudget?.min, locale)} {cur}</span>
              <span className="text-xs text-gray-400">{t('costOfLivingTab.salary.max')} {fmtPrice(col.summary?.monthlyBudget?.max, locale)} {cur}</span>
            </div>
          </div>
        </div>
      );

    case 'housing':
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('costOfLivingTab.housing.rental')}</p>
          <PriceRowRange label={t('costOfLivingTab.housing.oneBedCityCenter')} avg={cats.housing?.rent?.oneBedroom?.cityCenter?.avg} min={cats.housing?.rent?.oneBedroom?.cityCenter?.min} max={cats.housing?.rent?.oneBedroom?.cityCenter?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.housing.oneBedOutside')} avg={cats.housing?.rent?.oneBedroom?.outsideCenter?.avg} min={cats.housing?.rent?.oneBedroom?.outsideCenter?.min} max={cats.housing?.rent?.oneBedroom?.outsideCenter?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.housing.threeBedCityCenter')} avg={cats.housing?.rent?.threeBedroom?.cityCenter?.avg} min={cats.housing?.rent?.threeBedroom?.cityCenter?.min} max={cats.housing?.rent?.threeBedroom?.cityCenter?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.housing.threeBedOutside')} avg={cats.housing?.rent?.threeBedroom?.outsideCenter?.avg} min={cats.housing?.rent?.threeBedroom?.outsideCenter?.min} max={cats.housing?.rent?.threeBedroom?.outsideCenter?.max} currency={cur} locale={locale} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{t('costOfLivingTab.housing.buy')}</p>
          <PriceRowRange label={t('costOfLivingTab.housing.cityCenter')} avg={cats.housing?.buy?.pricePerSqm?.cityCenter?.avg} min={cats.housing?.buy?.pricePerSqm?.cityCenter?.min} max={cats.housing?.buy?.pricePerSqm?.cityCenter?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.housing.outsideCenter')} avg={cats.housing?.buy?.pricePerSqm?.outsideCenter?.avg} min={cats.housing?.buy?.pricePerSqm?.outsideCenter?.min} max={cats.housing?.buy?.pricePerSqm?.outsideCenter?.max} currency={cur} locale={locale} />
        </div>
      );

    case 'restaurants':
      return (
        <div className="space-y-1">
          <PriceRowRange label={t('costOfLivingTab.restaurants.inexpensiveMeal')} avg={cats.restaurants?.inexpensiveMeal?.avg} min={cats.restaurants?.inexpensiveMeal?.min} max={cats.restaurants?.inexpensiveMeal?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.midRange')} avg={cats.restaurants?.midRangeMeal2People?.avg} min={cats.restaurants?.midRangeMeal2People?.min} max={cats.restaurants?.midRangeMeal2People?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.mcMeal')} avg={cats.restaurants?.mcMeal?.avg} min={cats.restaurants?.mcMeal?.min} max={cats.restaurants?.mcMeal?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.cappuccino')} avg={cats.restaurants?.cappuccino?.avg} min={cats.restaurants?.cappuccino?.min} max={cats.restaurants?.cappuccino?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.cocaCola')} avg={cats.restaurants?.cocaCola?.avg} min={cats.restaurants?.cocaCola?.min} max={cats.restaurants?.cocaCola?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.domesticBeer')} avg={cats.restaurants?.domesticBeer?.avg} min={cats.restaurants?.domesticBeer?.min} max={cats.restaurants?.domesticBeer?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.restaurants.importedBeer')} avg={cats.restaurants?.importedBeer?.avg} min={cats.restaurants?.importedBeer?.min} max={cats.restaurants?.importedBeer?.max} currency={cur} locale={locale} />
        </div>
      );

    case 'food': {
      const markets = cats.food?.markets;
      if (!markets) return <p className="text-gray-400 text-sm">{t('costOfLivingTab.foodNoData')}</p>;
      return (
        <div className="space-y-1">
          {MARKET_KEYS.map((key) => {
            const item = markets[key];
            if (!item || item.avg === 0) return null;
            return <PriceRowRange key={key} label={t(`costOfLivingTab.market.${key}`)} avg={item.avg} min={item.min} max={item.max} currency={cur} locale={locale} />;
          })}
        </div>
      );
    }

    case 'transportation':
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('costOfLivingTab.transportation.publicTransport')}</p>
          <PriceRowRange label={t('costOfLivingTab.transportation.monthlyPass')} avg={cats.transportation?.publicTransport?.monthlyPass?.avg} min={cats.transportation?.publicTransport?.monthlyPass?.min} max={cats.transportation?.publicTransport?.monthlyPass?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.transportation.oneWayTicket')} avg={cats.transportation?.publicTransport?.oneWayTicket?.avg} min={cats.transportation?.publicTransport?.oneWayTicket?.min} max={cats.transportation?.publicTransport?.oneWayTicket?.max} currency={cur} locale={locale} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{t('costOfLivingTab.transportation.taxi')}</p>
          <PriceRowRange label={t('costOfLivingTab.transportation.taxiStart')} avg={cats.transportation?.taxi?.start?.avg} min={cats.transportation?.taxi?.start?.min} max={cats.transportation?.taxi?.start?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.transportation.perKm')} avg={cats.transportation?.taxi?.per1km?.avg} min={cats.transportation?.taxi?.per1km?.min} max={cats.transportation?.taxi?.per1km?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.transportation.waitingHour')} avg={cats.transportation?.taxi?.waitingHour?.avg} min={cats.transportation?.taxi?.waitingHour?.min} max={cats.transportation?.taxi?.waitingHour?.max} currency={cur} locale={locale} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{t('costOfLivingTab.transportation.personal')}</p>
          <PriceRowRange label={t('costOfLivingTab.transportation.gasoline')} avg={cats.transportation?.personal?.gasoline1L?.avg} min={cats.transportation?.personal?.gasoline1L?.min} max={cats.transportation?.personal?.gasoline1L?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.transportation.newCar')} avg={cats.transportation?.personal?.newCar?.avg} min={cats.transportation?.personal?.newCar?.min} max={cats.transportation?.personal?.newCar?.max} currency={cur} locale={locale} />
        </div>
      );

    case 'utilities':
      return (
        <div className="space-y-1">
          <PriceRowRange label={t('costOfLivingTab.utilities.basic85m2')} avg={cats.utilities?.basic85m2?.avg} min={cats.utilities?.basic85m2?.min} max={cats.utilities?.basic85m2?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.utilities.internet')} avg={cats.utilities?.internet?.avg} min={cats.utilities?.internet?.min} max={cats.utilities?.internet?.max} currency={cur} locale={locale} />
          <PriceRow label={t('costOfLivingTab.utilities.mobileMinute')} value={cats.utilities?.mobileMinute?.avg} currency={cur} decimals={2} locale={locale} />
        </div>
      );

    case 'clothing':
      return (
        <div className="space-y-1">
          <PriceRowRange label={t('costOfLivingTab.clothing.jeans')} avg={cats.clothing?.jeans?.avg} min={cats.clothing?.jeans?.min} max={cats.clothing?.jeans?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.clothing.summerDress')} avg={cats.clothing?.summerDress?.avg} min={cats.clothing?.summerDress?.min} max={cats.clothing?.summerDress?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.clothing.leatherShoes')} avg={cats.clothing?.leatherShoes?.avg} min={cats.clothing?.leatherShoes?.min} max={cats.clothing?.leatherShoes?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.clothing.runningShoes')} avg={cats.clothing?.runningShoes?.avg} min={cats.clothing?.runningShoes?.min} max={cats.clothing?.runningShoes?.max} currency={cur} locale={locale} />
        </div>
      );

    case 'childcare':
      return (
        <div className="space-y-1">
          <PriceRowRange label={t('costOfLivingTab.childcare.preschool')} avg={cats.childcare?.preschool?.avg} min={cats.childcare?.preschool?.min} max={cats.childcare?.preschool?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.childcare.primarySchool')} avg={cats.childcare?.primarySchool?.avg} min={cats.childcare?.primarySchool?.min} max={cats.childcare?.primarySchool?.max} currency={cur} locale={locale} />
        </div>
      );

    case 'sports':
      return (
        <div className="space-y-1">
          <PriceRowRange label={t('costOfLivingTab.sports.gym')} avg={cats.sports?.gym?.avg} min={cats.sports?.gym?.min} max={cats.sports?.gym?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.sports.cinema')} avg={cats.sports?.cinema?.avg} min={cats.sports?.cinema?.min} max={cats.sports?.cinema?.max} currency={cur} locale={locale} />
          <PriceRowRange label={t('costOfLivingTab.sports.tennis')} avg={cats.sports?.tennis?.avg} min={cats.sports?.tennis?.min} max={cats.sports?.tennis?.max} currency={cur} locale={locale} />
        </div>
      );

    default:
      return null;
  }
}


interface CostOfLivingTabProps {
  cities: CityDestination[];
  countryCurrency: string;
  averageHousing?: string | null;
  costCurrency?: string;
}

export default function CostOfLivingTab({ cities, countryCurrency, averageHousing, costCurrency }: CostOfLivingTabProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [activeCategory, setActiveCategory] = useState('salary');
  const [expandedCities, setExpandedCities] = useState<Record<number, boolean>>({});

  const citiesWithData = cities.filter(c => c.costOfLiving);

  if (citiesWithData.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('costOfLivingTab.empty.title')}</h3>
        <p className="text-gray-500">{t('costOfLivingTab.empty.description')}</p>
      </div>
    );
  }

  const toggleCity = (cityId: number) => {
    setExpandedCities(prev => ({ ...prev, [cityId]: !prev[cityId] }));
  };

  const activeCat = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="space-y-6">
      {averageHousing && (
        <div className="bg-gradient-to-r from-[#5EA3C0]/10 to-[#5EA3C0]/5 rounded-xl p-5 border border-[#5EA3C0]/20">
          <div className="flex items-center gap-3 mb-1">
            <DollarSign className="w-5 h-5 text-[#5EA3C0]" />
            <h3 className="font-bold text-gray-900">{t('costOfLivingTab.nationalSummary')}</h3>
          </div>
          <p className="text-gray-600 text-sm">
            {t('costOfLivingTab.avgRent')}{' '}
            <span className="font-semibold text-gray-900">
              {Number(averageHousing).toLocaleString(getLocale(locale), { maximumFractionDigits: 0 })} {costCurrency || countryCurrency}
            </span>
            /{locale === 'fr' ? 'mois' : 'mo'} • {t('costOfLivingTab.citiesReferenced', { count: citiesWithData.length })}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${cat.bgColor} ${cat.color} ring-1 ring-current`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(cat.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {citiesWithData.map((city) => {
          const col = city.costOfLiving!;
          const cur = col.currency?.code || countryCurrency || '€';
          const cityId = city.city_id || city.id || 0;
          const isExpanded = expandedCities[cityId] !== false;

          return (
            <div key={cityId} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCity(cityId)}
                className="w-full bg-gray-50 px-5 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${activeCat.color}`} />
                  <span className="font-semibold text-gray-900">{city.name}</span>
                  {city.isCapital && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">{t('costOfLivingTab.capital')}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {activeCategory === 'salary' && (
                    <span className="text-sm font-bold text-green-600">{fmtPrice(col.summary?.averageSalary, locale)} {cur}/{locale === 'fr' ? 'mois' : 'mo'}</span>
                  )}
                  {activeCategory === 'housing' && (
                    <span className="text-sm font-bold text-blue-600">{fmtPrice(col.categories?.housing?.rent?.oneBedroom?.cityCenter?.avg, locale)} {cur}/{locale === 'fr' ? 'mois' : 'mo'}</span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 py-4">
                  {renderCategory(activeCategory, col, cur, t, locale)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
