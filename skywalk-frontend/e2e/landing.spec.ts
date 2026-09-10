import { test, expect } from '@playwright/test';

/**
 * Fumée minimale sur la page publique : elle se charge, affiche son
 * contenu principal, et la navigation vers la connexion fonctionne. Ne
 * dépend d'aucune donnée créée — sûr à lancer en parallèle d'autres specs.
 */
test.describe('Landing page', () => {
  test('affiche le contenu principal et mène à la connexion', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    await page.getByRole('link', { name: 'Connexion' }).first().click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });
});
