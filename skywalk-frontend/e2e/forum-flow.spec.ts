import { test, expect } from '@playwright/test';
import { trySql } from './utils/db';
import { registerViaUi } from './utils/auth';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

/**
 * Parcours "forum" côté UI : créer un topic, arriver sur sa page de détail,
 * puis y publier une réponse. Le contrat HTTP (validation, modération,
 * droits) est déjà couvert par forum-topic.e2e-spec.ts et
 * forum-message.e2e-spec.ts (backend) — ce test vérifie l'intégration réelle
 * à travers les deux formulaires React (`NewPostPage`, `PostDetailPage`).
 */
test.describe('Parcours forum (UI)', () => {
  const email = uniqueEmail('e2e-forum');
  const password = 'Sup3rSecret!';
  const topicTitle = `Question visa e2e ${Date.now()}`;

  test.afterAll(() => {
    trySql(
      `DELETE FROM forum_message WHERE topic_id IN (SELECT id_forum_topic FROM forum_topic WHERE title = '${topicTitle}');`,
      'suppression des messages du topic de test',
    );
    trySql(
      `DELETE FROM forum_topic WHERE title = '${topicTitle}';`,
      'suppression du topic de test',
    );
    trySql(`DELETE FROM app_user WHERE email = '${email}';`, `suppression de ${email}`);
  });

  test('crée un topic puis y publie une réponse', async ({ page }) => {
    await registerViaUi(page, { firstName: 'Forum', lastName: 'Testeur', email, password });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto('/forum/new');
    await page.getByPlaceholder('Ex: Comment obtenir un visa?').fill(topicTitle);
    await page
      .getByPlaceholder('Décrivez votre question ou partagez plus de détails...')
      .fill('Contenu de test e2e pour la création de topic depuis le formulaire réel.');
    await page.getByRole('button', { name: 'Discussion' }).click();

    const [createResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/forum-topic') && r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Publier le topic' }).click(),
    ]);
    expect(createResponse.status()).toBe(201);

    await expect(page).toHaveURL(/\/forum\/post\/\d+/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: topicTitle })).toBeVisible();

    // Réponse au topic.
    const replyText = 'Réponse e2e : merci pour ce partage, très clair !';
    await page.getByPlaceholder('Écrivez votre réponse...').fill(replyText);

    const [replyResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/forum-message') && r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Publier la réponse' }).click(),
    ]);
    expect(replyResponse.status()).toBe(201);

    await expect(page.getByText(replyText)).toBeVisible({ timeout: 10_000 });
  });
});
