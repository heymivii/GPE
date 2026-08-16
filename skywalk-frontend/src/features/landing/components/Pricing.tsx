import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles } from 'lucide-react';

// ⚠️ Prix indicatifs / placeholder — modèle : on facture par projet d'expatriation.
interface Tier {
  key: string;
  price: string;
  period: string;
  highlighted: boolean;
  featureCount: number;
}

export default function Pricing() {
  const { t } = useTranslation();

  const tiers: Tier[] = [
    { key: 'discovery', price: '0', period: '', highlighted: false, featureCount: 4 },
    { key: 'project', price: '49', period: t('landing.pricing.perProject'), highlighted: true, featureCount: 5 },
    { key: 'unlimited', price: '99', period: t('landing.pricing.perYear'), highlighted: false, featureCount: 4 },
  ];

  return (
    <section id="pricing" className="px-4 sm:px-8 w-full max-w-7xl mx-auto py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-outfit mb-3">
          {t('landing.pricing.title')}
        </h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          {t('landing.pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.key}
            className={`relative flex flex-col rounded-3xl p-7 transition-all ${
              tier.highlighted
                ? 'border-2 border-[#5EA3C0] shadow-xl bg-white md:-translate-y-2'
                : 'border border-gray-200 bg-white shadow-sm'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-[#5EA3C0] text-white text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> {t('landing.pricing.popular')}
              </span>
            )}

            <h3 className="text-lg font-bold text-gray-900">
              {t(`landing.pricing.${tier.key}.name`)}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{t(`landing.pricing.${tier.key}.tagline`)}</p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900 font-outfit">{tier.price} €</span>
              {tier.period && <span className="text-gray-500 text-sm">{tier.period}</span>}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {Array.from({ length: tier.featureCount }, (_, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#5EA3C0] flex-shrink-0 mt-0.5" />
                  {t(`landing.pricing.${tier.key}.f${i + 1}`)}
                </li>
              ))}
            </ul>

            <Link
              to="/onboarding"
              className={`w-full text-center px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
                tier.highlighted
                  ? 'bg-[#5EA3C0] text-white hover:bg-[#4891b0]'
                  : 'border border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t(`landing.pricing.${tier.key}.cta`)}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">{t('landing.pricing.disclaimer')}</p>
    </section>
  );
}
