import { defineConfig, devices } from '@playwright/test';

/**
 * Tests E2E "vrai navigateur, vraie pile" : Playwright pilote Chromium contre
 * le frontend Vite ET le backend NestJS réels (tous deux démarrés
 * automatiquement ci-dessous), avec une vraie base Postgres derrière —
 * contrairement aux tests Vitest (fichiers `*.test.tsx` sous `src/`), qui mockent l'API
 * (`vi.mock('../lib/api')`) et ne couvrent donc jamais l'intégration bout-en-bout.
 *
 * Pré-requis pour lancer `npm run test:e2e` en local : une base Postgres
 * atteignable avec les identifiants ci-dessous (voir backend/test/jest-e2e.setup.js
 * pour les mêmes valeurs par défaut côté tests e2e backend).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  // Le throttle d'inscription backend (5/min/IP, partagé par toute la suite
  // puisqu'un seul serveur tourne pour l'ensemble des fichiers) peut forcer
  // `registerViaUi`/`registerViaApi` à attendre ~61 s avant de réessayer — le
  // délai par défaut de 30 s serait systématiquement dépassé dès qu'un fichier
  // déclenche cette attente.
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../backend',
      url: 'http://localhost:3000/api/health',
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'test',
        PORT: '3000',
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USER: process.env.DB_USER || 'skywalk_user',
        DB_PASS: process.env.DB_PASS || 'skywalk_password',
        DB_NAME: process.env.DB_NAME || 'skywalk_db_test',
        JWT_SECRET: process.env.JWT_SECRET || 'e2e-test-secret',
        JWT_REFRESH_SECRET:
          process.env.JWT_REFRESH_SECRET || 'e2e-test-refresh-secret',
        FRONTEND_URL: 'http://localhost:5173',
      },
    },
    {
      command: 'npm run dev',
      cwd: '.',
      url: 'http://localhost:5173',
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: 'http://localhost:3000/api',
      },
    },
  ],
});
