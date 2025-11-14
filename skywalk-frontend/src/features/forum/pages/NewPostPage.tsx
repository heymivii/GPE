import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Upload, X } from 'lucide-react'

const categories = [
  { id: 'emploi', name: 'Emploi & Carrière', icon: '💼' },
  { id: 'logement', name: 'Logement', icon: '🏠' },
  { id: 'administratif', name: 'Démarches Admin', icon: '📋' },
  { id: 'transport', name: 'Transport', icon: '🚌' },
  { id: 'sante', name: 'Santé', icon: '🏥' },
  { id: 'communaute', name: 'Communauté', icon: '👥' }
]

const popularTags = [
  'visa', 'permis-travail', 'salaire', 'entretien', 'cv', 'logement', 
  'appartement', 'transport', 'assurance', 'banque', 'canada', 'france',
  'suisse', 'allemagne', 'debutant', 'urgent'
]

export default function NewPostPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    isUrgent: false
  })
  const [isPreview, setIsPreview] = useState(false)
  const [customTag, setCustomTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Dans une vraie app, on ferait un appel API
    const newPost = {
      id: Date.now().toString(),
      ...formData,
      author: {
        id: 'current-user',
        name: 'Vous',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        reputation: 50,
        joinDate: '2024-01-01',
        location: 'Utilisateur actuel',
        badges: [],
        isOnline: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      votes: 0,
      replies: [],
      isPinned: false,
      isClosed: false,
      isSolved: false
    }

    // Sauvegarder dans localStorage pour la démo
    const existingPosts = JSON.parse(localStorage.getItem('skywalk-forum-posts') || '[]')
    localStorage.setItem('skywalk-forum-posts', JSON.stringify([newPost, ...existingPosts]))

    navigate(`/forum/post/${newPost.id}`)
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCustomTagAdd = () => {
    if (customTag.trim()) {
      addTag(customTag.trim().toLowerCase())
      setCustomTag('')
    }
  }

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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un nouveau post
          </h1>
          <p className="text-gray-600">
            Posez votre question ou partagez votre expérience avec la communauté
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de votre post *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Décrivez votre question en quelques mots..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.title.length}/200 caractères
            </div>
          </div>

          {/* Catégorie */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Catégorie *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
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

          {/* Contenu */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Contenu de votre post *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
                  >
                    <Eye className="w-4 h-4" />
                    {isPreview ? 'Éditer' : 'Aperçu'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {isPreview ? (
                <div className="prose max-w-none min-h-[200px]">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {formData.content || 'Votre contenu apparaîtra ici...'}
                  </div>
                </div>
              ) : (
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Décrivez votre situation, posez votre question ou partagez votre expérience...

Quelques conseils :
- Soyez précis et détaillé
- Expliquez votre contexte
- Utilisez des exemples concrets
- Formatez votre texte avec des paragraphes"
                  rows={12}
                  className="w-full border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400"
                />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags (optionnel)
            </label>
            
            {/* Tags sélectionnés */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Ajouter un tag personnalisé */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomTagAdd())}
                placeholder="Ajouter un tag personnalisé..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleCustomTagAdd}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Ajouter
              </button>
            </div>

            {/* Tags populaires */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Tags populaires
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    disabled={formData.tags.includes(tag)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-700">Question urgente</div>
                <div className="text-sm text-gray-500">
                  Marquer comme urgent pour attirer l'attention (à utiliser avec modération)
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Link
              to="/forum"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Publier le post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}