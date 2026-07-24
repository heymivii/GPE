import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../lib/api';
import { buddyContactApi, type BuddyContactRequest } from '../api/buddy-contact';
import { useAuth } from '../hooks/useAuth';

interface NotificationItem {
  idNotification: number;
  notifType: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notification');
      return res.data;
    },
    refetchInterval: 15000,
  });

  const { data: contactRequests } = useQuery<BuddyContactRequest[]>({
    queryKey: ['buddy-contact-requests'],
    queryFn: buddyContactApi.getMyRequests,
    refetchInterval: 15000,
  });

  const pendingRequests = (contactRequests ?? []).filter(
    (r) => r.status === 'pending' && r.recipient.idUser === user?.idUser,
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = (notifications?.filter((n) => !n.isRead).length ?? 0);
  const badgeCount = unreadCount + pendingRequests.length;

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notification/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      // silent fail
    }
  };

  const respondToRequest = async (requestId: number, accept: boolean) => {
    try {
      await buddyContactApi.respond(requestId, accept);
      queryClient.invalidateQueries({ queryKey: ['buddy-contact-requests'] });
      queryClient.invalidateQueries({ queryKey: ['buddy-conversations'] });
    } catch {
      // silent fail
    }
  };

  const getDaysAgo = (dateStr: string): string => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return 'hier';
    return `il y a ${diff}j`;
  };

  // Les notifications qui correspondent a une demande de contact deja affichee
  // dans pendingRequests sont filtrees pour eviter le doublon visuel.
  const regularNotifications = (notifications ?? []).filter(
    (n) => !n.message.includes('souhaite vous contacter'),
  );

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-4 h-4 text-gray-600" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
          </div>

          {pendingRequests.length === 0 && regularNotifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              Aucune notification pour le moment
            </p>
          ) : (
            <>
              {pendingRequests.map((req) => (
                <div
                  key={`req-${req.id}`}
                  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 bg-blue-50"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        {req.sender.firstName} souhaite vous contacter a propos de "{req.procedure.procedureType}"
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{getDaysAgo(req.createdAt)}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => respondToRequest(req.id, true)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => respondToRequest(req.id, false)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        >
                          Decliner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {regularNotifications.map((notif) => (
                <button
                  key={notif.idNotification}
                  onClick={() => markAsRead(notif.idNotification)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{getDaysAgo(notif.sentAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1 px-2">
            <Link
              to="/messages"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-blue-600 py-2 hover:bg-blue-50 rounded-lg"
            >
              Voir mes messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
