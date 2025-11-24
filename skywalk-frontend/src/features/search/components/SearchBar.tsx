import { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, MapPin } from 'lucide-react'

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
  placeholder?: string
}

const recentSearches = [
  'Emploi développeur Toronto',
  'Logement Paris centre',
  'Transport public Berlin',
  'Assurance santé Canada'
]

const popularSearches = [
  'Emploi informatique',
  'Appartement 2 pièces',
  'Visa de travail',
  'Compte bancaire',
  'Permis de conduire'
]

export default function SearchBar({ initialQuery = '', onSearch, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length > 2) {
      const filtered = [...recentSearches, ...popularSearches].filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setIsFocused(false)
      inputRef.current?.blur()
      
      const recent = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')
      const updated = [query, ...recent.filter((item: string) => item !== query)].slice(0, 10)
      localStorage.setItem('skywalk-recent-searches', JSON.stringify(updated))
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setIsFocused(false)
  }

  const clearQuery = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {query.length === 0 && (
            <>
              <div className="p-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Recherches récentes
                </div>
                {recentSearches.slice(0, 4).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Recherches populaires
                </div>
                {popularSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}