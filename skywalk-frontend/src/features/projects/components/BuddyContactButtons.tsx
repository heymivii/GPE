import { useState } from 'react';
import { Link } from 'react-router-dom';
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
 * L'état du contact est PERSISTÉ : on lit la même query que la cloche de
 * notifications (['buddy-contact-requests']), qu'elle invalide quand le
 * destinataire répond. Ainsi le bouton survit au rechargement et se met à
 * jour quand la demande est acceptée — une demande déclinée ou expirée
 * redevient sollicitable.
 */
export default function BuddyContactButtons({
  recipientId,
  recipientFirstname,
  procedureId,
  procedureTitle,
  countryId,
}: BuddyContactButtonsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
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

  // Demande acceptée → la mise en relation existe : on ouvre la conversation.
  if (existing?.status === 'accepted') {
    return (
      <div className="flex gap-2 mt-1 flex-wrap">
        <Link
          to={`/messages?to=${recipientId}&name=${encodeURIComponent(recipientFirstname)}`}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ouvrir la conversation
        </Link>
      </div>
    );
  }

  if (existing?.status === 'pending' || status === 'sent') {
    return (
      <p className="text-xs text-blue-600 mt-1">
        Demande envoyee - en attente de reponse
      </p>
    );
  }

  return (
    <div className="flex gap-2 mt-1 flex-wrap">
      <button
        onClick={(e) => handlePrivateMessage(e)}
        disabled={status === 'loading'}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? '...' : 'Message prive'}
      </button>

      <Link
        to={forumUrl}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        Via le forum
      </Link>

      {status === 'error' && (
        <p className="text-[11px] text-red-500 w-full">
          Erreur - reessaie plus tard
        </p>
      )}
    </div>
  );
}
