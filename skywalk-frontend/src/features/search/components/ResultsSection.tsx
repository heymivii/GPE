import { useState } from 'react'
import { Star, MapPin, Clock, ExternalLink, Heart, Share2, Calendar, Euro } from 'lucide-react'
import type { SearchResult } from '../types'
import JobCard from './JobCard'

interface ResultsSectionProps {
  results: SearchResult[]
  isLoading: boolean
  viewMode: 'grid' | 'list'
  onLoadMore: () => void
}

const categoryColors = {
  emploi: 'bg-[#5EA3C0]/10 text-[#5EA3C0]',
  logement: 'bg-green-100 text-green-800',
  transport: 'bg-purple-100 text-purple-800',
  administration: 'bg-orange-100 text-orange-800',
  sante: 'bg-red-100 text-red-800'
}

const urgencyColors = {
  haute: 'bg-red-100 text-red-800',
  moyenne: 'bg-yellow-100 text-yellow-800',
  faible: 'bg-gray-100 text-gray-800'
}

function ResultCard({ result, viewMode }: { result: SearchResult; viewMode: 'grid' | 'list' }) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    const favorites = JSON.parse(localStorage.getItem('skywalk-favorites') || '[]')
    if (!isFavorited) {
      favorites.push(result.id)
    } else {
      const index = favorites.indexOf(result.id)
      if (index > -1) favorites.splice(index, 1)
    }
    localStorage.setItem('skywalk-favorites', JSON.stringify(favorites))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: result.description,
        url: result.link
      })
    } else {
      navigator.clipboard.writeText(result.link)
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[result.category]}`}>
                  {result.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[result.urgency]}`}>
                  {result.urgency}
                </span>
                {result.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{result.rating}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {result.title}
              </h3>

              <p className="text-gray-600 mb-3 line-clamp-2">
                {result.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{result.city}, {result.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(result.date).toLocaleDateString('fr-FR')}</span>
                </div>
                {result.price && (
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span>{result.price.toLocaleString('fr-FR')} {result.currency}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Par {result.provider}</span>
                {result.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-full ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full text-gray-400 hover:text-[#5EA3C0]"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <span>Voir détails</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow overflow-hidden">
      {result.image && (
        <div className="aspect-video relative">
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm ${
              isFavorited ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[result.category]}`}>
            {result.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[result.urgency]}`}>
            {result.urgency}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {result.title}
        </h3>

        <p className="text-gray-600 mb-3 line-clamp-2">
          {result.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{result.city}</span>
          </div>
          {result.price && (
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <Euro className="w-4 h-4" />
              <span>{result.price.toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{result.rating}</span>
              </div>
            )}
            <span className="text-xs text-gray-500">{result.provider}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1 text-gray-400 hover:text-[#5EA3C0]"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
            >
              <span>Voir</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsSection({ results, isLoading, viewMode, onLoadMore }: ResultsSectionProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {results.map((result) => (
          result.category === 'emploi' && result.provider === 'Adzuna' ? (
            <JobCard key={result.id} job={result} viewMode={viewMode} />
          ) : (
            <ResultCard key={result.id} result={result} viewMode={viewMode} />
          )
        ))}
      </div>

      {results.length > 0 && (
        <div className="text-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Chargement...' : 'Voir plus de résultats'}
          </button>
        </div>
      )}
    </div>
  )
}