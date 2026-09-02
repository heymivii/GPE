import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Globe, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCreateForumTopic } from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { TopicCategoryValues, type TopicCategory } from '../../../types/forum';
import { categoryIcon } from '../categoryIcons';
import { useTranslation } from 'react-i18next';
import { destinationsApi } from '../../../api/destinations';



export default function NewPostPage() {
  const { t } = useTranslation();
  const categories = Object.values(TopicCategoryValues).map(id => ({
    id,
    name: t(`forum.categories.${id}.name`),
    icon: categoryIcon(id),
  }));
  const navigate = useNavigate();
  const { user } = useAuth();
  const createTopic = useCreateForumTopic();
  
  const { data: countries = [] } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: destinationsApi.getAll,
    staleTime: 10 * 60 * 1000,
  });

  // Pré-remplissage via query params — utilisé par le buddy system de la
  // checklist (« Via le forum » arrive avec title, content et countryId).
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(() => ({
    title: searchParams.get('title') ?? '',
    content: searchParams.get('content') ?? '',
    category: TopicCategoryValues.QUESTION as TopicCategory,
    countryId: searchParams.get('countryId')
      ? Number(searchParams.get('countryId'))
      : (undefined as number | undefined),
  }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    
    if (!user) {
      showFeedback(t('forum.newTopic.mustBeLoggedIn'));
      navigate('/auth/login');
      return;
    }

    if (!formData.title.trim()) {
      showFeedback(t('forum.newTopic.titleRequired'));
      return;
    }

    if (!formData.content.trim()) {
      showFeedback(t('forum.newTopic.contentRequired'));
      return;
    }

    try {
      const userId = user.idUser || user.id;
      if (!userId) {
        showFeedback(t('forum.newTopic.userIdError'));
        return;
      }

      const newTopic = await createTopic.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        countryId: formData.countryId,
      });

      const topicId = (newTopic as any).idForumTopic ?? newTopic.topic_id;
      navigate(`/forum/post/${topicId}`);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      const axiosErr = error as { response?: { data?: { message?: string }; status?: number } };
      if (axiosErr?.response?.status === 400 && axiosErr.response.data?.message) {
        showFeedback(axiosErr.response.data.message);
      } else {
        const msg = error instanceof Error ? error.message : t('forum.newTopic.submitError');
        showFeedback(`${t('forum.newTopic.submitError')}: ${msg}`);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('forum.newTopic.loginRequired')}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t('forum.newTopic.loginDesc')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/forum')}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                {t('forum.newTopic.backToForum')}
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                {t('forum.newTopic.loginButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/forum" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="w-4 h-4" />
            {t('forum.newTopic.backToForum')}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('forum.newTopic.title')}</h1>
          <p className="text-gray-600">{t('forum.newTopic.subtitle')}</p>
        </div>

        {feedbackMessage && (
          <div
            className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
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

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {createTopic.isPending && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-sm font-medium text-gray-600">{t('forum.newTopic.publishing')}</span>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              {t('forum.newTopic.titleLabel')} <span className="text-red-500">{t('forum.newTopic.required')}</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('forum.newTopic.titlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={255}
              required
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
              {t('forum.newTopic.contentLabel')} <span className="text-red-500">{t('forum.newTopic.required')}</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('forum.newTopic.contentPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
              rows={6}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {t('forum.newTopic.contentHelp')}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {t('forum.newTopic.categoryLabel')} <span className="text-red-500">{t('forum.newTopic.required')}</span>
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
                    <category.icon className="w-5 h-5 text-[#5EA3C0]" />
                    <span className="font-medium">{t(`forum.categories.${category.id}.name`)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Globe className="w-4 h-4 inline mr-1.5 text-blue-500" />
              {t('forum.newTopic.countryLabel', 'Pays concerné')}
              <span className="text-gray-400 text-xs ml-2">{t('forum.newTopic.optional', '(optionnel)')}</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              {t('forum.newTopic.countryHelp', 'Associer un pays permet de comptabiliser les discussions par destination.')}
            </p>
            <select
              value={formData.countryId ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">{t('forum.newTopic.noCountry', '— Aucun pays —')}</option>
              {countries
                .slice()
                .sort((a, b) => (a.countryName || '').localeCompare(b.countryName || ''))
                .map((c) => (
                  <option key={c.idCountry} value={c.idCountry}>
                    {c.countryName}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link to="/forum" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              {t('forum.newTopic.cancel')}
            </Link>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.content.trim() || createTopic.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTopic.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('forum.newTopic.publishing')}
                </>
              ) : (
                t('forum.newTopic.publish')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
