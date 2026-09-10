import { test, expect } from '@playwright/test';
import { trySql } from './utils/db';
import { registerViaUi } from './utils/auth';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

/**
 * Nettoyage direct en base (et non via DELETE /api/users/me) : en écrivant ce
 * test, on a découvert que cette route n'a PAS de `@UseGuards(JwtAuthGuard)`
 * (contrairement à ses voisines du même contrôleur) — `req.user` y est donc
 * toujours `undefined` et l'appel plante en 500 (`Cannot read properties of
 * undefined (reading 'userId')`) au lieu de supprimer le compte. Un vrai bug
 * applicatif, hors périmètre de cette tâche (tests uniquement, code
 * inchangé) — à signaler séparément, pas à corriger ici.
 */
function deleteTestUser(email: string) {
  trySql(`DELETE FROM app_user WHERE email = '${email}';`, `suppression de ${email}`);
}

/**
 * Parcours critique "inscription → session → déconnexion → reconnexion",
 * dans un vrai navigateur, contre le vrai backend NestJS et une vraie base
 * Postgres (voir playwright.config.ts : les deux serveurs sont démarrés
 * automatiquement). Contrairement à RegisterForm.test.tsx / LoginForm.test.tsx
 * (Vitest, `authApi` mocké), ceci vérifie l'intégration réelle de bout en bout.
 */
test.describe('Parcours authentification', () => {
  const email = uniqueEmail('e2e-frontend');
  const password = 'Sup3rSecret!';
  const firstName = 'Ada';
  const lastName = 'Lovelace';

  test.afterAll(() => {
    deleteTestUser(email);
  });

  test("s'inscrit, est redirigé vers le tableau de bord, se déconnecte puis se reconnecte", async ({
    page,
  }) => {
    await registerViaUi(page, { firstName, lastName, email, password });

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Ouvre le menu utilisateur (avatar) puis déconnecte.
    await page.getByRole('button', { name: `${firstName} ${lastName}` }).click();
    await page.getByRole('button', { name: 'Déconnexion' }).click();

    await expect(page).toHaveURL(/\/$|\/auth\/login/, { timeout: 10_000 });

    // Reconnexion avec les identifiants créés à l'instant.
    await page.goto('/auth/login');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});
