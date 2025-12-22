import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
}

/**
 * Composant optimisé pour le scroll infini avec Intersection Observer
 * Déclenche le chargement de plus de résultats quand l'utilisateur approche du bas
 */
export default function InfiniteScrollTrigger({ 
  onLoadMore, 
  hasMore, 
  isLoading 
}: InfiniteScrollTriggerProps) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ne rien faire si on charge déjà ou s'il n'y a plus de résultats
    if (isLoading || !hasMore) return

    const target = observerTarget.current
    if (!target) return

    // Configuration de l'Intersection Observer
    const options: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: '200px', // Commence à charger 200px avant d'atteindre l'élément
      threshold: 0.1 // Déclenche quand 10% de l'élément est visible
    }

    // Callback appelé quand l'élément devient visible
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    }

    // Créer l'observer
    const observer = new IntersectionObserver(handleIntersection, options)
    observer.observe(target)

    // Cleanup : détruire l'observer quand le composant est démonté
    return () => {
      if (target) {
        observer.unobserve(target)
      }
      observer.disconnect()
    }
  }, [onLoadMore, hasMore, isLoading])

  // Ne rien afficher si pas de résultats à charger
  if (!hasMore) return null

  return (
    <div 
      ref={observerTarget}
      className="flex justify-center items-center py-8"
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Chargement des résultats...</span>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          Faites défiler pour charger plus de résultats
        </div>
      )}
    </div>
  )
}
