import { ShieldCheck } from 'lucide-react';

// Exemples de sources officielles réellement utilisées par le moteur de liens gouvernementaux.
const SOURCES = [
  'travel.state.gov',
  'service-public.fr',
  'sem.admin.ch',
  'canada.ca',
  'gov.uk',
  'make-it-in-germany.com',
];

export default function OfficialSources() {
  return (
    <section className="px-4 sm:px-8 w-full max-w-7xl mx-auto py-8">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 mb-4">
              <ShieldCheck className="w-4 h-4" />
              Source officielle vérifiée
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-outfit mb-2">
              Des démarches fiables — pas des blogs approximatifs
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-xl">
              Chaque étape de votre plan renvoie vers la <span className="font-semibold text-gray-800">source
              gouvernementale officielle</span>, vérifiée en direct. Zéro info périmée, zéro rumeur — la
              différence entre un visa obtenu et une démarche ratée.
            </p>
          </div>

          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              {SOURCES.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 bg-white border border-emerald-100 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
