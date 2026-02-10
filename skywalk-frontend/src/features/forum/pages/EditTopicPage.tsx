import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, ShieldAlert, X } from 'lucide-react';
import { useForumTopic, useUpdateForumTopic } from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { TopicCategoryValues, type TopicCategory } from '../../../types/forum';
import { useTranslation } from 'react-i18next';

const categoryIcons: Record<string, string> = {
  [TopicCategoryValues.QUESTION]: '❓',
  [TopicCategoryValues.TESTIMONY]: '📝',
  [TopicCategoryValues.ADVICE]: '💡',
  [TopicCategoryValues.DISCUSSION]: '💬',
  [TopicCategoryValues.ANNOUNCEMENT]: '📢',
  [TopicCategoryValues.OTHER]: '📌',
};

export default function EditTopicPage() {
  const { t } = useTranslation();
  const categories = Object.values(TopicCategoryValues).map(id => ({
    id,
    name: t(`forum.categories.${id}.name`),
    icon: categoryIcons[id] || '📌',
  }));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const topicId = parseInt(id || '0', 10);
  
  const { data: topic, isLoading: isLoadingTopic, error: topicError } = useForumTopic(topicId);
  const updateTopic = useUpdateForumTopic();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '', 
    category: TopicCategoryValues.QUESTION as TopicCategory,
  });

  // Feedback banner
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const showFeedback = (message: string) => setFeedbackMessage(message);
  const clearFeedback = () => setFeedbackMessage(null);

  useEffect(() => {
    if (topic) {
      const initialMessage = topic.messages && topic.messages.length > 0 ? topic.messages[0] : null;
      
      setFormData({
        title: topic.title,
        content: initialMessage?.content || '',
        category: topic.category || TopicCategoryValues.QUESTION,
      });
    }
  }, [topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    
    if (!user) {
      showFeedback(t('forum.editTopic.mustBeLoggedIn'));
      navigate('/auth/login');
      return;
    }

    if (!topic) {
      showFeedback(t('forum.editTopic.topicNotFound'));
      return;
    }

    const userId = user.idUser || user.id;
    const topicUserId = topic.user?.idUser;
    
    if (userId !== topicUserId) {
      showFeedback(t('forum.editTopic.notAuthorized'));
      return;
    }

    if (!formData.title.trim()) {
      showFeedback(t('forum.editTopic.titleRequired'));
      return;
    }

    try {
      await updateTopic.mutateAsync({
        id: topicId,
        data: {
          title: formData.title.trim(),
          content: formData.content.trim() || undefined,
          category: formData.category,
        },
      });

      navigate(`/forum/post/${topicId}`);
    } catch (error: unknown) {
      console.error('Error:', error);
      const axiosErr = error as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr?.response?.status === 400 && axiosErr.response.data?.message) {
        showFeedback(axiosErr.response.data.message);
      } else {
        const msg = error instanceof Error ? error.message : t('forum.editTopic.updateError');
        showFeedback(`${t('forum.editTopic.error')}: ${msg}`);
      }
    }
  };

  if (isLoadingTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('forum.editTopic.loading')}</p>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-red-800 font-semibold mb-2">{t('forum.editTopic.error')}</h2>
            <p className="text-red-600 mb-4">
              {topicError?.message || t('forum.editTopic.topicNotFound')}
            </p>
            <button
              onClick={() => navigate('/forum')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('forum.editTopic.backToForum')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-yellow-800 font-semibold mb-2">{t('forum.editTopic.loginRequired')}</h2>
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              {t('forum.editTopic.login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userId = user.idUser || user.id;
  const topicUserId = topic.user?.idUser;
  
  if (userId !== topicUserId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-red-800 font-semibold mb-2">{t('forum.editTopic.accessDenied')}</h2>
            <p className="text-red-600 mb-4">
              {t('forum.editTopic.notAuthorized')}
            </p>
            <button
              onClick={() => navigate(`/forum/post/${topicId}`)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('forum.editTopic.backToTopic')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to={`/forum/post/${topicId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forum.editTopic.backToTopic')}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('forum.editTopic.title')}</h1>
          <p className="text-gray-600">{t('forum.editTopic.subtitle')}</p>
        </div>

        {/* Feedback banner */}
        {feedbackMessage && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium bg-red-50 border-red-200 text-red-800">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="flex-1">{feedbackMessage}</span>
            <button onClick={clearFeedback} className="p-1 rounded hover:bg-black/5 text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Loading overlay */}
          {updateTopic.isPending && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-sm font-medium text-gray-600">{t('forum.editTopic.saving')}</span>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              {t('forum.editTopic.titleLabel')} <span className="text-red-500">{t('forum.editTopic.required')}</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Comment obtenir un visa?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={255}
              required
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
              {t('forum.editTopic.contentLabel')} <span className="text-gray-500">{t('forum.editTopic.contentOptional')}</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('forum.editTopic.contentPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
              rows={6}
            />
            <p className="mt-2 text-sm text-gray-500">
              {t('forum.editTopic.contentHelp')}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {t('forum.editTopic.categoryLabel')} <span className="text-red-500">{t('forum.editTopic.required')}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id as TopicCategory }))}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.category === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              to={`/forum/post/${topicId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t('forum.editTopic.cancel')}
            </Link>
            <button
              type="submit"
              disabled={!formData.title.trim() || updateTopic.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTopic.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('forum.editTopic.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('forum.editTopic.saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
