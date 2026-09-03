import {
  HelpCircle,
  FileText,
  Lightbulb,
  MessagesSquare,
  Megaphone,
  Pin,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { TopicCategoryValues } from '../../types/forum';

/**
 * Icônes des catégories du forum.
 *
 * Ces catégories étaient signalées par des emoji (❓ 📝 💡 …), dupliqués dans
 * quatre pages. Le jeu lucide est celui du reste de l'interface : une seule
 * source, et un rendu cohérent avec les autres écrans (retour de recette).
 */
export type CategoryIcon = ComponentType<{ className?: string }>;

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  [TopicCategoryValues.QUESTION]: HelpCircle,
  [TopicCategoryValues.TESTIMONY]: FileText,
  [TopicCategoryValues.ADVICE]: Lightbulb,
  [TopicCategoryValues.DISCUSSION]: MessagesSquare,
  [TopicCategoryValues.ANNOUNCEMENT]: Megaphone,
  [TopicCategoryValues.OTHER]: Pin,
};

/** Icône d'une catégorie, avec repli sur « autre » pour une valeur inconnue. */
export function categoryIcon(category?: string | null): CategoryIcon {
  return (category && CATEGORY_ICONS[category]) || Pin;
}

/** Teintes de fond associées, réutilisées par les cartes de catégorie. */
export const CATEGORY_COLORS: Record<string, string> = {
  [TopicCategoryValues.QUESTION]: 'bg-blue-50 border-blue-200',
  [TopicCategoryValues.TESTIMONY]: 'bg-green-50 border-green-200',
  [TopicCategoryValues.ADVICE]: 'bg-yellow-50 border-yellow-200',
  [TopicCategoryValues.DISCUSSION]: 'bg-purple-50 border-purple-200',
  [TopicCategoryValues.ANNOUNCEMENT]: 'bg-red-50 border-red-200',
  [TopicCategoryValues.OTHER]: 'bg-gray-50 border-gray-200',
};
