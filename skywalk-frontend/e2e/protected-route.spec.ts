import { test, expect } from '@playwright/test';

/**
 * `ProtectedRoute` (src/components/ProtectedRoute.tsx) redirige vers
 * /auth/login quand isAuthenticated est faux — déjà couvert en isolation par
 * ProtectedRoute.test.tsx (Vitest, contexte mocké). Ici on vérifie le même
 * comportement dans un vrai navigateur, sans session, sur une vraie route de
 * l'arbre de routage.
 */
test.describe('Accès à une route protégée sans session', () => {
  test('redirige /profile vers /auth/login', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
