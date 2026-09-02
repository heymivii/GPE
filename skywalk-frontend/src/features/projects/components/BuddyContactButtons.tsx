import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buddyContactApi } from '../../../api/buddy-contact';

interface BuddyContactButtonsProps {
  recipientId: number;
  recipientFirstname: string;
  procedureId: number;
  procedureTitle: string;
  countryId: number;
}

export default function BuddyContactButtons({
  recipientId,
  recipientFirstname,
  procedureId,
  procedureTitle,
  countryId,
}: BuddyContactButtonsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handlePrivateMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('loading');
    try {
      await buddyContactApi.sendRequest(recipientId, procedureId);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const forumTitle = encodeURIComponent(`Question sur "${procedureTitle}"`);
  const forumContent = encodeURIComponent(`@${recipientFirstname} `);
  const forumUrl = `/forum/new?title=${forumTitle}&content=${forumContent}&procedureId=${procedureId}&countryId=${countryId}`;

  if (status === 'sent') {
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
