import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Clock, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { notificationsApi, type AppNotification } from '../../api/notifications';
import { buddyContactApi, type BuddyContactRequest } from '../../api/buddy-contact';
import { pmKeys } from '../../hooks/usePrivateMessages';
import { useAuth } from '../../hooks/useAuth';

/**
 * Cloche de notifications de l'utilisateur (barre principale, thème clair).
 * Les rappels d'échéance ('reminder') et décisions ('info') y arrivent ; ceux qui
 * portent un contexte (ex. projet) sont cliquables et ouvrent l'écran concerné.
 * Les demandes de contact "buddy" (Système Buddy, cf. checklist) s'affichent en
 * tête, avec accepter/refuser — une fois acceptées, la conversation se poursuit
 * dans la messagerie privée générale (/messages).
 */

// Mappe le contexte sémantique d'une notif vers une route front (ou null si non-cliquable).
function notifLink(n: AppNotification): string | null {
  if (n.contextType === 'project' && n.contextId) {
    return `/projects/${n.contextId}/checklist`;
  }
  // F2 — un nouveau message dans une discussion suivie ouvre le sujet.
  if (n.contextType === 'forum-topic' && n.contextId) {
    return `/forum/post/${n.contextId}`;
  }
  // Demande de contact buddy acceptée → ouvre directement la conversation.
  // Le nom passe en query param : tant qu'aucun message n'a encore été échangé,
  // il n'existe aucune conversation dont on pourrait déduire le nom du contact.
  if (n.contextType === 'user' && n.contextId) {
    const name = n.contextLabel ? `&name=${encodeURIComponent(n.contextLabel)}` : '';
    return `/messages?to=${n.contextId}${name}`;
  }
  return null;
}

function daysAgo(dateStr: string): string {
  const diff = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return "aujourd'hui";
  if (diff === 1) return 'hier';
  return `il y a ${diff}j`;
}

function typeVisual(notifType: string) {
  switch (notifType) {
    case 'reminder':
      return { Icon: Clock, cls: 'bg-amber-50 text-amber-500' };
    case 'alert':
      return { Icon: AlertTriangle, cls: 'bg-amber-50 text-amber-600' };
    default:
      return { Icon: Info, cls: 'bg-[#5EA3C0]/10 text-[#5EA3C0]' };
  }
}

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: notificationsApi.listMine,
    refetchInterval: 30000, // les rappels doivent apparaître sans recharger
  });

  const { data: contactRequests = [] } = useQuery<BuddyContactRequest[]>({
    queryKey: ['buddy-contact-requests'],
    queryFn: buddyContactApi.getMyRequests,
    refetchInterval: 30000,
  });

  const pendingRequests = contactRequests.filter(
    (r) => r.status === 'pending' && r.recipient.idUser === user?.idUser,
  );

  // Les demandes de contact buddy sont déjà représentées par la carte actionnable
  // ci-dessus (accepter/décliner) — on évite le doublon dans la liste générale.
  const regularNotifications = notifications.filter((n) => n.contextType !== 'buddy-request');
  const unread = regularNotifications.filter((n) => !n.isRead);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['my-notifications'] });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: invalidate,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      buddyContactApi.respond(id, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buddy-contact-requests'] });
      queryClient.invalidateQueries({ queryKey: pmKeys.conversations() });
    },
  });

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) markReadMutation.mutate(n.idNotification);
    const link = notifLink(n);
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label={t('notifications.aria', {
          count: unread.length,
          defaultValue: '{{count}} unread notification(s)',
        })}
      >
        <Bell className="w-5 h-5" />
        {unread.length + pendingRequests.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread.length + pendingRequests.length > 9 ? '9+' : unread.length + pendingRequests.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(360px,92vw)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              {t('notifications.title', { defaultValue: 'Notifications' })}
            </span>
            {unread.length > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#5EA3C0] hover:text-[#4891b0] disabled:opacity-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('notifications.markAllRead', { defaultValue: 'Mark all read' })}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {pendingRequests.map((req) => (
              <div key={`buddy-req-${req.id}`} className="px-4 py-3 bg-[#5EA3C0]/5">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">{req.sender.firstName}</span> souhaite vous
                  contacter à propos de « {req.procedure.procedureType} »
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{daysAgo(req.createdAt)}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => respondMutation.mutate({ id: req.id, accept: true })}
                    disabled={respondMutation.isPending}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => respondMutation.mutate({ id: req.id, accept: false })}
                    disabled={respondMutation.isPending}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                  >
                    Décliner
                  </button>
                </div>
              </div>
            ))}

            {regularNotifications.length === 0 && pendingRequests.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                {t('notifications.empty', { defaultValue: 'No notifications.' })}
              </p>
            ) : (
              regularNotifications.slice(0, 30).map((n) => {
                const { Icon, cls } = typeVisual(n.notifType);
                const clickable = !!notifLink(n);
                return (
                  <div
                    key={n.idNotification}
                    onClick={() => handleClick(n)}
                    className={`px-4 py-3 flex items-start gap-2.5 transition-colors ${
                      n.isRead ? 'opacity-60' : 'bg-[#5EA3C0]/5'
                    } ${clickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  >
                    <span className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${cls}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.sentAt)}</p>
                    </div>
                    {clickable && (
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    )}
                    {!n.isRead && !clickable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markReadMutation.mutate(n.idNotification);
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
                        title={t('notifications.markRead', { defaultValue: 'Mark as read' })}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
