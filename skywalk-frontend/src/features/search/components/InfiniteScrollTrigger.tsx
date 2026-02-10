import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
}

export default function InfiniteScrollTrigger({ 
  onLoadMore, 
  hasMore, 
  isLoading 
}: InfiniteScrollTriggerProps) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (isLoading || !hasMore) return

    const target = observerTarget.current
    if (!target) return

    const options: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: '200px', // Commence à charger 200px avant d'atteindre l'élément
      threshold: 0.1 // Déclenche quand 10% de l'élément est visible
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    }

    const observer = new IntersectionObserver(handleIntersection, options)
    observer.observe(target)

    return () => {
      if (target) {
        observer.unobserve(target)
      }
      observer.disconnect()
    }
  }, [onLoadMore, hasMore, isLoading])

  if (!hasMore) return null

  return (
    <div 
      ref={observerTarget}
      className="flex justify-center items-center py-8"
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">{t('searchPage.loadingResults')}</span>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          {t('searchPage.scrollForMore')}
        </div>
      )}
    </div>
  )
}
