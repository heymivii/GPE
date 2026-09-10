import { test, expect, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { trySql } from './utils/db';
import { registerViaApi } from './utils/auth';

const BACKEND_URL = 'http://localhost:3000/api';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

/**
 * Parcours "messagerie privée" côté UI : `/messages` est derrière
 * `ProtectedRoute`. Le destinataire B est créé directement via l'API (acteur
 * secondaire, non testé à l'écran) ; seul le parcours de l'expéditeur A passe
 * par le vrai navigateur — envoi d'un message via `?to=<id>` (point d'entrée
 * réel depuis une fiche expert/buddy), déjà couvert côté contrat HTTP par
 * `private-message.e2e-spec.ts` (backend), ici on vérifie l'intégration UI.
 */
test.describe('Messagerie privée (UI)', () => {
  const emailA = uniqueEmail('e2e-msg-a');
  const emailB = uniqueEmail('e2e-msg-b');
  const password = 'Sup3rSecret!';
  let api: APIRequestContext;
  let userAId: number;
  let userBId: number;

  test.beforeAll(async () => {
    api = await playwrightRequest.newContext();

    userAId = (
      await registerViaApi(api, { firstName: 'Msg', lastName: 'SenderA', email: emailA, password })
    ).idUser;

    userBId = (
      await registerViaApi(api, {
        firstName: 'Msg',
        lastName: 'RecipientB',
        email: emailB,
        password,
      })
    ).idUser;
  });

  test.afterAll(async () => {
    trySql(
      `DELETE FROM app_user WHERE email IN ('${emailA}', '${emailB}');`,
      'suppression des comptes de test messagerie',
    );
    await api.dispose();
  });

  test('A se connecte, écrit à B via ?to=, le message apparaît dans le fil', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('Email').fill(emailA);
    await page.getByPlaceholder('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.goto(`/messages?to=${userBId}&name=${encodeURIComponent('Msg RecipientB')}`);

    await expect(page.getByText('Msg RecipientB')).toBeVisible();
    await expect(page.getByText('Écrivez le premier message.')).toBeVisible();

    const textarea = page.getByPlaceholder('Votre message…');
    await textarea.fill('Bonjour, on peut échanger sur le visa ?');

    const [sendResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/private-message') && r.request().method() === 'POST',
        { timeout: 10_000 },
      ),
      textarea.press('Enter'),
    ]);
    expect(sendResponse.status()).toBe(201);

    await expect(page.getByText('Bonjour, on peut échanger sur le visa ?')).toBeVisible({
      timeout: 10_000,
    });
    await expect(textarea).toHaveValue('');

    // Le message est bien persisté côté backend (pas seulement affiché en
    // optimiste côté client) : on le relit directement via l'API avec le
    // jeton de B.
    const loginB = await api.post(`${BACKEND_URL}/auth/login`, {
      data: { email: emailB, password },
    });
    const tokenB = (await loginB.json()).access_token;
    const thread = await api.get(`${BACKEND_URL}/private-message/with/${userAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const messages = await thread.json();
    expect(
      messages.some((m: { content: string }) => m.content === 'Bonjour, on peut échanger sur le visa ?'),
    ).toBe(true);
  });
});
