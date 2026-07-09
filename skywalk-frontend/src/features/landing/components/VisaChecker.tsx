import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight, BadgeCheck } from 'lucide-react';
import { NATIONALITY_OPTIONS, isVisaExempt } from '../../../data/freeMovement';
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';

/**
 * Widget « héros » : répond à la peur n°1 du futur expatrié — « ai-je besoin d'un visa ? ».
 * S'appuie sur la logique de libre circulation UE/EEE/CH (isVisaExempt) et renvoie vers
 * l'onboarding pré-rempli avec la destination.
 */
export default function VisaChecker() {
  const destinations = SUPPORTED_COUNTRIES.filter((c) => c.code !== undefined);
  const [nationality, setNationality] = useState('FR');
  const [destination, setDestination] = useState(
    destinations.find((d) => d.code === 'US')?.code || destinations[0]?.code || 'US',
  );

  const exempt = isVisaExempt(nationality, destination);
  const destObj = destinations.find((d) => d.code === destination);
  const destName = destObj?.name || destination;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5EA3C0] mb-2">
        <BadgeCheck className="w-4 h-4" />
        Vérif visa express
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-outfit mb-5">
        Ai-je besoin d'un visa ?
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Je suis…</label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:border-[#5EA3C0] focus:ring-2 focus:ring-[#5EA3C0]/20"
          >
            {NATIONALITY_OPTIONS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Je pars vers…</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:border-[#5EA3C0] focus:ring-2 focus:ring-[#5EA3C0]/20"
          >
            {destinations.map((d) => (
              <option key={d.code} value={d.code}>
                {d.flag} {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Verdict */}
      {exempt ? (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800">Libre circulation — aucun visa</p>
            <p className="text-sm text-emerald-700/90 mt-0.5">
              Ressortissant·e {NATIONALITY_OPTIONS.find((n) => n.value === nationality)?.label}, vous vous
              installez en {destName} sans visa ni titre de séjour.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Visa / titre de séjour requis</p>
            <p className="text-sm text-amber-700/90 mt-0.5">
              Pour vous installer en {destName}, une démarche visa est nécessaire. SkyWalk vous liste
              chaque étape, à partir des <span className="font-semibold">sources officielles vérifiées</span>.
            </p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-2">
        Estimation basée sur la libre circulation UE/EEE/CH — les détails dépendent de votre situation.
      </p>

      <Link
        to={`/onboarding?to=${destination}`}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-6 py-3.5 rounded-full font-semibold text-sm transition-colors"
      >
        Voir mon plan complet
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
