import { Globe, GitCompare, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const steps = [
  { key: 'choose', icon: Globe, color: 'bg-blue-50 text-blue-600' },
  { key: 'compare', icon: GitCompare, color: 'bg-emerald-50 text-emerald-600' },
  { key: 'go', icon: Rocket, color: 'bg-amber-50 text-amber-600' },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-outfit">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-gray-200" />

          {steps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center text-center relative">
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6 relative z-10 bg-white ring-4 ring-gray-50`}>
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t('landing.howItWorks.stepLabel', { number: index + 1 })}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t(`landing.howItWorks.steps.${step.key}.title`)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {t(`landing.howItWorks.steps.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
