import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Shield, ChevronRight, ExternalLink, CheckCircle2, Circle,
  AlertTriangle, Lightbulb, FileText, DollarSign, Globe,
  ClipboardCheck, ArrowRight, Info, ChevronDown, ArrowRightLeft, MapPin,
  Clock, Search, ClipboardList, Send, Plane, Save, Landmark, ShieldCheck,
  Ban, Palmtree, Briefcase, GraduationCap, Users, XCircle, Calendar,
  LayoutDashboard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getVisaDataForCountry } from '../../../data/visa-data';
import type { VisaCountryData } from '../../../data/visa-data';
import { useAuth } from '../../../hooks/useAuth';
import { SUPPORTED_COUNTRIES, getCountryMapping } from '../../../data/supportedCountries';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import countriesData from '../../../data/countries-data.json';

function parseAmount(raw: string): number | null {
  if (!raw || /gratuit|free/i.test(raw)) return null;
  const cleaned = raw.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const match = cleaned.match(/[\d]+(?:\.[\d]+)?/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return isNaN(num) ? null : num;
}

const VISA_COLOR: Record<string, string> = {
  green: 'bg-gray-50 text-gray-700 border-gray-200',
  yellow: 'bg-gray-50 text-gray-700 border-gray-200',
  blue: 'bg-gray-50 text-gray-700 border-gray-200',
  purple: 'bg-gray-50 text-gray-700 border-gray-200',
};

const VISA_DOT: Record<string, string> = {
  green: 'bg-gray-900',
  yellow: 'bg-gray-600',
  blue: 'bg-gray-400',
  purple: 'bg-gray-500',
};

const WARNING_STYLES: Record<string, string> = {
  red: 'bg-gray-50 border-gray-300 text-gray-800',
  yellow: 'bg-gray-50 border-gray-200 text-gray-700',
  orange: 'bg-gray-50 border-gray-200 text-gray-700',
};

const WARNING_DOT: Record<string, string> = {
  red: 'bg-gray-900',
  yellow: 'bg-gray-500',
  orange: 'bg-gray-600',
};

interface VisaStatsProps {
  countryName: string;
}

export default function VisaStats({ countryName }: VisaStatsProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const isGeneral = countryName === 'general';

  const countryEntry = !isGeneral
    ? SUPPORTED_COUNTRIES.find(
        c => c.slug === countryName.toLowerCase() || c.name.toLowerCase() === countryName.toLowerCase()
      )
    : undefined;
  const countryCode = countryEntry?.code || 'FR';
  const mapping = getCountryMapping(isGeneral ? 'france' : countryName);
  const { isSameCurrency, displayCurrency, formatPrice } = useCurrency();
  const localCur = countryCode === 'US' ? 'USD' : countryCode === 'CH' ? 'CHF' : countryCode === 'JP' ? 'JPY' : 'EUR';
  const same = isSameCurrency(localCur);

  const fmtCost = (raw: string): string => {
    if (same) return raw;
    const num = parseAmount(raw);
    if (num === null) return raw;
    return formatPrice(num, localCur);
  };

  const [visaData, setVisaData] = useState<VisaCountryData | undefined>(
    isGeneral ? undefined : getVisaDataForCountry(countryCode)
  );
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const storageKey = `visa-checklist-${countryCode}`;

  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, storageKey]);

  const { data: projects } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled: isAuthenticated,
  });

  const countryDbId = useMemo(() => {
    const found = (countriesData.countries as Array<{ id: number; code: string }>).find(
      c => c.code === countryCode
    );
    return found?.id ?? null;
  }, [countryCode]);

  const projectsForCountry = useMemo(() => {
    if (!projects || !countryDbId) return [];
    return projects.filter(p => p.idDestinationCountry === countryDbId);
  }, [projects, countryDbId]);

  useEffect(() => {
    if (isGeneral) return;
    const data = getVisaDataForCountry(countryCode);
    setVisaData(data);
    setExpandedStep(null);
    try {
      const key = `visa-checklist-${countryCode}`;
      const stored = localStorage.getItem(key);
      setCheckedItems(stored ? new Set(JSON.parse(stored) as string[]) : new Set());
    } catch { setCheckedItems(new Set()); }
  }, [countryCode, isGeneral]);

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

  if (isGeneral) {
    return <VisaGeneralOverview />;
  }

  if (!visaData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t('visa.noData')}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {visaData.flag} {t('visa.visaTypes')} — {visaData.countryName}
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {!same && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">{localCur} → {displayCurrency}</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">{mapping.displayName}</span>
          </div>
        </div>
      </div>

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
                  {t('visa.visaTypes')} — {visaData.flag} {visaData.countryName}
                </h2>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {visaData.visaTypes.map(visa => (
              <div key={visa.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
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
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('visa.duration')}: <strong className="text-gray-700">{t(`visa.durations.${visa.duration}`)}</strong></span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {t('visa.cost')}: <strong className="text-gray-700">{fmtCost(visa.cost)}</strong></span>
                      <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" /> {t('visa.processing')}: <strong className="text-gray-700">{t(`visa.timelines.${visa.processing}`)}</strong></span>
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
                <h2 className="text-lg font-bold text-gray-900">{t('visa.workVisaGuide')}</h2>
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
                    className="w-full flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left overflow-hidden"
                  >
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-semibold text-gray-900 break-words">{t(`visa.steps.${step.title}`)}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 break-words">{t(`visa.steps.${step.description}`)}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {t(`visa.timelines.${step.timeline}`)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 mt-3 flex-shrink-0 transition-transform ${expandedStep === i ? 'rotate-180' : ''}`} />
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
                  <span className="text-sm font-semibold text-gray-900">{fmtCost(cost.amount)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('visa.totalEstimated')}</span>
              <span className="text-lg font-bold text-gray-900">{fmtCost(visaData.totalCost)}</span>
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

      <div className="space-y-6 lg:sticky lg:top-8 self-start">
        <section className="bg-gray-900 rounded-2xl p-6 text-white">
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
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">{t('visa.checklist')}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">{visaData.flag} {visaData.countryName} — {t('visa.checklistDesc')}</p>
          </div>
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('visa.progress')}</span>
              <span className="text-xs font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="p-5 space-y-2.5">
            {visaData.checklist.map(item => {
              const checked = checkedItems.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${checked ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
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

          <div className="px-5 pb-5">
            {!isAuthenticated ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">{t('visa.saveProgress')}</span>
                </div>
                <Link to="/auth/register" className="text-xs text-gray-900 font-semibold hover:underline">
                  {t('visa.createAccount')} →
                </Link>
              </div>
            ) : projectsForCountry.length > 0 ? (
              <Link
                to="/dashboard/personalized"
                className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white block">
                    {t('visa.goToProjectChecklist')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t('visa.projectChecklistHint', { count: projectsForCountry.length })}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
              </Link>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">{t('visa.noProjectForCountry')}</span>
                </div>
                <Link to="/onboarding" className="text-xs text-gray-900 font-semibold hover:underline">
                  {t('visa.createProject')} →
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">{t('visa.practicalTips')}</h3>
            </div>
          </div>
          <div className="p-5 space-y-2.5">
            {visaData.tips.map((tip, i) => {
              const tipText = t(`visa.tipsList.${tip}`);
              const isNegative = tipText.startsWith('❌');
              const cleanText = tipText.replace(/^[✅❌]\s*/, '');
              return (
                <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg ${isNegative ? 'bg-gray-50' : ''}`}>
                  {isNegative ? (
                    <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{cleanText}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
    </section>
  );
}


function VisaGeneralOverview() {
  const { t } = useTranslation();
  const g = (key: string) => t(`visa.general.${key}`);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['timeline', 'documents']));

  const toggle = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isOpen = (key: string) => openSections.has(key);

  const timelineSteps = [
    { monthKey: 'timeline1Month', titleKey: 'timeline1Title', descKey: 'timeline1Desc', icon: <Search className="w-4 h-4" /> },
    { monthKey: 'timeline2Month', titleKey: 'timeline2Title', descKey: 'timeline2Desc', icon: <ClipboardList className="w-4 h-4" /> },
    { monthKey: 'timeline3Month', titleKey: 'timeline3Title', descKey: 'timeline3Desc', icon: <Send className="w-4 h-4" /> },
    { monthKey: 'timeline4Month', titleKey: 'timeline4Title', descKey: 'timeline4Desc', icon: <Clock className="w-4 h-4" /> },
    { monthKey: 'timeline5Month', titleKey: 'timeline5Title', descKey: 'timeline5Desc', icon: <Plane className="w-4 h-4" /> },
  ];

  const documents = Array.from({ length: 8 }, (_, i) => ({
    doc: g(`doc${i + 1}`),
    note: g(`doc${i + 1}Note`),
  }));

  const tips = [
    { key: 1, icon: <Clock className="w-5 h-5 text-gray-500" /> },
    { key: 2, icon: <Ban className="w-5 h-5 text-gray-500" />, danger: true },
    { key: 3, icon: <Save className="w-5 h-5 text-gray-500" /> },
    { key: 4, icon: <Globe className="w-5 h-5 text-gray-500" /> },
    { key: 5, icon: <DollarSign className="w-5 h-5 text-gray-500" /> },
    { key: 6, icon: <Landmark className="w-5 h-5 text-gray-500" /> },
    { key: 7, icon: <Calendar className="w-5 h-5 text-gray-500" /> },
    { key: 8, icon: <ShieldCheck className="w-5 h-5 text-gray-500" /> },
  ];

  const errors = [
    { key: 'error1', level: 'red' },
    { key: 'error2', level: 'orange' },
    { key: 'error3', level: 'red' },
    { key: 'error4', level: 'yellow' },
    { key: 'error5', level: 'orange' },
  ];

  const visaTypes = [
    { titleKey: 'typeShortStay', descKey: 'typeShortStayDesc', icon: <Palmtree className="w-5 h-5 text-gray-500" /> },
    { titleKey: 'typeWork', descKey: 'typeWorkDesc', icon: <Briefcase className="w-5 h-5 text-gray-500" /> },
    { titleKey: 'typeStudent', descKey: 'typeStudentDesc', icon: <GraduationCap className="w-5 h-5 text-gray-500" /> },
    { titleKey: 'typeFamily', descKey: 'typeFamilyDesc', icon: <Users className="w-5 h-5 text-gray-500" /> },
  ];

  return (
    <div className="space-y-4">
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{g('heroTitle')}</h2>
            <p className="text-gray-400 text-sm">{g('heroSubtitle')}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mt-4">
          {g('heroDesc')} <strong className="text-white">{g('heroHighlight')}</strong>.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggle('timeline')} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{g('timelineTitle')}</h2>
              <p className="text-sm text-gray-500">{g('timelineSubtitle')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen('timeline') ? 'rotate-180' : ''}`} />
        </button>
        {isOpen('timeline') && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="space-y-0 pt-4">
              {timelineSteps.map((step, i) => (
                <div key={i} className="relative">
                  {i < 4 && <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />}
                  <div className="flex items-start gap-4 p-3">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{g(step.titleKey)}</h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{g(step.monthKey)}</span>
                      </div>
                      <p className="text-sm text-gray-500">{g(step.descKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggle('documents')} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{g('docsTitle')}</h2>
              <p className="text-sm text-gray-500">{g('docsSubtitle')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen('documents') ? 'rotate-180' : ''}`} />
        </button>
        {isOpen('documents') && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {documents.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.doc}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggle('tips')} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{g('tipsTitle')}</h2>
              <p className="text-sm text-gray-500">{g('tipsSubtitle')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen('tips') ? 'rotate-180' : ''}`} />
        </button>
        {isOpen('tips') && (
          <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
            {tips.map((tip) => (
              <div key={tip.key} className={`flex items-start gap-3 p-4 rounded-xl border ${tip.danger ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-100'}`}>
                <span className="flex-shrink-0 mt-0.5">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{g(`tip${tip.key}Title`)}</p>
                  <p className={`text-xs mt-1 ${tip.danger ? 'text-gray-600' : 'text-gray-500'}`}>{g(`tip${tip.key}Detail`)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggle('errors')} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{g('errorsTitle')}</h2>
              <p className="text-sm text-gray-500">{g('errorsSubtitle')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen('errors') ? 'rotate-180' : ''}`} />
        </button>
        {isOpen('errors') && (
          <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
            {errors.map((err, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${WARNING_STYLES[err.level]}`}>
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${WARNING_DOT[err.level]}`} />
                <p className="text-sm font-medium">{g(err.key)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggle('types')} className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{g('visaTypesTitle')}</h2>
              <p className="text-sm text-gray-500">{g('visaTypesSubtitle')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen('types') ? 'rotate-180' : ''}`} />
        </button>
        {isOpen('types') && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visaTypes.map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {v.icon}
                    <h3 className="font-bold text-sm text-gray-900">{g(v.titleKey)}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{g(v.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-gray-900 rounded-2xl p-8 text-white text-center">
        <Shield className="w-10 h-10 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-bold mb-2">{g('ctaTitle')}</h3>
        <p className="text-sm text-gray-400 mb-4 max-w-lg mx-auto">{g('ctaDesc')}</p>
      </section>
    </div>
  );
}