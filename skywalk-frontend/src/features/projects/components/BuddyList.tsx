import { useBuddies } from '../hooks/useBuddies';
import BuddyContactButtons from './BuddyContactButtons';

interface BuddyListProps {
  procedureId: number;
  procedureTitle: string;
  countryId: number;
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

export default function BuddyList({ procedureId, procedureTitle, countryId }: BuddyListProps) {
  const { data: buddies, isLoading, isError } = useBuddies(procedureId, countryId);

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="mt-2 animate-pulse space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-3/4" />
        ))}
      </div>
    );
  }

  if (!buddies || buddies.length === 0) {
    return (
      <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-500">
          Sois le premier a partager ton experience sur cette etape !
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
      <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-2">
        {buddies.length} personne{buddies.length > 1 ? 's ont' : ' a'} fait cette etape
      </p>

      <div className="space-y-3">
        {buddies.map((buddy, index) => (
          <div key={index}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                }`}
              >
                {getInitials(buddy.firstname)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-700 font-medium">{buddy.firstname}</span>
                {buddy.originCountry && (
                  <span className="text-xs text-gray-400"> - {buddy.originCountry}</span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                {getDaysAgo(buddy.completedAt)}
              </span>
            </div>

            <BuddyContactButtons
              recipientId={buddy.idUser}
              recipientFirstname={buddy.firstname}
              procedureId={procedureId}
              procedureTitle={procedureTitle}
              countryId={countryId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
