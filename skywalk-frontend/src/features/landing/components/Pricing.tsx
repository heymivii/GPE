import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

// ⚠️ Prix indicatifs / placeholder — modèle : on facture par projet d'expatriation.
interface Tier {
  name: string;
  price: string;
  period: string;
  tagline: string;
  highlighted: boolean;
  features: string[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    name: 'Découverte',
    price: '0',
    period: '',
    tagline: 'Pour explorer avant de se lancer',
    highlighted: false,
    features: [
      'Explorer toutes les destinations',
      'Comparateur & coût de la vie',
      'Aperçu de la checklist',
      'Accès au forum de la communauté',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    name: 'Projet',
    price: '49',
    period: '/ projet',
    tagline: 'Un projet d’expatriation, de A à Z',
    highlighted: true,
    features: [
      'Tout le plan Découverte',
      'Checklist personnalisée complète',
      'Liens officiels vérifiés (anti-erreur)',
      'Deadlines & suivi de progression',
      'Budget, documents & rappels',
    ],
    cta: 'Lancer mon projet',
  },
  {
    name: 'Illimité',
    price: '99',
    period: '/ an',
    tagline: 'Plusieurs destinations en tête',
    highlighted: false,
    features: [
      'Projets d’expatriation illimités',
      'Comparaison multi-pays avancée',
      'Support prioritaire',
      'Nouveautés en avant-première',
    ],
    cta: 'Passer en illimité',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 sm:px-8 w-full max-w-7xl mx-auto py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-outfit mb-3">
          Un prix par projet d’expatriation
        </h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Explorez gratuitement. Vous ne payez que lorsque vous passez à l’action sur un vrai projet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-3xl p-7 transition-all ${
              tier.highlighted
                ? 'border-2 border-[#5EA3C0] shadow-xl bg-white md:-translate-y-2'
                : 'border border-gray-200 bg-white shadow-sm'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-[#5EA3C0] text-white text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Le plus choisi
              </span>
            )}

            <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{tier.tagline}</p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900 font-outfit">{tier.price} €</span>
              {tier.period && <span className="text-gray-500 text-sm">{tier.period}</span>}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#5EA3C0] flex-shrink-0 mt-0.5" />
                  {f}
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
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Prix indicatifs. Sans engagement — vous ne payez qu’au lancement d’un projet.
      </p>
    </section>
  );
}
