import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getCountryMapping } from '../../../data/supportedCountries';


export function TransportCostTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [transportType, setTransportType] = useState<'car' | 'public'>('car');
  const [distance, setDistance] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('7');

  const mapping = getCountryMapping(countryName);
  const { formatPrice } = useCurrency();

  const { data, isLoading } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', mapping.city, mapping.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(mapping.city, mapping.country),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
  });

  const transport = data?.categories?.transportation;
  const localCur = data?.currency?.code ?? 'EUR';
  const rates = data?.currency?.exchangeRates ?? null;

  const fuelPrice = transport?.personal?.gasoline1L?.avg ?? 0;
  const publicTransportCost = transport?.publicTransport?.monthlyPass?.avg ?? 0;

  const fp = (v: number) => formatPrice(v, localCur, rates);

  const calculateCost = () => {
    if (transportType === 'public') return publicTransportCost;
    
    const dist = parseFloat(distance);
    if (isNaN(dist)) return 0;
    
    const consumption = parseFloat(fuelConsumption);
    const monthlyKm = dist * 2 * 22;
    const fuelCost = (monthlyKm / 100) * consumption * fuelPrice;
    return Math.round(fuelCost);
  };

  const monthlyCost = calculateCost();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
        <span className="text-xs text-gray-500">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {t('services.tools.transportCost.title')} {mapping.displayName && `- ${mapping.displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.tools.transportCost.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTransportType('car')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              transportType === 'car' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('services.tools.transportCost.car')}
          </button>
          <button
            onClick={() => setTransportType('public')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              transportType === 'public' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('services.tools.transportCost.publicTransport')}
          </button>
        </div>

        {transportType === 'car' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('services.tools.transportCost.dailyDistance')}
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Ex: 30"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('services.tools.transportCost.fuelConsumption')}
              </label>
              <input
                type="number"
                value={fuelConsumption}
                onChange={(e) => setFuelConsumption(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{t('services.tools.transportCost.fuelPrice')}</span>
                <span className="text-xs font-bold text-gray-900">{fp(fuelPrice)}/L</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">{t('services.tools.transportCost.publicPass')}</p>
            <p className="text-2xl font-bold text-gray-900">{fp(publicTransportCost)}</p>
            <p className="text-xs text-gray-400 mt-1">/ {t('services.stats.common.perMonth')}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">{t('services.tools.transportCost.monthlyCost')}</span>
            <span className="text-xl font-bold text-gray-900">{fp(monthlyCost)}</span>
          </div>
          {transportType === 'car' && (
            <p className="text-[10px] text-gray-400 mt-2 text-right">
              {t('services.tools.transportCost.info')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DriverLicenseTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [originCountry, setOriginCountry] = useState('');

  const canExchange = originCountry !== '';
  
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {t('services.transportTools.driverLicense')} {countryName && `- ${countryName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.transportTools.checkProcedures')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            {t('services.transportTools.originCountry')}
          </label>
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="">{t('services.transportTools.selectCountry')}</option>
            <option value="france">🇫🇷 {t('services.transportTools.france')}</option>
            <option value="canada">🇨🇦 {t('services.transportTools.canada')}</option>
            <option value="usa">🇺🇸 {t('services.transportTools.usa')}</option>
            <option value="uk">🇬🇧 {t('services.transportTools.uk')}</option>
          </select>
        </div>

        {canExchange && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{t('services.transportTools.exchangePossible')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('services.transportTools.exchangeDesc', { country: originCountry })}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{t('services.transportTools.processingTime')}</span>
                <span className="font-medium text-gray-900">{t('services.transportTools.processingTimeValue')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{t('services.transportTools.temporaryValidity')}</span>
                <span className="font-medium text-gray-900">{t('services.transportTools.temporaryValidityValue')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{t('services.transportTools.internationalLicense')}</span>
                <span className="font-medium text-green-600">{t('services.transportTools.accepted')}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
              <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">!</div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                {t('services.transportTools.todoNote')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function VehicleChecklistTool() {
  const { t } = useTranslation();
  const [checklist, setChecklist] = useState([
    { id: 1, text: t('services.transportTools.validId'), checked: false },
    { id: 2, text: t('services.transportTools.proofOfAddress'), checked: false },
    { id: 3, text: t('services.transportTools.validLicense'), checked: false },
    { id: 4, text: t('services.transportTools.carInsurance'), checked: false },
    { id: 5, text: t('services.transportTools.registration'), checked: false },
    { id: 6, text: t('services.transportTools.technicalInspection'), checked: false },
  ]);

  const toggleItem = (id: number) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const progress = Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100);

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {t('services.transportTools.vehiclePurchase')}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.transportTools.purchaseDocuments')}
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('services.transportTools.preparation')}</span>
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${
              item.checked 
                ? 'bg-white border-gray-200 text-gray-400' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700'
            }`}
          >
            <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              item.checked 
                ? 'bg-gray-900 border-gray-900 text-white' 
                : 'bg-white border-gray-300 text-transparent group-hover:border-gray-400'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className={`text-xs font-medium ${item.checked ? 'line-through' : ''}`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
