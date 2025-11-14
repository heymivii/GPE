import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Flag,
  ArrowLeft,
  Crown,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Post, Reply } from '../types'

// Données mockées pour un post détaillé
const mockPost: Post = {
  id: '1',
  title: 'Comment négocier son salaire lors d\'un entretien au Canada?',
  content: `Bonjour à tous,

Je vais avoir un entretien la semaine prochaine pour un poste de développeur full-stack à Toronto. C'est ma première expérience professionnelle au Canada et je ne sais pas du tout comment aborder la question du salaire.

**Ma situation :**
- 5 ans d'expérience en France
- Stack : React, Node.js, PostgreSQL
- Poste : Senior Developer
- Entreprise : Startup tech (50-100 employés)

**Mes questions :**
1. À quel moment aborder le sujet du salaire ?
2. Comment faire ses recherches sur les salaires du marché ?
3. Y a-t-il des spécificités canadiennes à connaître ?
4. Comment négocier les avantages (assurance, congés, etc.) ?

J'ai vu sur Glassdoor des fourchettes entre 80k et 120k CAD pour ce type de poste, mais je ne sais pas si c'est fiable.

Merci d'avance pour vos conseils ! 🙏`,
  author: {
    id: '1',
    name: 'Marie Laurent',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=50&h=50&fit=crop&crop=face',
    reputation: 245,
    joinDate: '2023-06-15',
    location: 'Paris → Toronto',
    badges: [
      { id: '1', name: 'Nouvel arrivant', icon: '🌟', color: 'text-yellow-500', description: 'Premier post' }
    ],
    isOnline: true
  },
  category: 'emploi',
  tags: ['salaire', 'entretien', 'canada', 'développeur', 'négociation'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  views: 247,
  votes: 15,
  replies: [
    {
      id: '1',
      content: `Salut Marie ! Félicitations pour ton entretien 🎉

Je suis passé par là il y a 2 ans. Voici mes conseils :

**1. Timing :** Attends qu'ils abordent le sujet ou que tu sois sûre qu'ils sont intéressés. Généralement en fin d'entretien ou au 2e entretien.

**2. Recherches :** 
- Glassdoor est un bon point de départ
- Regarde sur levels.fyi pour les startups tech
- Consulte le guide des salaires de Robert Half Canada
- Demande dans les groupes Facebook d'expatriés français au Canada

**3. Spécificités canadiennes :**
- Les salaires sont annuels bruts
- Attention aux différences entre provinces (Ontario vs Québec)
- Les avantages sont souvent plus généreux qu'en France

Pour ton profil, 85-95k CAD me semble réaliste à Toronto pour commencer. Bon courage ! 💪`,
      author: {
        id: '2',
        name: 'Thomas Expert',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        reputation: 1250,
        joinDate: '2022-03-15',
        location: 'Lyon → Montreal',
        badges: [
          { id: '2', name: 'Expert Emploi', icon: '💼', color: 'text-blue-500', description: 'Expert en questions d\'emploi' },
          { id: '3', name: 'Mentor', icon: '🎓', color: 'text-green-500', description: 'Aide les nouveaux' }
        ],
        isOnline: false
      },
      createdAt: '2024-01-15T11:45:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      votes: 23,
      isAccepted: true
    },
    {
      id: '2',
      content: `Juste pour ajouter à ce que dit Thomas :

N'oublie pas de négocier aussi :
- Les stock options si c'est une startup
- Le remote/hybride (très important à Toronto avec les transports)
- Le budget formation
- Les congés (au Canada c'est souvent 2 semaines au début, tu peux essayer de négocier plus avec ton expérience)

Et prépare-toi à ce qu'ils te demandent tes attentes salariales assez tôt dans le processus. Aie une fourchette prête !`,
      author: {
        id: '3',
        name: 'Sarah RH',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        reputation: 892,
        joinDate: '2022-08-20',
        location: 'Paris → Toronto',
        badges: [
          { id: '4', name: 'RH Pro', icon: '👩‍💼', color: 'text-purple-500', description: 'Professionnelle RH' }
        ],
        isOnline: true
      },
      createdAt: '2024-01-15T14:20:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      votes: 12,
      isAccepted: false
    }
  ],
  isPinned: false,
  isClosed: false,
  isSolved: true,
  bestReply: '1'
}

export default function PostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post>(mockPost)
  const [newReply, setNewReply] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

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

  const handleVote = (itemId: string, voteType: 'up' | 'down') => {
    setUserVotes(prev => ({
      ...prev,
      [itemId]: prev[itemId] === voteType ? null : voteType
    }))
    
    // Dans une vraie app, on ferait un appel API ici
    console.log(`Vote ${voteType} pour ${itemId}`)
  }

  const handleReply = () => {
    if (!newReply.trim()) return
    
    // Dans une vraie app, on ferait un appel API
    const reply: Reply = {
      id: Date.now().toString(),
      content: newReply,
      author: {
        id: 'current-user',
        name: 'Vous',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        reputation: 50,
        joinDate: '2024-01-01',
        badges: [],
        isOnline: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false
    }
    
    setPost(prev => ({
      ...prev,
      replies: [...prev.replies, reply]
    }))
    
    setNewReply('')
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

        {/* Post principal */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.isSolved && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {post.title}
                  </h1>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(post.createdAt)}
                  </span>
                  <span>{post.views} vues</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Auteur */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="relative">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
                {post.author.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{post.author.name}</div>
                <div className="text-sm text-gray-500">{post.author.location}</div>
                <div className="text-xs text-gray-500">
                  {post.author.reputation} points • Membre depuis {new Date(post.author.joinDate).getFullYear()}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {post.author.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className={`text-xs px-1.5 py-0.5 rounded ${badge.color} bg-opacity-10`}
                      title={badge.description}
                    >
                      {badge.icon} {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/forum/tag/${tag}`}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    className={`p-1 rounded ${
                      userVotes[post.id] === 'up'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-400 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-gray-700">{post.votes}</span>
                  <button
                    onClick={() => handleVote(post.id, 'down')}
                    className={`p-1 rounded ${
                      userVotes[post.id] === 'down'
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.replies.length} réponses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Réponses */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {post.replies.length} réponse{post.replies.length > 1 ? 's' : ''}
          </h2>

          {post.replies.map((reply) => (
            <div
              key={reply.id}
              className={`bg-white rounded-lg border ${
                reply.isAccepted ? 'border-green-200 ring-2 ring-green-100' : 'border-gray-200'
              }`}
            >
              {reply.isAccepted && (
                <div className="px-6 py-2 bg-green-50 border-b border-green-200 rounded-t-lg">
                  <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    Réponse acceptée par l'auteur
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Auteur de la réponse */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={reply.author.avatar}
                      alt={reply.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {reply.author.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{reply.author.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatTimeAgo(reply.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{reply.author.location}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {reply.author.badges.map((badge) => (
                        <span
                          key={badge.id}
                          className={`text-xs px-1.5 py-0.5 rounded ${badge.color} bg-opacity-10`}
                          title={badge.description}
                        >
                          {badge.icon} {badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenu de la réponse */}
                <div className="prose max-w-none mb-4">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {reply.content}
                  </div>
                </div>

                {/* Actions réponse */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleVote(reply.id, 'up')}
                      className={`p-1 rounded ${
                        userVotes[reply.id] === 'up'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-gray-700">{reply.votes}</span>
                    <button
                      onClick={() => handleVote(reply.id, 'down')}
                      className={`p-1 rounded ${
                        userVotes[reply.id] === 'down'
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire de réponse */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Votre réponse
            </h3>
            
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Utilisez le markdown pour formater votre réponse
              </div>
              
              <button
                onClick={handleReply}
                disabled={!newReply.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Publier la réponse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}