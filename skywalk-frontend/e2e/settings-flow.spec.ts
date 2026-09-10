import { test, expect } from '@playwright/test';
import { trySql } from './utils/db';
import { registerViaUi } from './utils/auth';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

/**
 * Parcours "réglages" : préférences purement client (devise d'affichage,
 * langue), persistées en localStorage — aucun appel backend, contrairement
 * aux autres parcours de cette suite. Vérifie que le choix survit à un
 * rechargement de page, le seul comportement qu'un test Vitest en isolation
 * (SettingsPage.test.tsx, `useCurrency` mocké) ne peut pas prouver.
 */
test.describe('Parcours réglages', () => {
  const email = uniqueEmail('e2e-settings');
  const password = 'Sup3rSecret!';

  test.afterAll(() => {
    trySql(`DELETE FROM app_user WHERE email = '${email}';`, `suppression de ${email}`);
  });

  test('change la devise et la langue, les deux survivent à un rechargement', async ({ page }) => {
    await registerViaUi(page, { firstName: 'Régis', lastName: 'Lages', email, password });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Réglages' })).toBeVisible();
    await expect(page.getByText('Régis Lages')).toBeVisible();

    // Devise : EUR est le défaut, on bascule sur USD.
    await page.getByRole('button', { name: '$ USD' }).click();
    await expect(page.getByRole('button', { name: '$ USD' })).toHaveClass(/bg-gray-900/);

    // Langue : bascule sur l'anglais — le titre de la page change immédiatement.
    await page.getByRole('button', { name: /English/ }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Les deux préférences survivent à un rechargement complet de la page.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: '$ USD' })).toHaveClass(/bg-gray-900/);
  });
});
