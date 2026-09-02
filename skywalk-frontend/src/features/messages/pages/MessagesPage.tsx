import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Send, Loader2, MessagesSquare, Flag, ArrowLeft, BadgeCheck, Users } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import {
  useConversations,
  useThread,
  useSendMessage,
  pmKeys,
} from '../../../hooks/usePrivateMessages';
import { userReportApi } from '../../../api/user-report';

export default function MessagesPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();

  const toParam = params.get('to');
  const nameParam = params.get('name');
  const [selectedId, setSelectedId] = useState<number | null>(
    toParam ? Number(toParam) : null,
  );
  const [draft, setDraft] = useState('');
  // La messagerie mélange experts et buddies : on les distingue et on filtre.
  const [filter, setFilter] = useState<'all' | 'experts' | 'buddies'>('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convLoading } = useConversations();
  const { data: thread = [], isLoading: threadLoading } = useThread(
    selectedId ?? 0,
    !!selectedId,
  );
  const sendMutation = useSendMessage();

  // Nom de l'interlocuteur : conversation existante, sinon le ?name (venu de la fiche expert).
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.userId === selectedId),
    [conversations, selectedId],
  );
  const selectedName =
    selectedConversation?.fullName || nameParam || t('messages.member', { defaultValue: 'Membre' });

  const visibleConversations = useMemo(() => {
    if (filter === 'experts') return conversations.filter((c) => c.isExpert);
    if (filter === 'buddies') return conversations.filter((c) => (c.buddyTopics?.length ?? 0) > 0);
    return conversations;
  }, [conversations, filter]);

  // Ouvrir un fil marque les reçus comme lus côté serveur → on rafraîchit les compteurs.
  useEffect(() => {
    if (selectedId && !threadLoading) {
      queryClient.invalidateQueries({ queryKey: pmKeys.unread() });
      queryClient.invalidateQueries({ queryKey: pmKeys.conversations() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, thread.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, selectedId]);

  const fmtTime = (d: string) =>
    new Date(d).toLocaleString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !selectedId) return;
    sendMutation.mutate(
      { recipientId: selectedId, content },
      {
        onSuccess: () => setDraft(''),
        onError: (e: any) =>
          toast.error(e?.response?.data?.message || t('common.error', { defaultValue: 'Erreur' })),
      },
    );
  };

  const reportMember = () => {
    if (!selectedId) return;
    userReportApi
      .create({ reportedUserId: selectedId, reason: 'harassment' })
      .then(() => toast.success(t('messages.reported', { defaultValue: 'Membre signalé' })))
      .catch(() => toast.error(t('common.error', { defaultValue: 'Erreur' })));
  };

  const select = (userId: number) => {
    setSelectedId(userId);
    setParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t('messages.title', { defaultValue: 'Messages' })}
        description={t('messages.subtitle', {
          defaultValue: 'Vos échanges privés avec les membres et les experts.',
        })}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 sm:grid-cols-[280px_1fr] min-h-[60vh]">
          {/* Liste des conversations */}
          <aside
            className={`border-r border-gray-100 ${selectedId ? 'hidden sm:block' : 'block'}`}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {t('messages.conversations', { defaultValue: 'Conversations' })}
              </p>
              <div className="flex gap-1">
                {(
                  [
                    ['all', t('messages.filterAll', { defaultValue: 'Tous' })],
                    ['experts', t('messages.filterExperts', { defaultValue: 'Experts' })],
                    ['buddies', t('messages.filterBuddies', { defaultValue: 'Buddies' })],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors ${
                      filter === id
                        ? 'bg-[#5EA3C0]/10 text-[#4A8BA0]'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {convLoading ? (
              <div className="flex justify-center py-10 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : visibleConversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-400 text-center">
                {t('messages.empty', { defaultValue: 'Aucune conversation.' })}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {visibleConversations.map((c) => (
                  <li key={c.userId}>
                    <button
                      onClick={() => select(c.userId)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-2 ${
                        selectedId === c.userId ? 'bg-[#5EA3C0]/5' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold flex-shrink-0">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                            <span className="truncate">{c.fullName}</span>
                            {c.isExpert && (
                              <span
                                title={c.expertTitle || 'Expert vérifié'}
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0"
                              >
                                <BadgeCheck className="w-2.5 h-2.5" />
                                Expert
                              </span>
                            )}
                            {(c.buddyTopics?.length ?? 0) > 0 && (
                              <span
                                title={c.buddyTopics!.join(' · ')}
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-purple-50 text-purple-600 flex-shrink-0"
                              >
                                <Users className="w-2.5 h-2.5" />
                                Buddy
                              </span>
                            )}
                          </p>
                          {c.unread > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {c.unread > 9 ? '9+' : c.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Fil de discussion */}
          <section className={`flex flex-col ${selectedId ? 'flex' : 'hidden sm:flex'}`}>
            {!selectedId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-2 p-8">
                <MessagesSquare className="w-10 h-10 text-gray-300" />
                <p className="text-sm">
                  {t('messages.pickConversation', {
                    defaultValue: 'Sélectionnez une conversation.',
                  })}
                </p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="sm:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                    aria-label={t('common.back', { defaultValue: 'Retour' })}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                      <span className="truncate">{selectedName}</span>
                      {selectedConversation?.isExpert && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">
                          <BadgeCheck className="w-3 h-3" />
                          {selectedConversation.expertTitle || 'Expert'}
                        </span>
                      )}
                    </p>
                    {(selectedConversation?.buddyTopics?.length ?? 0) > 0 && (
                      // Le fil est né d'une mise en relation buddy : rappeler sur
                      // quelle(s) étape(s) de la checklist porte l'entraide.
                      <p className="text-[11px] text-gray-400 truncate">
                        {t('messages.buddyAbout', { defaultValue: 'À propos de :' })}{' '}
                        {selectedConversation!.buddyTopics!.join(' · ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={reportMember}
                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                    title={t('messages.report', { defaultValue: 'Signaler ce membre' })}
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 max-h-[50vh]">
                  {threadLoading ? (
                    <div className="flex justify-center py-8 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : thread.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">
                      {t('messages.startConversation', {
                        defaultValue: 'Écrivez le premier message.',
                      })}
                    </p>
                  ) : (
                    thread.map((m) => (
                      <div
                        key={m.idPrivateMessage}
                        className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                            m.mine
                              ? 'bg-[#5EA3C0] text-white rounded-br-sm'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p className={`text-[10px] mt-1 ${m.mine ? 'text-white/70' : 'text-gray-400'}`}>
                            {fmtTime(m.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-gray-100 p-3 flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    placeholder={t('messages.placeholder', { defaultValue: 'Votre message…' })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5EA3C0] outline-none resize-none max-h-32"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMutation.isPending}
                    className="p-2.5 bg-[#5EA3C0] text-white rounded-lg hover:bg-[#4891b0] disabled:opacity-50 transition-colors"
                    aria-label={t('messages.send', { defaultValue: 'Envoyer' })}
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
