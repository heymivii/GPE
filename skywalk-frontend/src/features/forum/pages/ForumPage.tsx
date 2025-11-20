import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Plus,
  Clock,
  Eye,
  MessageCircle,
  Loader2,
  AlertCircle,
  Bookmark,
  Filter,
  X
} from 'lucide-react'
import { useForumTopics } from '../../../hooks/useForum'
import { useAuth } from '../../../hooks/useAuth'


const categoryConfig: Record<string, { name: string; description: string; icon: string; color: string }> = {
  question: {
    name: 'Question',
    description: 'Posez vos questions à la communauté',
    icon: '❓',
    color: 'bg-blue-50 border-blue-200'
  },
  testimony: {
    name: 'Témoignage',
    description: 'Partagez votre expérience d\'expatriation',
    icon: '📝',
    color: 'bg-green-50 border-green-200'
  },
  advice: {
    name: 'Conseil',
    description: 'Donnez ou recevez des conseils pratiques',
    icon: '�',
    color: 'bg-yellow-50 border-yellow-200'
  },
  discussion: {
    name: 'Discussion',
    description: 'Discussions générales sur l\'expatriation',
    icon: '💬',
    color: 'bg-purple-50 border-purple-200'
  },
  announcement: {
    name: 'Annonce',
    description: 'Annonces et informations importantes',
    icon: '📢',
    color: 'bg-red-50 border-red-200'
  },
  other: {
    name: 'Autre',
    description: 'Autres sujets divers',
    icon: '📌',
    color: 'bg-gray-50 border-gray-200'
  }
}

export default function ForumPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showMyTopics, setShowMyTopics] = useState(false)
  const topicsListRef = useRef<HTMLDivElement>(null)
  
  const { data: topics, isLoading, error } = useForumTopics()

  const scrollToResults = () => {
    setTimeout(() => {
      topicsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId)
    if (selectedCategory !== categoryId) {
      scrollToResults()
    }
  }

  const stats = useMemo(() => {
    if (!topics) return { totalTopics: 0, totalMessages: 0, recentTopics: 0, categories: 0 }
    
    const totalMessages = topics.reduce((sum, topic) => sum + (topic.messages?.length || 0), 0)
    const last24h = topics.filter(topic => {
      const createdAt = new Date(topic.created_at)
      const now = new Date()
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      return diffInHours <= 24
    }).length
    
    const uniqueCategories = new Set(topics.map(t => t.category).filter(Boolean))
    
    return {
      totalTopics: topics.length,
      totalMessages,
      recentTopics: last24h,
      categories: uniqueCategories.size
    }
  }, [topics])

  const myTopics = useMemo(() => {
    if (!user || !topics) return []
    const userId = user.idUser || user.id
    return topics.filter(topic => topic.user?.idUser === userId)
  }, [topics, user])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  const getCategoryStats = () => {
    if (!topics) return []
    
    const categoryCounts = topics.reduce((acc, topic) => {
      const cat = topic.category || 'other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryConfig).map(([key, config]) => ({
      id: key,
      ...config,
      postCount: categoryCounts[key] || 0
    }))
  }

  const filteredTopics = useMemo(() => {
    if (!topics) return []
    
    let result = topics
    
    if (showMyTopics && user) {
      const userId = user.idUser || user.id
      result = result.filter(topic => topic.user?.idUser === userId)
    }
    
    if (searchQuery) {
      result = result.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      result = result.filter(topic => topic.category === selectedCategory)
    }
    
    return result
  }, [topics, searchQuery, selectedCategory, showMyTopics, user])

  const updatedStats = {
    totalPosts: stats.totalTopics,
    totalUsers: 0,
    totalReplies: stats.totalMessages,
    activeUsers: stats.recentTopics
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Forum d'Entraide SkyWalk
              </h1>
              <p className="text-lg text-gray-600">
                Posez vos questions, partagez vos expériences et aidez la communauté
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans le forum..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              
              <Link
                to="/forum/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Nouveau post
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {updatedStats.totalPosts.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">Topics</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {updatedStats.totalReplies.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">Réponses</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {updatedStats.activeUsers}
                    </div>
                    <div className="text-sm text-gray-600">Dernières 24h</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Filter className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.categories}
                    </div>
                    <div className="text-sm text-gray-600">Catégories</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Filtrer par catégorie</h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {getCategoryStats().map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {category.postCount} {category.postCount === 1 ? 'topic' : 'topics'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div ref={topicsListRef} className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {showMyTopics ? (
                    <>
                      Mes topics
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  ) : selectedCategory ? (
                    <>
                      Topics - {categoryConfig[selectedCategory]?.name}
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  ) : (
                    <>
                      Tous les topics
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  )}
                </h2>
                {(selectedCategory || showMyTopics) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setShowMyTopics(false)
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-600">Chargement des topics...</p>
                </div>
              )}

              {error && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600">Erreur lors du chargement des topics</p>
                  <p className="text-sm text-red-500 mt-1">{error.message}</p>
                </div>
              )}

              {!isLoading && !error && filteredTopics.length === 0 && (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Aucun topic trouvé</p>
                  <Link
                    to="/forum/new"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Créer le premier topic →
                  </Link>
                </div>
              )}

              {!isLoading && !error && filteredTopics.length > 0 && (
                <div className="divide-y divide-gray-200">
                  {filteredTopics.map((topic) => {
                    const categoryInfo = categoryConfig[topic.category || 'other']
                    return (
                      <Link
                        key={topic.topic_id}
                        to={`/forum/post/${topic.topic_id}`}
                        className="block p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{categoryInfo?.icon || '📌'}</div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {topic.title}
                              </h3>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(topic.created_at)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {categoryInfo?.name || 'Autre'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {topic.user?.fullName || `Utilisateur #${topic.user?.idUser || '?'}`}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {user && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="font-semibold text-gray-900">Mes Statistiques</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mes topics</span>
                    <span className="font-bold text-blue-600">{myTopics.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total réponses</span>
                    <span className="font-bold text-purple-600">
                      {myTopics.reduce((sum, t) => sum + (t.messages?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Actions rapides</h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  to="/forum/new"
                  className="flex items-center gap-2 p-3 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all font-medium shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  Créer un topic
                </Link>

                {user ? (
                  <>
                    <button
                      onClick={() => setShowMyTopics(!showMyTopics)}
                      className={`flex items-center gap-2 p-3 w-full text-sm rounded-lg transition-colors ${
                        showMyTopics 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Mes topics ({myTopics.length})</span>
                      {showMyTopics && <span className="ml-auto text-xs">✓</span>}
                    </button>
                    <button
                      onClick={() => alert('Fonctionnalité à venir !')}
                      className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      Topics suivis
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Se connecter pour plus
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setShowMyTopics(false)
                  }}
                  className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Réinitialiser filtres
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Filtres rapides</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    const recent = topics?.filter(t => {
                      const diffInHours = (new Date().getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60)
                      return diffInHours <= 24
                    })
                    alert(`${recent?.length || 0} topics dans les dernières 24h`)
                  }}
                  className="flex items-center justify-between p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Récents (24h)
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {stats.recentTopics}
                  </span>
                </button>
                
                <button
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center justify-between p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Toutes catégories
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}