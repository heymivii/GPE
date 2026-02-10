import { Car, Bus, DollarSign, Fuel, MapPin, Loader2, AlertCircle, ArrowRightLeft, Timer, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import { useCurrency } from '../../../contexts/CurrencyContext';
import CurrencySelector from '../../../components/CurrencySelector';
import { getCountryMapping, getCurrentLocale } from '../../../data/supportedCountries';

interface TransportStatsProps {
  countryName?: string;
}

const fmtPrice = (v: number | undefined | null, decimals = 0): string =>
  v != null && v !== 0
    ? v.toLocaleString(getCurrentLocale(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—';

export default function TransportStats({ countryName }: TransportStatsProps) {
  const { t } = useTranslation();
  const mapping = getCountryMapping(countryName);

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
          <span className="text-gray-500">{t('services.stats.common.loading', { service: t('services.categories.transport.title'), city: mapping.displayName })}</span>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-600">{t('services.stats.common.errorLoad', { service: t('services.categories.transport.title'), city: mapping.displayName })}</p>
          <p className="text-sm text-gray-400 mt-1">{t('services.stats.common.retryLater')}</p>
        </div>
      </section>
    );
  }

  const transport = data.categories.transportation;
  const localCur = data.currency.code;
  const cityName = data.city.name;
  const rates = data.currency.exchangeRates ?? null;

  const same = isSameCurrency(localCur);
  const fp = (v?: number) => formatPrice(v, localCur, rates);

  // Key figures
  const gasoline = transport.personal.gasoline1L.avg;
  const monthlyPass = transport.publicTransport.monthlyPass.avg;
  const oneWayTicket = transport.publicTransport.oneWayTicket.avg;
  const taxiStart = transport.taxi.start.avg;
  const taxiPerKm = transport.taxi.per1km.avg;
  const taxiWait = transport.taxi.waitingHour.avg;
  const newCar = transport.personal.newCar.avg;

  // Estimate monthly fuel budget: 100km/week × 4.33 weeks × 7L/100km × gasoline
  const monthlyFuelCost = Math.round((100 * 4.33 * 7 / 100) * gasoline);

  const HeadlinePrice = ({ value, prefix, suffix }: { value?: number; prefix?: string; suffix?: string }) => (
    <>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}{fp(value)}{suffix}
      </p>
      {!same && value != null && value > 0 && (
        <p className="text-xs text-gray-400 mt-0.5">{prefix}{fmtPrice(value, 2)} {localCur}{suffix}</p>
      )}
    </>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('services.stats.transport.title', { city: mapping.displayName })}
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <CurrencySelector />
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
            <span className="text-xs font-medium text-blue-700">{cityName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-orange-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Fuel className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.transport.gasolinePrice')}</p>
          <HeadlinePrice value={gasoline} suffix={t('services.stats.common.perLiter')} />
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Bus className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t('services.stats.common.monthly')}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.transport.transportPass')}</p>
          <HeadlinePrice value={monthlyPass} suffix={t('services.stats.common.perMonth')} />
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.transport.singleTicket')}</p>
          <HeadlinePrice value={oneWayTicket} />
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-emerald-200 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{t('services.stats.transport.monthlyFuelBudget')}</p>
          <HeadlinePrice value={monthlyFuelCost} prefix="~" />
          <p className="text-xs text-gray-400 mt-1">{t('services.stats.transport.fuelEstimate')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.transport.publicTransport')}</h3>
          </div>
          <PriceRow label={t('services.stats.transport.singleTicketLabel')} avg={oneWayTicket} min={transport.publicTransport.oneWayTicket.min} max={transport.publicTransport.oneWayTicket.max} localCur={localCur} exchangeRates={rates} />
          <PriceRow label={t('services.stats.transport.monthlyPassLabel')} avg={monthlyPass} min={transport.publicTransport.monthlyPass.min} max={transport.publicTransport.monthlyPass.max} localCur={localCur} exchangeRates={rates} />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.transport.taxi')}</h3>
          </div>
          <PriceRow label={t('services.stats.transport.taxiStart')} avg={taxiStart} min={transport.taxi.start.min} max={transport.taxi.start.max} localCur={localCur} exchangeRates={rates} />
          <PriceRow label={t('services.stats.transport.taxiPerKm')} avg={taxiPerKm} min={transport.taxi.per1km.min} max={transport.taxi.per1km.max} localCur={localCur} exchangeRates={rates} />
          <PriceRow label={t('services.stats.transport.taxiWaiting')} avg={taxiWait} min={transport.taxi.waitingHour.min} max={transport.taxi.waitingHour.max} localCur={localCur} exchangeRates={rates} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Fuel className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">{t('services.stats.transport.personalVehicle')}</h3>
          </div>
          <PriceRow label={t('services.stats.transport.gasoline1L')} avg={gasoline} min={transport.personal.gasoline1L.min} max={transport.personal.gasoline1L.max} localCur={localCur} exchangeRates={rates} />
          <PriceRow label={t('services.stats.transport.newCar')} avg={newCar} min={transport.personal.newCar.min} max={transport.personal.newCar.max} localCur={localCur} exchangeRates={rates} />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col justify-center">
          <div className="flex items-start space-x-3">
            <Timer className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">{t('services.stats.transport.monthlyComparison')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">{t('services.stats.transport.publicTransportEmoji')}</span>
                  <span className="font-bold text-blue-900">{fp(monthlyPass)}{t('services.stats.common.perMonth')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">{t('services.stats.transport.carEmoji')}</span>
                  <span className="font-bold text-blue-900">~{fp(monthlyFuelCost)}{t('services.stats.common.perMonth')}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <p className="text-xs text-blue-700">
                    {monthlyPass < monthlyFuelCost
                      ? t('services.stats.transport.publicCheaper', { pct: Math.round(((monthlyFuelCost - monthlyPass) / monthlyFuelCost) * 100) })
                      : t('services.stats.transport.carCheaper', { pct: Math.round(((monthlyPass - monthlyFuelCost) / monthlyPass) * 100) })
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>{t('services.stats.common.source')}</strong> {t('services.stats.common.sourceNumbeo')} <strong>{cityName}</strong>.
          {!same && (
            <> {t('services.stats.common.pricesConverted', { symbol: displaySymbol, from: localCur, to: displayCurrency })}</>
          )}
          {' '}{t('services.stats.common.pricesIndicative')}
          {data.currency.lastUpdated && (
            <span className="text-gray-400"> — {t('services.stats.common.lastUpdated')} {new Date(data.currency.lastUpdated).toLocaleDateString(getCurrentLocale())}</span>
          )}
        </p>
      </div>
    </section>
  );
}

function PriceRow({ label, avg, min, max, localCur, exchangeRates }: {
  label: string; avg?: number; min?: number; max?: number;
  localCur: string; exchangeRates: Record<string, number> | null;
}) {
  const { formatPrice, isSameCurrency } = useCurrency();
  const same = isSameCurrency(localCur);
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="font-semibold text-sm text-gray-900">
          {formatPrice(avg, localCur, exchangeRates)}
          {!same && avg != null && avg > 0 && (
            <span className="text-gray-400 text-xs font-normal ml-1.5">({fmtPrice(avg, 2)} {localCur})</span>
          )}
        </span>
      </div>
      {min != null && max != null && min !== 0 && max !== 0 && (
        <div className="flex justify-end gap-3 mt-0.5">
          <span className="text-xs text-gray-400">min {formatPrice(min, localCur, exchangeRates)}</span>
          <span className="text-xs text-gray-400">max {formatPrice(max, localCur, exchangeRates)}</span>
        </div>
      )}
    </div>
  );
}
