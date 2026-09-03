import { ForumMessage } from './entities/forum-message.entity';

/** Texte affiché à la place d'un message modéré. */
export const MODERATED_PLACEHOLDER = '[Message supprimé par la modération]';

/**
 * Remplace le contenu d'un message modéré avant de le renvoyer au client.
 *
 * La colonne `is_moderated` existait et était indexée, mais aucune requête ne
 * la lisait : un message modéré restait visible tel quel dans le fil.
 *
 * Ce masquage vit ici, et non dans un service, parce que les messages d'un
 * sujet sont chargés par DEUX chemins indépendants — ForumMessageService et
 * ForumTopicService (via la relation `messages`). Masquer dans un seul des deux
 * laissait l'autre servir le contenu brut, ce qui est exactement ce qui s'est
 * produit : la page d'un sujet passe par ForumTopicService.
 *
 * On conserve la ligne plutôt que de la supprimer : le fil garde sa cohérence
 * et l'historique reste exploitable côté admin.
 */
export function maskModerated<T extends ForumMessage>(message: T): T {
  if (!message?.isModerated) return message;
  return { ...message, content: MODERATED_PLACEHOLDER } as T;
}

export function maskModeratedList<T extends ForumMessage>(messages: T[]): T[] {
  return messages?.map((m) => maskModerated(m)) ?? messages;
}
