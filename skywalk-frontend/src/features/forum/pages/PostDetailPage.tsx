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
  Check,
  Flag,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Shield,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { 
  useForumTopic, 
  useCreateForumMessage, 
  useUpdateForumMessage, 
  useDeleteForumMessage,
  useReportContent,
  useLockTopic,
  usePinTopic,
  useModeratorDeleteMessage,
  useModeratorDeleteTopic,
} from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import type { ReportReason } from '../../../types/forum';
import { ReportReasonValues } from '../../../types/forum';

const categoryColors: Record<string, string> = {
  question: 'bg-blue-50 text-blue-700',
  testimony: 'bg-green-50 text-green-700',
  advice: 'bg-yellow-50 text-yellow-700',
  discussion: 'bg-purple-50 text-purple-700',
  announcement: 'bg-red-50 text-red-700',
  other: 'bg-gray-50 text-gray-700',
};
const categoryIcons: Record<string, string> = {
  question: '❓', testimony: '📝', advice: '💡', discussion: '�', announcement: '📢', other: '📌',
};

export default function PostDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetMessageId, setReportTargetMessageId] = useState<number | undefined>(undefined);
  const [reportTargetTopicId, setReportTargetTopicId] = useState<number | undefined>(undefined);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDetails, setReportDetails] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error');

  const showFeedback = (message: string, type: 'error' | 'success' = 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    if (type === 'success') {
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const clearFeedback = () => setFeedbackMessage(null);
  const topicId = id ? parseInt(id) : 0;
  const { data: topic, isLoading, error } = useForumTopic(topicId);
  const createMessage = useCreateForumMessage();
  const updateMessage = useUpdateForumMessage();
  const deleteMessage = useDeleteForumMessage();
  const reportContent = useReportContent();
  const lockTopic = useLockTopic();
  const pinTopic = usePinTopic();
  const modDeleteMessage = useModeratorDeleteMessage();
  const modDeleteTopic = useModeratorDeleteTopic();

  const isModOrAdmin = user?.userRole === 'admin' || user?.userRole === 'moderator';
  const isTopicLocked = topic?.is_locked ?? false;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    
    if (!user) {
      showFeedback(t('forum.postDetail.mustBeLoggedIn'));
      navigate('/auth/login');
      return;
    }

    if (!replyContent.trim()) {
      showFeedback(t('forum.postDetail.contentRequired'));
      return;
    }

    try {
      const userId = user.idUser || user.id;
      if (!userId) {
        showFeedback(t('forum.postDetail.userIdError'));
        return;
      }

      await createMessage.mutateAsync({
        content: replyContent.trim(),
        topicId: topicId,
      });

      setReplyContent('');
      showFeedback(t('forum.postDetail.replySuccess'), 'success');
    } catch (error: unknown) {
      console.error('Error:', error);
      const axiosErr = error as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr?.response?.status === 400 && axiosErr.response.data?.message) {
        showFeedback(axiosErr.response.data.message);
      } else {
        showFeedback(t('forum.postDetail.publishError'));
      }
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
      showFeedback(t('forum.postDetail.contentEmpty'));
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
      showFeedback(t('forum.postDetail.editSuccess'), 'success');
    } catch (error: unknown) {
      console.error('Error:', error);
      const axiosErr = error as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr?.response?.status === 400 && axiosErr.response.data?.message) {
        showFeedback(axiosErr.response.data.message);
      } else {
        showFeedback(t('forum.postDetail.editError'));
      }
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!window.confirm(t('forum.postDetail.confirmDelete'))) {
      return;
    }

    clearFeedback();
    try {
      await deleteMessage.mutateAsync({
        id: messageId,
        topicId: topicId,
      });
      showFeedback(t('forum.postDetail.deleteSuccess'), 'success');
    } catch (error) {
      console.error('Error:', error);
      showFeedback(t('forum.postDetail.deleteError'));
    }
  };


  const openReportModal = (messageId?: number, topicIdTarget?: number) => {
    setReportTargetMessageId(messageId);
    setReportTargetTopicId(topicIdTarget);
    setReportReason('spam');
    setReportDetails('');
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportTargetMessageId(undefined);
    setReportTargetTopicId(undefined);
  };

  const handleSubmitReport = async () => {
    if (!user) return;
    const userId = user.idUser || user.id;
    if (!userId) return;

    try {
      await reportContent.mutateAsync({
        messageId: reportTargetMessageId,
        topicId: reportTargetTopicId,
        reason: reportReason,
        details: reportDetails || undefined,
      });
      closeReportModal();
      showFeedback(t('forum.postDetail.reportSuccess'), 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      closeReportModal();
      if (axiosErr?.response?.status === 409) {
        showFeedback(t('forum.postDetail.reportAlreadySubmitted'));
      } else {
        showFeedback(t('forum.postDetail.reportError'));
      }
    }
  };


  const handleLockTopic = async () => {
    try {
      await lockTopic.mutateAsync(topicId);
    } catch (err) {
      console.error('Lock error:', err);
    }
  };

  const handlePinTopic = async () => {
    try {
      await pinTopic.mutateAsync(topicId);
    } catch (err) {
      console.error('Pin error:', err);
    }
  };

  const handleModDeleteTopic = async () => {
    if (!window.confirm(t('forum.postDetail.moderation.confirmDeleteTopic'))) return;
    try {
      await modDeleteTopic.mutateAsync(topicId);
      navigate('/forum');
    } catch (err) {
      console.error('Delete topic error:', err);
    }
  };

  const handleModDeleteMessage = async (messageId: number) => {
    if (!window.confirm(t('forum.postDetail.moderation.confirmDeleteMessage'))) return;
    try {
      await modDeleteMessage.mutateAsync({ id: messageId, topicId });
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('forum.timeAgo.lessThanHour');
    if (diffInHours < 24) return t('forum.timeAgo.hours', { count: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('forum.timeAgo.days', { count: diffInDays });
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">{t('forum.postDetail.loading')}</p>
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
            <h2 className="text-red-800 font-semibold mb-2">{t('forum.postDetail.notFound')}</h2>
            <p className="text-red-600 mb-4">
              {error?.message || t('forum.postDetail.notFoundDesc')}
            </p>
            <Link
              to="/forum"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('forum.postDetail.backToForum')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cat = topic.category || 'other';
  const catColor = categoryColors[cat] || 'bg-gray-100';
  const catIcon = categoryIcons[cat] || '📌';
  const catName = t(`forum.categories.${cat}.name`);
  const messages = topic.messages || [];

  const initialMessage = messages.length > 0 ? messages[0] : null;
  const replies = messages.length > 1 ? messages.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forum.postDetail.backToForum')}
          </Link>
        </div>

        {feedbackMessage && (
          <div
            className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              feedbackType === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            {feedbackType === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            <span className="flex-1">{feedbackMessage}</span>
            <button
              onClick={clearFeedback}
              className={`p-1 rounded hover:bg-black/5 ${
                feedbackType === 'error' ? 'text-red-500' : 'text-green-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{catIcon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${catColor}`}>
                  {catName}
                </span>
                {topic.is_pinned && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {t('forum.postDetail.moderation.pinned')}
                  </span>
                )}
                {topic.is_locked && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {t('forum.postDetail.moderation.lockTopic')}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {topic.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(topic.created_at)}
                </span>
                <span>{t('forum.postDetail.by', { name: topic.user?.fullName || t('forum.user', { id: topic.user?.idUser }) })}</span>
                {topic.country?.countryName && (
                  <span className="flex items-center gap-1">
                    📍 {topic.country.countryName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => openReportModal(undefined, topicId)}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  title={t('forum.postDetail.reportTopic')}
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
              {user && (user.idUser === topic.user?.idUser || user.id === topic.user?.idUser) && (
                <Link
                  to={`/forum/post/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {t('forum.postDetail.edit')}
                </Link>
              )}
            </div>
          </div>

          {isModOrAdmin && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600 mr-2">Modération</span>
              <button
                onClick={handleLockTopic}
                disabled={lockTopic.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {topic.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {topic.is_locked ? t('forum.postDetail.moderation.unlockTopic') : t('forum.postDetail.moderation.lockTopic')}
              </button>
              <button
                onClick={handlePinTopic}
                disabled={pinTopic.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {topic.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                {topic.is_pinned ? t('forum.postDetail.moderation.unpinTopic') : t('forum.postDetail.moderation.pinTopic')}
              </button>
              <button
                onClick={handleModDeleteTopic}
                disabled={modDeleteTopic.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('forum.postDetail.moderation.deleteTopic')}
              </button>
            </div>
          )}
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
                    {initialMessage.user?.fullName || t('forum.user', { id: initialMessage.user?.idUser })}
                  </span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(initialMessage.sent_at)}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {t('forum.postDetail.author')}
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
            {t('forum.postDetail.repliesCount', { count: replies.length })}
          </h2>

          {replies.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">{t('forum.postDetail.noReplies')}</p>
              <p className="text-sm text-gray-500">{t('forum.postDetail.beFirst')}</p>
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
                          {message.user?.fullName || t('forum.user', { id: message.user?.idUser })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(message.sent_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {user && !isOwner && (
                          <button
                            onClick={() => openReportModal(message.message_id)}
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                            title={t('forum.postDetail.reportMessage')}
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}

                        {isOwner && !isEditing && (
                          <>
                            <button
                              onClick={() => handleStartEdit(message.message_id, message.content)}
                              disabled={deleteMessage.isPending}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                              title={t('forum.postDetail.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(message.message_id)}
                              disabled={deleteMessage.isPending}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title={t('forum.postDetail.confirmDelete')}
                            >
                              {deleteMessage.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}

                        {isModOrAdmin && !isOwner && (
                          <button
                            onClick={() => handleModDeleteMessage(message.message_id)}
                            disabled={modDeleteMessage.isPending}
                            className="p-1.5 text-purple-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title={t('forum.postDetail.moderation.deleteMessage')}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
                                {t('forum.postDetail.saving')}
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                {t('forum.postDetail.save')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updateMessage.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            {t('forum.postDetail.cancel')}
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
          isTopicLocked ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-700 font-medium">{t('forum.postDetail.moderation.locked')}</p>
            </div>
          ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
            {createMessage.isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">{t('forum.postDetail.publishing')}</span>
                </div>
              </div>
            )}
            <h3 className="font-semibold text-gray-900 mb-4">{t('forum.postDetail.yourReply')}</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('forum.postDetail.writePlaceholder')}
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
                      {t('forum.postDetail.publishing')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('forum.postDetail.publishReply')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          )
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#5EA3C0] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('forum.postDetail.joinConversation')}</h3>
              <p className="text-gray-600 mb-6">
                {t('forum.postDetail.joinDesc')}
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/auth/register"
                  className="px-6 py-3 bg-[#5EA3C0] text-white font-semibold rounded-full hover:bg-[#4d8a9d] transition-colors"
                >
                  {t('forum.postDetail.createAccount')}
                </Link>
                <Link
                  to="/auth/login"
                  className="px-6 py-3 bg-white text-[#5EA3C0] font-semibold rounded-full border-2 border-[#5EA3C0] hover:bg-blue-50 transition-colors"
                >
                  {t('forum.postDetail.login')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-orange-500" />
                {t('forum.postDetail.reportTitle')}
              </h3>
              <button onClick={closeReportModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forum.postDetail.reportReason')}
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {Object.values(ReportReasonValues).map((reason) => (
                    <option key={reason} value={reason}>
                      {t(`forum.postDetail.reportReasons.${reason}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forum.postDetail.reportDetails')}
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={t('forum.postDetail.reportDetailsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeReportModal}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('forum.postDetail.cancel')}
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={reportContent.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {reportContent.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('forum.postDetail.reportSubmitting')}
                    </>
                  ) : (
                    t('forum.postDetail.reportSubmit')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
