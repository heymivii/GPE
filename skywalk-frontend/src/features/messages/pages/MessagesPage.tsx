import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { buddyMessagesApi, type BuddyConversation } from '../../../api/buddy-messages';

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConvs } = useQuery<BuddyConversation[]>({
    queryKey: ['buddy-conversations'],
    queryFn: buddyMessagesApi.getConversations,
  });

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['buddy-messages', selectedId],
    queryFn: () => buddyMessagesApi.getMessages(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (selectedId) {
      buddyMessagesApi.markAsRead(selectedId).catch(() => {});
    }
  }, [selectedId, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedId) return;
    const content = draft;
    setDraft('');
    try {
      await buddyMessagesApi.sendMessage(selectedId, content);
      queryClient.invalidateQueries({ queryKey: ['buddy-messages', selectedId] });
    } catch {
      setDraft(content);
    }
  };

  const getOtherPerson = (conv: BuddyConversation) => {
    if (!user) return conv.sender;
    return conv.sender.idUser === user.idUser ? conv.recipient : conv.sender;
  };

  const selectedConv = conversations?.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>

        <div className="bg-white border border-gray-100 rounded-xl flex h-[600px] overflow-hidden">
          {/* Liste des conversations */}
          <div className="w-1/3 border-r border-gray-100 overflow-y-auto">
            {loadingConvs ? (
              <p className="p-4 text-sm text-gray-400">Chargement...</p>
            ) : !conversations || conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">
                Aucune conversation pour le moment. Acceptez ou envoyez une demande de contact Buddy pour démarrer.
              </p>
            ) : (
              conversations.map((conv) => {
                const other = getOtherPerson(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedId === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{other.firstName}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.procedure.procedureType}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Thread */}
          <div className="flex-1 flex flex-col">
            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                Sélectionne une conversation
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedConv ? getOtherPerson(selectedConv).firstName : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConv?.procedure.procedureType}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {loadingMsgs ? (
                    <p className="text-sm text-gray-400">Chargement...</p>
                  ) : !messages || messages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-8">
                      Aucun message. Lance la conversation !
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === user?.idUser;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Écrire un message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                  >
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
