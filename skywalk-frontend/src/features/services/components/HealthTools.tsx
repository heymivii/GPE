import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { costOfLivingApi } from '../../../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../../../api/costOfLiving';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getCountryMapping } from '../../../data/supportedCountries';

const HEALTH_COSTS: Record<string, { publicMonthly: number; privateMonthly: number }> = {
  france:       { publicMonthly: 0,     privateMonthly: 70 },
  'etats-unis': { publicMonthly: 450,   privateMonthly: 0 },
  japon:        { publicMonthly: 25000,  privateMonthly: 0 },
  suisse:       { publicMonthly: 393,   privateMonthly: 450 },
};

export function HealthCoverageTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<'employee' | 'self-employed' | 'student'>('employee');

  const countryKey = countryName || 'france';
  const mapping = getCountryMapping(countryName);
  const costs = HEALTH_COSTS[countryKey] || HEALTH_COSTS['france'];
  const { formatPrice } = useCurrency();

  const { data, isLoading } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', mapping.city, mapping.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(mapping.city, mapping.country),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
  });

  const localCur = data?.currency?.code ?? 'EUR';
  const rates = data?.currency?.exchangeRates ?? null;
  const fp = (v: number) => formatPrice(v, localCur, rates);

  const publicCost = costs.publicMonthly;
  const privateCost = costs.privateMonthly;

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
          {t('services.tools.healthCoverage.title')} {mapping.displayName && `- ${mapping.displayName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.tools.healthCoverage.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            {t('services.tools.healthCoverage.situation')}
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as typeof profile)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="employee">{t('services.tools.healthCoverage.employee')}</option>
            <option value="self-employed">{t('services.tools.healthCoverage.selfEmployed')}</option>
            <option value="student">{t('services.tools.healthCoverage.student')}</option>
          </select>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
          <div className="pb-3 border-b border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-gray-900">{t('services.tools.healthCoverage.publicCoverage')}</p>
                <p className="text-xs text-gray-500">{t('services.tools.healthCoverage.publicDesc')}</p>
              </div>
              <span className="text-lg font-bold text-gray-900">{fp(publicCost)}</span>
            </div>
            <p className="text-[10px] text-gray-500">
              {publicCost === 0 ? t('services.tools.healthCoverage.included') : t('services.tools.healthCoverage.monthlyFee')}
            </p>
          </div>

          {privateCost > 0 && (
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{t('services.tools.healthCoverage.complementary')}</p>
                  <p className="text-xs text-gray-500">{t('services.tools.healthCoverage.complementaryDesc')}</p>
                </div>
                <span className="text-lg font-bold text-gray-900">{fp(privateCost)}</span>
              </div>
              <p className="text-[10px] text-gray-500">{t('services.tools.healthCoverage.perMonth')}</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-900">{t('services.tools.healthCoverage.totalEstimated')}</span>
              <span className="text-xl font-bold text-gray-900">{fp(publicCost + privateCost)}{t('services.stats.common.perMonth')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">i</div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {t('services.healthTools.averageCosts', { city: mapping.displayName })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MedicalChecklistTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [checklist, setChecklist] = useState([
    { id: 1, text: t('services.tools.medicalChecklist.items.records'), checked: false },
    { id: 2, text: t('services.tools.medicalChecklist.items.vaccination'), checked: false },
    { id: 3, text: t('services.tools.medicalChecklist.items.prescriptions'), checked: false },
    { id: 4, text: t('services.tools.medicalChecklist.items.ehic'), checked: false },
    { id: 5, text: t('services.tools.medicalChecklist.items.insurance'), checked: false },
    { id: 6, text: t('services.tools.medicalChecklist.items.allergies'), checked: false },
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
          {t('services.tools.medicalChecklist.title')} {countryName && `- ${countryName}`}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.tools.medicalChecklist.description')}
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('services.tools.medicalChecklist.completeness')}</span>
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

export function HealthBudgetTool({ countryName }: { countryName?: string }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<'young' | 'adult' | 'senior'>('adult');

  const countryKey = countryName || 'france';
  const mapping = getCountryMapping(countryName);
  const costs = HEALTH_COSTS[countryKey] || HEALTH_COSTS['france'];
  const { formatPrice } = useCurrency();

  const { data, isLoading } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living', mapping.city, mapping.country],
    queryFn: () => costOfLivingApi.getCostOfLiving(mapping.city, mapping.country),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 2,
  });

  const localCur = data?.currency?.code ?? 'EUR';
  const rates = data?.currency?.exchangeRates ?? null;
  const fp = (v: number) => formatPrice(v, localCur, rates);

  const multipliers: Record<string, { insurance: number; extra: number }> = {
    young: { insurance: 0.8, extra: 300 },
    adult: { insurance: 1.0, extra: 600 },
    senior: { insurance: 1.5, extra: 1200 },
  };
  const mult = multipliers[profile];
  const monthlyInsurance = Math.round((costs.publicMonthly + costs.privateMonthly) * mult.insurance);
  const annualInsurance = monthlyInsurance * 12;
  const annualExtra = Math.round(mult.extra * (localCur === 'JPY' ? 150 : localCur === 'CHF' ? 1.1 : localCur === 'USD' ? 1.1 : 1));
  const total = annualInsurance + annualExtra;

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
          {t('services.healthTools.annualBudget', { city: mapping.displayName })}
        </h4>
        <p className="text-xs text-gray-500">
          {t('services.healthTools.estimateExpenses')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
            {t('services.healthTools.yourProfile')}
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as typeof profile)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-0 text-sm"
          >
            <option value="young">{t('services.healthTools.young')}</option>
            <option value="adult">{t('services.healthTools.adult')}</option>
            <option value="senior">{t('services.healthTools.senior')}</option>
          </select>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{t('services.healthTools.monthlyInsurance')}</span>
            <span className="font-medium text-gray-900">{fp(monthlyInsurance)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{t('services.healthTools.annualInsurance')}</span>
            <span className="font-medium text-gray-900">{fp(annualInsurance)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{t('services.healthTools.consultations')}</span>
            <span className="font-medium text-gray-900">{fp(annualExtra)}{t('services.stats.common.perYear')}</span>
          </div>
          
          <div className="pt-3 border-t border-gray-200 mt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">{t('services.healthTools.totalEstimated')}</span>
            <span className="text-xl font-bold text-gray-900">{fp(total)}{t('services.stats.common.perYear')}</span>
          </div>
        </div>

        {countryKey === 'suisse' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-[10px]">!</div>
            <p className="text-[10px] text-orange-700 leading-relaxed">
              {t('services.healthTools.swissWarning')}
            </p>
          </div>
        )}

        {countryKey === 'etats-unis' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold text-[10px]">!</div>
            <p className="text-[10px] text-red-700 leading-relaxed">
              {t('services.healthTools.usaWarning')}
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex-shrink-0 w-4 h-4 mt-0.5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px]">i</div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {t('services.healthTools.budgetEstimateNote', { city: mapping.displayName })}
          </p>
        </div>
      </div>
    </div>
  );
}
