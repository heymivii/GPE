import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Shield, ChevronRight, ExternalLink, CheckCircle2, Circle,
  AlertTriangle, Lightbulb, FileText, DollarSign, Globe,
  ClipboardCheck, ArrowRight, Info, ChevronDown, XCircle, Clock,
} from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { getVisaDataForCountry, getAvailableVisaCountries } from '../../../data/visa-data';
import type { VisaCountryData } from '../../../data/visa-data';
import { useAuth } from '../../../hooks/useAuth';
import { useDestination } from '../../../contexts/DestinationContext';
import { slugFromCode, resolveCountry } from '../../../data/countryMappings';
import { isNegativeVisaTip } from '../../../data/visaTips';

const VISA_COLOR: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

const VISA_DOT: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const WARNING_STYLES: Record<string, string> = {
  red: 'bg-red-50 border-red-200 text-red-800',
  yellow: 'bg-amber-50 border-amber-200 text-amber-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
};

const WARNING_DOT: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  orange: 'bg-orange-500',
};

export default function VisaPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { countrySlug, setCountrySlug } = useDestination();
  const countries = getAvailableVisaCountries();

  // Derive ISO2 from slug for visa data lookup; fall back to 'FR' when nothing selected
  const selectedCountry =
    (countrySlug ? resolveCountry(countrySlug)?.code : undefined) ?? 'FR';

  const [visaData, setVisaData] = useState<VisaCountryData | undefined>(
    getVisaDataForCountry(selectedCountry)
  );
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    const data = getVisaDataForCountry(selectedCountry);
    setVisaData(data);
    setCheckedItems(new Set());
  }, [selectedCountry]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = visaData
    ? Math.round((checkedItems.size / visaData.checklist.length) * 100)
    : 0;

  if (!visaData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`${t('visa.title')} — ${visaData.flag} ${visaData.countryName}`}
        description={t('visa.description')}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">{t('visa.selectCountry')}</span>
            <div className="flex gap-2">
              {countries.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCountrySlug(slugFromCode(c.code) ?? c.code.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCountry === c.code
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {t('visa.visaTypes')} — {visaData.countryName}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {visaData.visaTypes.map(visa => (
                  <div key={visa.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${VISA_DOT[visa.color]}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${VISA_COLOR[visa.color]}`}>
                            {t(`visa.types.${visa.type}`)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {t(`visa.types.${visa.description}`)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t('visa.duration')}: <strong className="text-gray-700">{t(`visa.durations.${visa.duration}`)}</strong></span>
                          <span className="inline-flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {t('visa.cost')}: <strong className="text-gray-700">{visa.cost}</strong></span>
                          <span className="inline-flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> {t('visa.processing')}: <strong className="text-gray-700">{t(`visa.timelines.${visa.processing}`)}</strong></span>
                        </div>
                      </div>
                      <a
                        href={visa.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors ml-4 whitespace-nowrap"
                      >
                        {t('visa.learnMore')} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {t('visa.workVisaGuide')}
                    </h2>
                    <p className="text-sm text-gray-500">{t('visa.stepByStep')}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-0">
                  {visaData.workVisaSteps.map((step, i) => (
                    <div key={i} className="relative">
                      {i < visaData.workVisaSteps.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <button
                        onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                        className="w-full flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            {t(`visa.steps.${step.title}`)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {t(`visa.steps.${step.description}`)}
                          </p>
                          <span className="inline-block mt-1 text-xs text-gray-400">
                            ⏱ {t(`visa.timelines.${step.timeline}`)}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 mt-3 transition-transform ${expandedStep === i ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedStep === i && step.details && (
                        <div className="ml-14 mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                          <ul className="space-y-1.5">
                            {step.details.map((d, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                <ArrowRight className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                                {t(`visa.steps.${d}`)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{t('visa.costsBreakdown')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {visaData.costs.map((cost, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">{t(`visa.costs.${cost.label}`)}</span>
                      <span className="text-sm font-semibold text-gray-900">{cost.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {t('visa.totalEstimated')}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{visaData.totalCost}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('visa.importantWarnings')}</h2>
              </div>
              {visaData.warnings.map((w, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${WARNING_STYLES[w.level]}`}>
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${WARNING_DOT[w.level]}`} />
                  <p className="text-sm font-medium">{t(`visa.warnings.${w.text}`)}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{t('visa.officialResources')}</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {visaData.officialResources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{r.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="space-y-6">

            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6" />
                <h3 className="font-bold">{t('visa.visaChecker')}</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">{t('visa.visaCheckerDesc')}</p>
              <a
                href={visaData.officialResources[0]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('visa.checkRequirements')} <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    {t('visa.checklist')} — {visaData.countryName}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('visa.checklistDesc')}</p>
              </div>

              <div className="px-5 py-3 border-b border-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('visa.progress')}</span>
                  <span className="text-xs font-bold text-gray-900">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                {visaData.checklist.map(item => {
                  const checked = checkedItems.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        checked ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {checked ? (
                        <CheckCircle2 className="w-5 h-5 text-gray-900 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {t(`visa.checklistItems.${item.label}`)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!isAuthenticated && (
                <div className="px-5 pb-5">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-600">{t('visa.saveProgress')}</span>
                    </div>
                    <Link
                      to="/auth/register"
                      className="text-xs text-gray-900 font-semibold hover:underline"
                    >
                      {t('visa.createAccount')} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900 text-sm">{t('visa.practicalTips')}</h3>
                </div>
              </div>
              <div className="p-5 space-y-2.5">
                {visaData.tips.map((tip, i) => {
                  const tipText = t(`visa.tipsList.${tip}`);
                  const isNegative = isNegativeVisaTip(tip);
                  return (
                    <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg ${isNegative ? 'bg-red-50' : ''}`}>
                      {isNegative ? (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{tipText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
