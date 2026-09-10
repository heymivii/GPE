import { execFileSync } from 'node:child_process';

/**
 * Exécute une requête SQL directement contre la base de test, via `psql`
 * (même identifiants par défaut que `backend/test/jest-e2e.setup.js`).
 * Utilisé uniquement pour semer/nettoyer des données de test depuis les specs
 * frontend — aucune route applicative n'a besoin d'exister pour ça, et ça
 * évite de dépendre d'un endpoint qui pourrait lui-même être cassé (voir
 * `auth-flow.spec.ts` : DELETE /api/users/me plante en 500, guard manquant).
 */
export function runSql(sql: string): void {
  const env = {
    PGHOST: process.env.DB_HOST || 'localhost',
    PGPORT: process.env.DB_PORT || '5432',
    PGUSER: process.env.DB_USER || 'skywalk_user',
    PGPASSWORD: process.env.DB_PASS || 'skywalk_password',
    PGDATABASE: process.env.DB_NAME || 'skywalk_db_test',
  };
  execFileSync('psql', ['-v', 'ON_ERROR_STOP=1', '-c', sql], {
    env: { ...process.env, ...env },
    stdio: 'pipe',
  });
}

/** Best-effort : un échec de nettoyage ne doit jamais faire échouer le test. */
export function trySql(sql: string, label: string): void {
  try {
    runSql(sql);
  } catch (err) {
    console.warn(`[e2e cleanup] ${label} a échoué :`, err);
  }
}
