import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { getBuddies, type Buddy } from '../../../api/buddies';
import { useCountryName } from '../../../hooks/useCountryName';
import BuddyContactButtons from './BuddyContactButtons';

interface StepRef {
  adminProcedureId: number;
  title: string;
}

interface BuddyRow extends Buddy {
  stepTitle: string;
  procedureId: number;
}

function getDaysAgo(dateStr: string): string {
  const diff = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'hier';
  if (diff < 30) return `il y a ${diff}j`;
  if (diff < 60) return 'il y a 1 mois';
  return `il y a ${Math.floor(diff / 30)} mois`;
}

function getInitials(firstname: string): string {
  return firstname.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-orange-400', 'bg-green-600', 'bg-purple-500'];

const PREVIEW_COUNT = 3;

/**
 * Carte « buddies » UNIQUE de la sidebar : agrège les personnes qui ont complété
 * chacune des étapes de la checklist, au lieu de répéter un encart social sous
 * chaque étape. Liste complète dépliable, contact direct depuis chaque ligne.
 */
export default function BuddySidebarCard({
  steps,
  countryId,
}: {
  steps: StepRef[];
  countryId: number;
}) {
  const countryName = useCountryName();
  const [expanded, setExpanded] = useState(false);

  const results = useQueries({
    queries: steps.map((s) => ({
      queryKey: ['buddies', s.adminProcedureId, countryId],
      queryFn: () => getBuddies(s.adminProcedureId, countryId),
      enabled: !!s.adminProcedureId && !!countryId,
      staleTime: 5 * 60 * 1000,
    })),
  });

  if (results.some((r) => r.isLoading)) return null;

  const flat: BuddyRow[] = results
    .flatMap((r, i) =>
      (r.data ?? []).map((b) => ({
        ...b,
        stepTitle: steps[i].title,
        procedureId: steps[i].adminProcedureId,
      })),
    )
    .sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

  // Une ligne PAR PERSONNE (pas par étape complétée) : on garde son étape la plus
  // récente comme légende et on compte les autres.
  const byUser = new Map<number, BuddyRow & { stepCount: number }>();
  for (const row of flat) {
    const existing = byUser.get(row.idUser);
    if (existing) {
      existing.stepCount += 1;
    } else {
      byUser.set(row.idUser, { ...row, stepCount: 1 });
    }
  }
  const rows = [...byUser.values()];

  if (rows.length === 0) {
    return (
      <p className="px-1 text-[13px] text-gray-500 leading-relaxed">
        <Users className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-gray-400" />
        Personne n'a encore partagé son expérience sur ces étapes — sois le premier !
      </p>
    );
  }

  const visible = expanded ? rows : rows.slice(0, PREVIEW_COUNT);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> Ils sont passés par là
      </p>

      <div className="space-y-3">
        {visible.map((row, index) => (
          <div key={`${row.procedureId}-${row.idUser}`} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                AVATAR_COLORS[index % AVATAR_COLORS.length]
              }`}
            >
              {getInitials(row.firstname)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 font-medium truncate">
                {row.firstname}
                {row.originCountry && (
                  // Pays d'ORIGINE du buddy (pas sa destination), dans la langue de
                  // l'interface : « Tene – Germany » se lisait comme une destination.
                  <span className="text-gray-500 font-normal" title="Pays d’origine"> – {countryName(row.originCountry)}</span>
                )}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {row.stepTitle}
                {row.stepCount > 1 && ` +${row.stepCount - 1}`} · {getDaysAgo(row.completedAt)}
              </p>
            </div>
            <BuddyContactButtons
              recipientId={row.idUser}
              recipientFirstname={row.firstname}
              procedureId={row.procedureId}
              procedureTitle={row.stepTitle}
              countryId={countryId}
            />
          </div>
        ))}
      </div>

      {rows.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-center text-xs font-semibold text-brand-ink hover:text-brand-ink-hover"
        >
          {expanded ? 'Réduire' : `Voir les ${rows.length} buddies`}
        </button>
      )}
    </div>
  );
}
