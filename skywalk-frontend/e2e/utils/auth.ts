import type { APIRequestContext, Page } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3000/api';

/**
 * `POST /auth/register` est limité à 5 requêtes/minute PAR IP côté backend
 * (@Throttle sur AuthController.register). Chaque fichier e2e tourne dans
 * son propre process Nest côté tests d'intégration backend (throttle remis à
 * zéro à chaque fois), mais ici TOUTE la suite Playwright partage le MÊME
 * serveur backend (démarré une fois par playwright.config.ts) — au-delà de 5
 * inscriptions cumulées sur toute la suite en moins d'une minute, le
 * formulaire reste bloqué sur /auth/register avec une erreur silencieuse.
 * Cette fonction détecte le 429 et réessaie après une pause plutôt que de
 * planter — le test reste correct fonctionnellement, juste plus lent quand
 * le quota est déjà consommé par des fichiers précédents.
 */
export async function registerViaUi(
  page: Page,
  data: { firstName: string; lastName: string; email: string; password: string },
  options: { skipGoto?: boolean } = {},
): Promise<void> {
  if (!options.skipGoto) await page.goto('/auth/register');
  await page.getByPlaceholder('Prénom').fill(data.firstName);
  await page.getByPlaceholder('Nom', { exact: true }).fill(data.lastName);
  await page.getByPlaceholder('Email').fill(data.email);
  await page.getByPlaceholder('Mot de passe', { exact: true }).fill(data.password);
  await page.getByPlaceholder('Confirmation du mot de passe').fill(data.password);
  await page.locator('#terms').check();

  for (let attempt = 1; attempt <= 3; attempt++) {
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/auth/register') && r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: "Rejoindre l'aventure SkyWalk" }).click(),
    ]);

    if (response.status() !== 429) return;

    // Fenêtre glissante de 60 s côté throttler : on attend qu'elle se libère.
    await page.waitForTimeout(61_000);
  }
}

/** Même logique que `registerViaUi` mais pour un acteur secondaire créé hors
 * navigateur (ex. le destinataire B d'une conversation) — même quota
 * partagé, même retry. */
export async function registerViaApi(
  api: APIRequestContext,
  data: { firstName: string; lastName: string; email: string; password: string },
): Promise<{ idUser: number }> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await api.post(`${BACKEND_URL}/auth/register`, { data });
    if (res.status() !== 429) {
      const body = await res.json();
      return body.user;
    }
    await new Promise((resolve) => setTimeout(resolve, 61_000));
  }
  throw new Error(`registerViaApi: toujours 429 pour ${data.email} après 3 tentatives`);
}
