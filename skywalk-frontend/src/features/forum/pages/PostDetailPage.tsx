import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Clock,
  MessageCircle,
  Loader2,
  AlertCircle,
  Send,
  Edit,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { 
  useForumTopic, 
  useCreateForumMessage, 
  useUpdateForumMessage, 
  useDeleteForumMessage 
} from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';

const categoryConfig: Record<string, { name: string; icon: string; color: string }> = {
  question: { name: 'Question', icon: '❓', color: 'bg-blue-50 text-blue-700' },
  testimony: { name: 'Témoignage', icon: '📝', color: 'bg-green-50 text-green-700' },
  advice: { name: 'Conseil', icon: '💡', color: 'bg-yellow-50 text-yellow-700' },
  discussion: { name: 'Discussion', icon: '💬', color: 'bg-purple-50 text-purple-700' },
  announcement: { name: 'Annonce', icon: '📢', color: 'bg-red-50 text-red-700' },
  other: { name: 'Autre', icon: '📌', color: 'bg-gray-50 text-gray-700' }
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const topicId = id ? parseInt(id) : 0;
  const { data: topic, isLoading, error } = useForumTopic(topicId);
  const createMessage = useCreateForumMessage();
  const updateMessage = useUpdateForumMessage();
  const deleteMessage = useDeleteForumMessage();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté pour répondre');
      navigate('/auth/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('Le contenu est requis');
      return;
    }

    try {
      const userId = user.idUser || user.id;
      if (!userId) {
        alert('Erreur ID utilisateur');
        return;
      }

      await createMessage.mutateAsync({
        content: replyContent.trim(),
        idTopic: topicId,
        idUser: userId,
      });

      setReplyContent('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    }
  };

  const handleStartEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: number) => {
    if (!editContent.trim()) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    try {
      await updateMessage.mutateAsync({
        id: messageId,
        data: { content: editContent.trim() },
        topicId: topicId,
      });
      
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      await deleteMessage.mutateAsync({
        id: messageId,
        topicId: topicId,
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du topic...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-red-800 font-semibold mb-2">Topic introuvable</h2>
            <p className="text-red-600 mb-4">
              {error?.message || 'Le topic demandé n\'existe pas'}
            </p>
            <Link
              to="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = categoryConfig[topic.category || 'other'];
  const messages = topic.messages || [];

  const initialMessage = messages.length > 0 ? messages[0] : null;
  const replies = messages.length > 1 ? messages.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au forum
          </Link>
        </div>

        {/* Topic principal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{categoryInfo?.icon || '📌'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo?.color || 'bg-gray-100'}`}>
                  {categoryInfo?.name || 'Autre'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {topic.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(topic.created_at)}
                </span>
                <span>Par {topic.user?.fullName || `Utilisateur #${topic.user?.idUser}`}</span>
                {topic.country && <span>📍 {topic.country.name}</span>}
              </div>
            </div>
            
            {user && (user.idUser === topic.user?.idUser || user.id === topic.user?.idUser) && (
              <Link
                to={`/forum/post/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
            )}
          </div>
        </div>

        {initialMessage && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {initialMessage.user?.fullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">
                    {initialMessage.user?.fullName || `Utilisateur #${initialMessage.user?.idUser}`}
                  </span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(initialMessage.sent_at)}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    Auteur
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {initialMessage.content}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {replies.length} {replies.length === 1 ? 'Réponse' : 'Réponses'}
          </h2>

          {replies.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Aucune réponse pour le moment</p>
              <p className="text-sm text-gray-500">Soyez le premier à répondre !</p>
            </div>
          )}

          {replies.map((message) => {
            const isOwner = user && (user.idUser === message.user?.idUser || user.id === message.user?.idUser);
            const isEditing = editingMessageId === message.message_id;
            
            return (
              <div key={message.message_id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {message.user?.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          {message.user?.fullName || `Utilisateur #${message.user?.idUser}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(message.sent_at)}
                        </span>
                      </div>

                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(message.message_id, message.content)}
                            disabled={deleteMessage.isPending}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(message.message_id)}
                            disabled={deleteMessage.isPending}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deleteMessage.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                          rows={4}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(message.message_id)}
                            disabled={updateMessage.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateMessage.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Enregistrer
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updateMessage.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {user ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Votre réponse</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!replyContent.trim() || createMessage.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMessage.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publier la réponse
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-yellow-800 font-semibold mb-2">Connexion requise</h3>
            <p className="text-yellow-700 mb-4">Vous devez être connecté pour répondre</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
