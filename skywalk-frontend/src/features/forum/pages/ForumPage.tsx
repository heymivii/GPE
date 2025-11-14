import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Search, 
  Plus, 
  Pin,
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp
} from 'lucide-react'
import type { Category, Post, ForumStats, User } from '../types'

// Données mockées
const categories: Category[] = [
  {
    id: 'emploi',
    name: 'Emploi & Carrière',
    description: 'Questions sur la recherche d\'emploi, CV, entretiens, négociation salariale',
    icon: '💼',
    color: 'bg-blue-50 border-blue-200',
    postCount: 1250,
    lastPost: {
      id: '1',
      title: 'Comment négocier son salaire au Canada?',
      author: 'Marie L.',
      date: '2024-01-15T10:30:00Z'
    }
  },
  {
    id: 'logement',
    name: 'Logement',
    description: 'Recherche d\'appartement, bail, droits des locataires, colocation',
    icon: '🏠',
    color: 'bg-green-50 border-green-200',
    postCount: 980,
    lastPost: {
      id: '2',
      title: 'Garanties demandées pour un appartement à Paris',
      author: 'Thomas K.',
      date: '2024-01-15T09:15:00Z'
    }
  },
  {
    id: 'administratif',
    name: 'Démarches Admin',
    description: 'Visa, permis de travail, ouverture de compte, assurances',
    icon: '📋',
    color: 'bg-yellow-50 border-yellow-200',
    postCount: 750,
    lastPost: {
      id: '3',
      title: 'Délai pour obtenir un permis de travail en Suisse',
      author: 'Alex R.',
      date: '2024-01-15T08:45:00Z'
    }
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Transports publics, permis de conduire, véhicules',
    icon: '🚌',
    color: 'bg-purple-50 border-purple-200',
    postCount: 420,
    lastPost: {
      id: '4',
      title: 'Abonnement transports publics Berlin',
      author: 'Sophie M.',
      date: '2024-01-15T07:20:00Z'
    }
  },
  {
    id: 'sante',
    name: 'Santé',
    description: 'Système de santé, assurance maladie, médecins',
    icon: '🏥',
    color: 'bg-red-50 border-red-200',
    postCount: 320,
    lastPost: {
      id: '5',
      title: 'Choisir une assurance santé au Canada',
      author: 'Pierre D.',
      date: '2024-01-14T16:30:00Z'
    }
  },
  {
    id: 'communaute',
    name: 'Communauté',
    description: 'Présentation, événements, rencontres, aide générale',
    icon: '👥',
    color: 'bg-indigo-50 border-indigo-200',
    postCount: 890,
    lastPost: {
      id: '6',
      title: 'Événement expatriés français à Toronto - Février',
      author: 'Julie B.',
      date: '2024-01-14T14:15:00Z'
    }
  }
]

const recentPosts: Post[] = [
  {
    id: '1',
    title: 'Comment négocier son salaire lors d\'un entretien au Canada?',
    content: 'Bonjour, j\'ai un entretien la semaine prochaine pour un poste de développeur à Toronto. C\'est ma première expérience au Canada et je ne sais pas comment aborder la question du salaire...',
    author: {
      id: '1',
      name: 'Marie Laurent',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=50&h=50&fit=crop&crop=face',
      reputation: 245,
      joinDate: '2023-06-15',
      location: 'Paris → Toronto',
      badges: [{ id: '1', name: 'Nouvel arrivant', icon: '🌟', color: 'text-yellow-500', description: 'Premier post' }],
      isOnline: true
    },
    category: 'emploi',
    tags: ['salaire', 'entretien', 'canada', 'développeur'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    views: 127,
    votes: 8,
    replies: [],
    isPinned: false,
    isClosed: false,
    isSolved: false
  },
  {
    id: '2',
    title: 'Aide pour comprendre le système de transport berlinois',
    content: 'Salut ! Je viens d\'arriver à Berlin et le système de transport me semble complexe. Entre le U-Bahn, S-Bahn, les zones... quelqu\'un peut m\'expliquer?',
    author: {
      id: '2',
      name: 'Thomas Müller',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      reputation: 156,
      joinDate: '2023-09-20',
      location: 'Lyon → Berlin',
      badges: [{ id: '2', name: 'Explorateur', icon: '🚀', color: 'text-blue-500', description: 'Actif dans les transports' }],
      isOnline: false
    },
    category: 'transport',
    tags: ['berlin', 'transport', 'u-bahn', 's-bahn'],
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    views: 89,
    votes: 12,
    replies: [],
    isPinned: true,
    isClosed: false,
    isSolved: true
  }
]

const forumStats: ForumStats = {
  totalPosts: 4610,
  totalUsers: 1250,
  totalReplies: 12340,
  activeUsers: 89,
  topContributors: [
    {
      id: '1',
      name: 'Sarah Expert',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      reputation: 2580,
      joinDate: '2022-03-10',
      badges: [{ id: '3', name: 'Expert', icon: '⭐', color: 'text-yellow-500', description: 'Expert reconnu' }],
      isOnline: true
    },
    {
      id: '2',
      name: 'Marc Helper',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      reputation: 1890,
      joinDate: '2022-07-22',
      badges: [{ id: '4', name: 'Mentor', icon: '🎓', color: 'text-green-500', description: 'Aide les nouveaux' }],
      isOnline: false
    }
  ]
}

export default function ForumPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {forumStats.totalPosts.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {forumStats.totalUsers.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">Membres</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {forumStats.totalReplies.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">Réponses</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {forumStats.activeUsers}
                    </div>
                    <div className="text-sm text-gray-600">En ligne</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Catégories</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/forum/category/${category.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-4 rounded-lg border ${category.color}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{category.icon}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {category.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {category.description}
                            </p>
                            <div className="text-sm text-gray-500">
                              {category.postCount.toLocaleString('fr-FR')} posts
                            </div>
                          </div>
                        </div>
                        
                        {category.lastPost && (
                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">
                              {category.lastPost.author}
                            </div>
                            <div className="text-gray-500">
                              {formatTimeAgo(category.lastPost.date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Posts récents */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Discussions récentes</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/forum/post/${post.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
                          {post.isSolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <h3 className="font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.votes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.replies.length}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {post.author.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.author.location}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {post.author.reputation} pts
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top contributeurs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Top Contributeurs</h3>
              </div>
              <div className="p-4 space-y-3">
                {forumStats.topContributors.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.reputation.toLocaleString('fr-FR')} pts
                      </div>
                    </div>
                    <div className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Actions rapides</h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  to="/forum/new"
                  className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Poser une question
                </Link>
                <Link
                  to="/forum/my-posts"
                  className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Mes posts
                </Link>
                <Link
                  to="/forum/bookmarks"
                  className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Posts suivis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}