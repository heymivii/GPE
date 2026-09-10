import { test, expect } from '@playwright/test';
import { trySql } from './utils/db';
import { registerViaUi } from './utils/auth';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

/**
 * Parcours "profil" : consultation, édition, et tentative de suppression de
 * compte. Ce dernier point documente délibérément un bug déjà connu — voir
 * auth-flow.spec.ts et backend/test/user.e2e-spec.ts : `DELETE /users/me`
 * n'a pas de garde d'authentification et plante en 500 — ici on vérifie
 * l'impact réel côté utilisateur (toast d'erreur, compte non supprimé).
 */
test.describe('Parcours profil', () => {
  const email = uniqueEmail('e2e-profile');
  const password = 'Sup3rSecret!';

  test.afterAll(() => {
    trySql(`DELETE FROM app_user WHERE email = '${email}';`, `suppression de ${email}`);
  });

  test('consulte son profil, le modifie, puis échoue à le supprimer (bug connu)', async ({
    page,
  }) => {
    await registerViaUi(page, { firstName: 'Jeanne', lastName: 'Dupont', email, password });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Jeanne Dupont' })).toBeVisible();
    await expect(page.getByText(email).first()).toBeVisible();

    // Édition : change l'âge.
    await page.getByText('Modifier', { exact: true }).click();
    const ageInput = page.getByLabel('Âge');
    await ageInput.fill('35');

    const [updateResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/users/me') && r.request().method() === 'PATCH',
      ),
      page.getByText('Enregistrer les modifications').click(),
    ]);
    expect(updateResponse.status()).toBe(200);
    await expect(page.getByText('Profil mis à jour avec succès')).toBeVisible();

    // Le formulaire revient en lecture avec la nouvelle valeur.
    await expect(page.getByText('35 ans')).toBeVisible();

    // Suppression : le bug connu (guard manquant) fait échouer la requête en 500 —
    // le compte doit rester intact.
    await page.getByText('Supprimer mon compte').click();
    await expect(page.getByText('Êtes-vous vraiment sûr de vouloir supprimer votre compte ?')).toBeVisible();

    const [deleteResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/users/me') && r.request().method() === 'DELETE',
      ),
      page.getByText('Confirmer').click(),
    ]);
    expect(deleteResponse.status()).toBe(500);
    await expect(page.getByText('Erreur lors de la suppression du compte')).toBeVisible();

    // Le compte existe toujours : un rechargement reste sur la page profil connectée.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Jeanne Dupont' })).toBeVisible();
  });
});
