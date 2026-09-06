/**
 * Politique de réessai des requêtes de lecture.
 *
 * Le client était construit avec `new QueryClient()`, donc avec le réglage par
 * défaut de TanStack Query : trois réessais, en attente exponentielle. Une
 * erreur définitive — 404 sur une ville inexistante, 403 sur une ressource
 * interdite — était donc rejouée quatre fois avant que l'écran d'erreur
 * n'apparaisse : l'utilisateur voyait tourner un indicateur pendant environ
 * sept secondes pour un résultat connu dès la première réponse.
 *
 * On ne réessaie donc que ce qui a une chance d'aboutir : les pannes réseau et
 * les erreurs serveur (5xx). Le 408 (délai dépassé) et le 429 (trop de
 * requêtes) sont transitoires eux aussi, on les conserve.
 */
export const MAX_TENTATIVES = 2;

export function retryQuery(nbEchecs: number, erreur: unknown): boolean {
  if (nbEchecs >= MAX_TENTATIVES) return false;

  const statut = statutHttp(erreur);
  if (statut !== null) {
    if (statut === 408 || statut === 429) return true;
    return statut >= 500;
  }

  // Pas de statut : panne réseau ou erreur non qualifiable — on réessaie.
  return true;
}

/**
 * Statut HTTP porté par une erreur axios, ou null. On lit la forme plutôt que
 * d'importer `isAxiosError` : la déclaration de types d'axios ne l'expose pas
 * de façon fiable selon la résolution de modules du projet.
 */
function statutHttp(erreur: unknown): number | null {
  const reponse = (erreur as { response?: { status?: unknown } } | null)?.response;
  return typeof reponse?.status === 'number' ? reponse.status : null;
}
