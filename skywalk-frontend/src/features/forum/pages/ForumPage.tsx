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
  X,
  Globe
} from 'lucide-react'
import { useForumTopics } from '../../../hooks/useForum'
import { useAuth } from '../../../hooks/useAuth'
import { PageHeader } from '../../../components/PageHeader'
import { PageSearch } from '../../../components/PageSearch'
import { useTranslation } from 'react-i18next'
import { getCurrentLocale } from '../../../data/supportedCountries'


const categoryConfig: Record<string, { icon: string; color: string }> = {
  question: { icon: '❓', color: 'bg-blue-50 border-blue-200' },
  testimony: { icon: '📝', color: 'bg-green-50 border-green-200' },
  advice: { icon: '💡', color: 'bg-yellow-50 border-yellow-200' },
  discussion: { icon: '💬', color: 'bg-purple-50 border-purple-200' },
  announcement: { icon: '📢', color: 'bg-red-50 border-red-200' },
  other: { icon: '📌', color: 'bg-gray-50 border-gray-200' }
}

export default function ForumPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
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
    
    if (diffInHours < 1) return t('forum.timeAgo.lessThanHour')
    if (diffInHours < 24) return t('forum.timeAgo.hours', { count: diffInHours })
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return t('forum.timeAgo.days', { count: diffInDays })
    return date.toLocaleDateString()
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
      name: t(`forum.categories.${key}.name`),
      description: t(`forum.categories.${key}.description`),
      postCount: categoryCounts[key] || 0
    }))
  }

  // Extract unique countries from topics for the filter
  const availableCountries = useMemo(() => {
    if (!topics) return []
    const countryMap = new Map<number, { idCountry: number; countryName: string; flagUrl?: string }>()
    topics.forEach(topic => {
      if (topic.country?.idCountry && topic.country?.countryName) {
        countryMap.set(topic.country.idCountry, {
          idCountry: topic.country.idCountry,
          countryName: topic.country.countryName,
          flagUrl: topic.country.flagUrl,
        })
      }
    })
    return Array.from(countryMap.values()).sort((a, b) => a.countryName.localeCompare(b.countryName))
  }, [topics])

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
    
    if (selectedCountry) {
      result = result.filter(topic => topic.country?.idCountry === selectedCountry)
    }
    
    return result
  }, [topics, searchQuery, selectedCategory, selectedCountry, showMyTopics, user])

  const updatedStats = {
    totalPosts: stats.totalTopics,
    totalUsers: 0,
    totalReplies: stats.totalMessages,
    activeUsers: stats.recentTopics
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('forum.title')}
        description={t('forum.description')}
      />
      
      <PageSearch>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#5EA3C0] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5EA3C0]/20 focus:bg-white transition-all"
              placeholder={t('forum.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              to="/forum/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              {t('forum.newPost')}
            </Link>
          </div>
        </div>
      </PageSearch>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                      {updatedStats.totalPosts.toLocaleString(getCurrentLocale())}
                    </div>
                    <div className="text-sm font-medium text-gray-500 mt-1">{t('forum.stats.topics')}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                      {updatedStats.totalReplies.toLocaleString(getCurrentLocale())}
                    </div>
                    <div className="text-sm font-medium text-gray-500 mt-1">{t('forum.stats.replies')}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                      {updatedStats.activeUsers}
                    </div>
                    <div className="text-sm font-medium text-gray-500 mt-1">{t('forum.stats.last24h')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Filter className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                      {stats.categories}
                    </div>
                    <div className="text-sm font-medium text-gray-500 mt-1">{t('forum.stats.categories')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{t('forum.filterByCategory')}</h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="flex items-center gap-1 text-sm text-[#5EA3C0] hover:text-[#4A8299]"
                  >
                    <X className="w-4 h-4" />
                    {t('forum.reset')}
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
                        ? 'border-[#5EA3C0] bg-[#5EA3C0]/5 shadow-sm'
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
                      {t('forum.myTopicsTitle')}
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  ) : selectedCategory ? (
                    <>
                      {t('forum.topicsCategory', { category: t(`forum.categories.${selectedCategory}.name`) })}
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  ) : (
                    <>
                      {t('forum.allTopics')}
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredTopics.length})
                      </span>
                    </>
                  )}
                </h2>
                {(selectedCategory || showMyTopics || selectedCountry) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setShowMyTopics(false)
                      setSelectedCountry(null)
                    }}
                    className="flex items-center gap-1 text-sm text-[#5EA3C0] hover:text-[#4A8299] font-medium"
                  >
                    <X className="w-4 h-4" />
                    {t('forum.reset')}
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5EA3C0] mx-auto mb-3" />
                  <p className="text-gray-600">{t('forum.loading')}</p>
                </div>
              )}

              {error && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600">{t('forum.error')}</p>
                  <p className="text-sm text-red-500 mt-1">{error.message}</p>
                </div>
              )}

              {!isLoading && !error && filteredTopics.length === 0 && (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">{t('forum.noTopics')}</p>
                  <Link
                    to="/forum/new"
                    className="text-[#5EA3C0] hover:text-[#4A8299] text-sm font-medium"
                  >
                    {t('forum.createFirstTopic')}
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
                                {t(`forum.categories.${topic.category || 'other'}.name`)}
                              </span>
                              {topic.country?.countryName && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                  {topic.country.flagUrl && (
                                    <img src={topic.country.flagUrl} alt="" className="w-3 h-2 rounded-sm object-cover" />
                                  )}
                                  {topic.country.countryName}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {topic.user?.fullName || t('forum.user', { id: topic.user?.idUser || '?' })}
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
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{t('forum.myStats')}</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('forum.stats.myTopics')}</span>
                    <span className="font-bold text-[#5EA3C0]">{myTopics.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('forum.stats.totalReplies')}</span>
                    <span className="font-bold text-purple-600">
                      {myTopics.reduce((sum, t) => sum + (t.messages?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{t('forum.quickActions')}</h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  to="/forum/new"
                  className="flex items-center gap-2 p-3 text-sm text-white bg-black hover:bg-gray-800 rounded-lg transition-all font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('forum.createTopic')}
                </Link>

                {user ? (
                  <>
                    <button
                      onClick={() => setShowMyTopics(!showMyTopics)}
                      className={`flex items-center gap-2 p-3 w-full text-sm rounded-lg transition-colors ${
                        showMyTopics 
                          ? 'bg-[#5EA3C0]/10 text-[#5EA3C0] font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('forum.stats.myTopics')} ({myTopics.length})</span>
                      {showMyTopics && <span className="ml-auto text-xs">✓</span>}
                    </button>
                    <button
                      onClick={() => alert(t('forum.comingSoon'))}
                      className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      {t('forum.followedTopics')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('forum.loginForMore')}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedCountry(null)
                    setShowMyTopics(false)
                  }}
                  className="flex items-center gap-2 p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('forum.resetFilters')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{t('forum.quickFilters')}</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    const recent = topics?.filter(t => {
                      const diffInHours = (new Date().getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60)
                      return diffInHours <= 24
                    })
                    alert(`${recent?.length || 0} ${t('forum.stats.last24h')}`)
                  }}
                  className="flex items-center justify-between p-3 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('forum.recent24h')}
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
                    {t('forum.allCategories')}
                  </span>
                </button>
              </div>
            </div>

            {/* Country Filter */}
            {availableCountries.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    {t('forum.filterByCountry', 'Filtrer par pays')}
                  </h3>
                  {selectedCountry && (
                    <button
                      onClick={() => setSelectedCountry(null)}
                      className="flex items-center gap-1 text-xs text-[#5EA3C0] hover:text-[#4A8299]"
                    >
                      <X className="w-3 h-3" />
                      {t('forum.reset')}
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-1 max-h-64 overflow-y-auto">
                  {availableCountries.map((country) => {
                    const topicCount = topics?.filter(t => t.country?.idCountry === country.idCountry).length || 0
                    return (
                      <button
                        key={country.idCountry}
                        onClick={() => {
                          setSelectedCountry(selectedCountry === country.idCountry ? null : country.idCountry)
                          scrollToResults()
                        }}
                        className={`flex items-center justify-between p-2.5 w-full text-sm rounded-lg transition-colors ${
                          selectedCountry === country.idCountry
                            ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {country.flagUrl && (
                            <img src={country.flagUrl} alt="" className="w-4 h-3 rounded-sm object-cover" />
                          )}
                          {country.countryName}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {topicCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}