/*
 * ===== BLOC « APERÇU GRATUIT » DÉSACTIVÉ =====
 *
 * Le sélecteur « Où souhaitez-vous vous installer ? » de la landing, retiré
 * suite au retour de recette. Conservé entier pour pouvoir le remettre :
 * décommenter ce fichier, puis réintroduire <DestinationPreview /> dans
 * features/landing/pages/LandingPage.tsx.
 *
 * Deux commentaires internes ont été convertis (un docblock et un commentaire
 * JSX) : leur délimiteur fermant aurait refermé ce commentaire-ci.
 */

/*
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Loader2, Gauge, ShieldHalf, Wallet } from 'lucide-react';
import { qualityOfLifeApi } from '../../../api/qualityOfLife';
import { useSupportedCountries } from '../../../hooks/useSupportedCountries';

/**
 * Hero-adjacent mini-simulator: pick a destination → get a REAL snapshot (Numbeo quality-of-life
 * indices, never fabricated) + a reassuring promise, then route into the personalised onboarding.
 * Value BEFORE the sign-up effort — the hook, honestly grounded.
export default function DestinationPreview() {
  const navigate = useNavigate();
  const { countries, nonSelectableCodes } = useSupportedCountries();
  const selectable = countries.filter((c) => !nonSelectableCodes.has(c.code));

  const [code, setCode] = useState('');

  const { data, isFetching, isError } = useQuery({
    queryKey: ['landing-preview-qol', code],
    queryFn: () => qualityOfLifeApi.get(code),
    enabled: code !== '',
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const chosen = selectable.find((c) => c.code === code);

  const tiles = data
    ? [
        { icon: Gauge, label: 'Qualité de vie', value: data.qualityOfLife },
        { icon: ShieldHalf, label: 'Sécurité', value: data.safety },
        { icon: Wallet, label: 'Coût de la vie', value: data.costOfLiving },
      ]
    : [];

  return (
    <section className="px-4 sm:px-8 w-full max-w-4xl mx-auto -mt-6 sm:-mt-10 mb-12 sm:mb-16">
      <div className="rounded-3xl border border-gray-150 bg-white shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-ink">
              Aperçu gratuit — sans compte
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 font-outfit">
              Où souhaitez-vous vous installer ?
            </h2>
          </div>
          <div className="w-full sm:w-64">
            <label htmlFor="preview-dest" className="sr-only">
              Pays de destination
            </label>
            <select
              id="preview-dest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="">Choisir une destination…</option>
              {selectable.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        -- Result area
        {code && (
          <div className="mt-6 border-t border-gray-100 pt-6 animate-in fade-in duration-300">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-brand-ink" />
                Analyse de {chosen?.name}…
              </div>
            ) : (
              <>
                {tiles.some((t) => t.value != null) ? (
                  <div className="grid grid-cols-3 gap-3">
                    {tiles.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                        <Icon className="w-5 h-5 text-brand-ink mx-auto" />
                        <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
                          {value != null ? Math.round(value) : '—'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    {isError ? 'Indices indisponibles pour le moment.' : 'Pas encore de données pour ce pays.'}
                  </p>
                )}

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    Vos démarches, à partir de sources officielles vérifiées.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/onboarding?to=${code}`)}
                    className="inline-flex items-center justify-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
                  >
                    Voir mon plan personnalisé
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 mt-2">
                  Indices Numbeo (0-100, plus haut = mieux ; coût de la vie relatif). Source affichée dans votre plan.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
*/
