import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
  /** Contexte pour les lecteurs d'écran (ex. nom de l'auteur). */
  ariaLabel?: string;
  className?: string;
}

/**
 * Notation par étoiles, accessible :
 * - readOnly : rendu statique avec un libellé « X sur 5 » ;
 * - interactif : groupe de boutons navigables au clavier (Tab + Entrée/Espace),
 *   focus visible, chaque étoile porte un aria-label explicite.
 */
export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  ariaLabel,
  className = '',
}: Props) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<number | null>(null);
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (readOnly) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 ${className}`}
        aria-label={t('rating.readAloud', {
          value,
          defaultValue: '{{value}} sur 5',
        })}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${dim} ${n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  }

  const shown = hover ?? value;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || t('rating.rateThis', { defaultValue: 'Noter cette aide' })}
      className={`inline-flex items-center gap-0.5 ${className}`}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t('rating.stars', {
            count: n,
            defaultValue: '{{count}} étoile(s)',
          })}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHover(n)}
          className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
        >
          <Star
            className={`${dim} transition-colors ${
              n <= shown ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
