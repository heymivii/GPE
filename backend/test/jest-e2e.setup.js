// Valeurs par défaut pour lancer la suite e2e en local sans rien configurer.
// En CI, les variables déjà présentes dans l'environnement (ci.yml) priment
// toujours grâce aux `||`.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'skywalk_user';
process.env.DB_PASS = process.env.DB_PASS || 'skywalk_password';
process.env.DB_NAME = process.env.DB_NAME || 'skywalk_db_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-secret';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'e2e-test-refresh-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
