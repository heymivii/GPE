/**
 * Stockage des jetons d'authentification.
 *
 * « Se souvenir de moi » décide de l'endroit :
 *   - coché   → localStorage   : la session survit à la fermeture du navigateur ;
 *   - décoché → sessionStorage : la session meurt avec l'onglet.
 *
 * La case était auparavant décorative — jamais lue, et tout le monde recevait
 * une session persistante de 7 jours. Sur un poste partagé, « décoché » ne
 * protégeait donc de rien.
 *
 * Tout passe par ce module : les jetons étaient lus et écrits à trois endroits
 * (AuthContext, l'intercepteur axios, la restauration au démarrage). Sans point
 * unique, un seul oubli suffisait à réécrire en localStorage et à réinstaller
 * une session persistante à l'insu de l'utilisateur.
 */

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

/** Certains navigateurs (mode privé strict) lèvent à l'accès : on ne casse pas l'app. */
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Le magasin qui détient la session courante, localStorage prioritaire. */
function activeStore(): Storage | null {
  return safe(() => {
    if (localStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY)) {
      return localStorage;
    }
    if (sessionStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(REFRESH_KEY)) {
      return sessionStorage;
    }
    return null;
  }, null);
}

function read(key: string): string | null {
  return safe(
    () => localStorage.getItem(key) ?? sessionStorage.getItem(key),
    null,
  );
}

export const tokenStorage = {
  getAccessToken: (): string | null => read(ACCESS_KEY),
  getRefreshToken: (): string | null => read(REFRESH_KEY),

  /** true quand la session en cours a été ouverte avec « se souvenir de moi ». */
  isPersistent: (): boolean => activeStore() === localStorage,

  /**
   * Ouvre une session. `persistent` fixe le magasin ; l'autre est vidé pour
   * qu'une ancienne session persistante ne survive pas à une connexion
   * non persistante (et inversement).
   */
  setSession(
    tokens: { accessToken?: string; refreshToken?: string },
    persistent: boolean,
  ): void {
    safe(() => {
      const target = persistent ? localStorage : sessionStorage;
      const other = persistent ? sessionStorage : localStorage;

      other.removeItem(ACCESS_KEY);
      other.removeItem(REFRESH_KEY);

      if (tokens.accessToken) target.setItem(ACCESS_KEY, tokens.accessToken);
      if (tokens.refreshToken) target.setItem(REFRESH_KEY, tokens.refreshToken);
    }, undefined);
  },

  /**
   * Renouvelle les jetons SANS changer la nature de la session : un refresh ne
   * doit pas transformer une session d'onglet en session persistante.
   */
  updateTokens(tokens: { accessToken?: string; refreshToken?: string }): void {
    safe(() => {
      const target = activeStore() ?? sessionStorage;
      if (tokens.accessToken) target.setItem(ACCESS_KEY, tokens.accessToken);
      if (tokens.refreshToken) target.setItem(REFRESH_KEY, tokens.refreshToken);
    }, undefined);
  },

  clear(): void {
    safe(() => {
      for (const store of [localStorage, sessionStorage]) {
        store.removeItem(ACCESS_KEY);
        store.removeItem(REFRESH_KEY);
      }
    }, undefined);
  },
};

export default tokenStorage;
