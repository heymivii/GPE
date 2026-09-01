import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { notificationsApi, type AppNotification } from '../../../api/notifications';

/**
 * Admin notification bell: unread badge + dropdown. Review requests ('alert') land here —
 * "Pays « Canada » ajouté par Aminata — vérification requise avant publication."
 */
const PANEL_WIDTH = 360;

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  // Fixed-position anchor: the bell lives inside the 256px sidebar (overflow clips absolute
  // children), so the panel is rendered `fixed` next to the bell and clamped to the viewport.
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        top: r.bottom + 8,
        left: Math.max(8, Math.min(r.left, window.innerWidth - PANEL_WIDTH - 8)),
      });
    }
    setOpen((o) => !o);
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: notificationsApi.listMine,
    refetchInterval: 30000, // review requests should surface without a reload
  });

  const unread = notifications.filter((n) => !n.isRead);

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const typeDot = (n: AppNotification) =>
    n.notifType === 'alert' ? 'bg-amber-400' : 'bg-[#5EA3C0]';

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
        aria-label={`Notifications (${unread.length} non lue(s))`}
      >
        <Bell className="w-5 h-5" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
          style={{ top: panelPos.top, left: panelPos.left, width: `min(${PANEL_WIDTH}px, 94vw)` }}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">Notifications</span>
            <span className="text-xs text-gray-400">{unread.length} non lue(s)</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Aucune notification.</p>
            ) : (
              notifications.slice(0, 30).map((n) => (
                <div
                  key={n.idNotification}
                  className={`px-4 py-3 flex items-start gap-2.5 ${n.isRead ? 'opacity-60' : 'bg-blue-50/40'}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${typeDot(n)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.sentAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(n.idNotification)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
                      title="Marquer comme lue"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
