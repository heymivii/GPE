import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateForumTopic } from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { TopicCategoryValues, type TopicCategory } from '../../../types/forum';

const categories = [
  { id: TopicCategoryValues.QUESTION, name: 'Question', icon: '❓' },
  { id: TopicCategoryValues.TESTIMONY, name: 'Témoignage', icon: '📝' },
  { id: TopicCategoryValues.ADVICE, name: 'Conseil', icon: '💡' },
  { id: TopicCategoryValues.DISCUSSION, name: 'Discussion', icon: '💬' },
  { id: TopicCategoryValues.ANNOUNCEMENT, name: 'Annonce', icon: '📢' },
  { id: TopicCategoryValues.OTHER, name: 'Autre', icon: '📌' }
];

export default function NewPostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createTopic = useCreateForumTopic();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '', // Nouveau : contenu initial du topic
    category: TopicCategoryValues.QUESTION as TopicCategory,
    countryId: undefined as number | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté');
      navigate('/auth/login');
      return;
    }

    if (!formData.title.trim()) {
      alert('Le titre est requis');
      return;
    }

    if (!formData.content.trim()) {
      alert('Le contenu est requis');
      return;
    }

    try {
      const userId = user.idUser || user.id;
      if (!userId) {
        alert('Erreur ID utilisateur');
        return;
      }

      const newTopic = await createTopic.mutateAsync({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        idUser: userId,
        idCountry: formData.countryId,
      });

      navigate(`/forum/post/${newTopic.topic_id}`);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      const msg = error instanceof Error ? error.message : 'Erreur';
      alert(`Erreur: ${msg}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-yellow-800 font-semibold mb-2">Connexion requise</h2>
            <button onClick={() => navigate('/auth/login')} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Se connecter
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
          <Link to="/forum" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour au forum
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un nouveau topic</h1>
          <p className="text-gray-600">Posez votre question ou partagez votre expérience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              Titre <span className="text-red-500">*</span>
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
              Description / Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Décrivez votre question ou partagez plus de détails..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
              rows={6}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Expliquez votre question ou situation en détail
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Catégorie <span className="text-red-500">*</span>
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
            <Link to="/forum" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.content.trim() || createTopic.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTopic.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le topic'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
