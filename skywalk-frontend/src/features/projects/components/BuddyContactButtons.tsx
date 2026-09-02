import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, MessageCircle, Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buddyContactApi, type BuddyContactRequest } from '../../../api/buddy-contact';
import { useAuth } from '../../../hooks/useAuth';

interface BuddyContactButtonsProps {
  recipientId: number;
  recipientFirstname: string;
  procedureId: number;
  procedureTitle: string;
  countryId: number;
}

/**
 * Actions de contact d'un buddy, compactées dans un menu « ⋯ » (un roster peut
 * afficher jusqu'à 3 buddies : deux boutons chacun surchargeaient la carte).
 * L'état est PERSISTÉ : on lit la même query que la cloche de notifications
 * (['buddy-contact-requests']), qu'elle invalide quand le destinataire répond.
 * - acceptée  → pastille verte « Ouvrir la conversation » (1 clic, hors menu)
 * - pending   → « En attente » (rien à cliquer)
 * - déclinée/expirée → le menu revient, on peut redemander
 */
export default function BuddyContactButtons({
  recipientId,
  recipientFirstname,
  procedureId,
  procedureTitle,
  countryId,
}: BuddyContactButtonsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myRequests = [] } = useQuery<BuddyContactRequest[]>({
    queryKey: ['buddy-contact-requests'],
    queryFn: buddyContactApi.getMyRequests,
    enabled: !!user,
  });

  // Ma demande vers CE buddy pour CETTE démarche (liste triée du plus récent
  // au plus ancien côté backend) — seule la plus récente compte.
  const existing = myRequests.find(
    (r) =>
      r.sender?.idUser === user?.idUser &&
      r.recipient?.idUser === recipientId &&
      r.procedure?.idAdminProcedure === procedureId,
  );

  const handlePrivateMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setStatus('loading');
    try {
      await buddyContactApi.sendRequest(recipientId, procedureId);
      setStatus('sent');
      queryClient.invalidateQueries({ queryKey: ['buddy-contact-requests'] });
    } catch {
      setStatus('error');
    }
  };

  const forumTitle = encodeURIComponent(`Question sur "${procedureTitle}"`);
  const forumContent = encodeURIComponent(`@${recipientFirstname} `);
  const forumUrl = `/forum/new?title=${forumTitle}&content=${forumContent}&procedureId=${procedureId}&countryId=${countryId}`;

  // Demande acceptée → la mise en relation existe : accès direct, hors menu.
  if (existing?.status === 'accepted') {
    return (
      <Link
        to={`/messages?to=${recipientId}&name=${encodeURIComponent(recipientFirstname)}`}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <MessageCircle className="w-3 h-3" />
        Ouvrir la conversation
      </Link>
    );
  }

  if (existing?.status === 'pending' || status === 'sent' || status === 'loading') {
    return (
      <span className="text-[11px] text-blue-600">
        Demande envoyee - en attente de reponse
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        aria-label={`Contacter ${recipientFirstname}`}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
        className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {menuOpen && (
        <>
          {/* Ferme le menu au clic n'importe où ailleurs */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
            <button
              onClick={(e) => handlePrivateMessage(e)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message prive
            </button>
            <Link
              to={forumUrl}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Via le forum
            </Link>
          </div>
        </>
      )}

      {status === 'error' && (
        <p className="text-[11px] text-red-500 absolute right-0 mt-1 whitespace-nowrap">
          Erreur - reessaie plus tard
        </p>
      )}
    </div>
  );
}
