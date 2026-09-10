// Exécuté une seule fois, dans le process principal, avant tous les fichiers
// e2e — évite que plusieurs workers Jest lancent `runMigrations()` en même
// temps sur la même base (race condition sur la création des tables).
// transpile-only : on veut juste exécuter les migrations, pas type-checker
// tout le graphe d'entités (déjà fait par `tsc`/`ts-jest` ailleurs).
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
require('ts-node/register');
require('tsconfig-paths/register');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'skywalk_user';
process.env.DB_PASS = process.env.DB_PASS || 'skywalk_password';
process.env.DB_NAME = process.env.DB_NAME || 'skywalk_db_test';

module.exports = async function globalSetup() {
  const { AppDataSource } = require('../src/db/data-source');
  await AppDataSource.initialize();
  const applied = await AppDataSource.runMigrations();
  // eslint-disable-next-line no-console
  console.log(
    `[e2e:globalSetup] ${applied.length} migration(s) appliquée(s) sur ${process.env.DB_NAME}`,
  );
  await AppDataSource.destroy();
};
