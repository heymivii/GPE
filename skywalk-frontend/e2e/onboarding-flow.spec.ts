import { test, expect } from '@playwright/test';
import { runSql, trySql } from './utils/db';
import { registerViaUi } from './utils/auth';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.skywalk.test`;
}

const CONTINENT_NAME = 'E2E Onboarding Continent';

/**
 * `OnboardingFlow` (src/features/onboarding/pages/OnboardingFlow.tsx) résout
 * le pays de destination via `countryApi.getAll()` (la vraie table `country`),
 * PAS via la liste statique `SUPPORTED_COUNTRIES` qu'utilise `DestinationStep`
 * pour peupler ses <select> — sans au moins un pays réel en base, la création
 * de projet échoue silencieusement (`onboarding.invalidDestination`). On sème
 * donc deux pays dont le code ISO correspond à des entrées de la liste
 * statique (FR, JP) : `buildSupportedCountry` réutilise alors l'entrée seed
 * telle quelle, et les deux apparaissent dans les <select> de l'étape 1.
 */
function seedCountries() {
  // Idempotent : tolère les résidus d'un run précédent interrompu avant son
  // propre nettoyage (mêmes comptes @e2e.skywalk.test, même pays FR/JP).
  cleanupAll();
  runSql(`
    WITH c AS (
      INSERT INTO continent (name) VALUES ('${CONTINENT_NAME}') RETURNING id_continent
    )
    INSERT INTO country (name, iso_code, continent_id)
    SELECT v.name, v.code, c.id_continent
    FROM c, (VALUES ('E2E Origin France', 'FR'), ('E2E Destination Japan', 'JP')) AS v(name, code);
  `);
}

/**
 * Ordre de suppression imposé par les FK sans cascade : les projets
 * référencent l'utilisateur ET le pays de destination, `app_user` référence
 * le pays d'origine (`country_origin_id`, écrit par `handleComplete` via
 * `userApi.updateProfile`) — dans cet ordre précis, chaque étape lève le
 * verrou de la suivante.
 */
function cleanupAll(email?: string) {
  trySql(
    `DELETE FROM expatriation_project
     WHERE destination_country_id IN (SELECT id_country FROM country WHERE iso_code IN ('FR', 'JP'));`,
    'suppression des projets rattachés aux pays de seed',
  );
  trySql(
    `DELETE FROM app_user WHERE email LIKE 'e2e-onboarding-%@e2e.skywalk.test'${
      email ? ` OR email = '${email}'` : ''
    };`,
    'suppression des comptes de test onboarding',
  );
  trySql(`DELETE FROM country WHERE iso_code IN ('FR', 'JP');`, 'suppression des pays de seed');
  trySql(
    `DELETE FROM continent WHERE name = '${CONTINENT_NAME}';`,
    'suppression du continent de seed',
  );
}

/**
 * Parcours critique "tunnel d'acquisition" : un visiteur anonyme remplit tout
 * le wizard d'onboarding (le brouillon vit en localStorage, aucune session
 * requise), puis se heurte au mur d'inscription (`AuthGateStep`) en voulant
 * valider — c'est le contrat central du produit : de la valeur AVANT de
 * demander un compte. La création de compte doit ensuite déclencher la
 * sauvegarde automatique du brouillon en vrai projet (OnboardingFlow, effet
 * `tryAutoSave`), sans repasser par le formulaire.
 */
test.describe('Parcours onboarding anonyme → inscription → projet', () => {
  const email = uniqueEmail('e2e-onboarding');
  const password = 'Sup3rSecret!';

  test.beforeAll(() => {
    seedCountries();
  });

  test.afterAll(() => {
    cleanupAll(email);
  });

  test("complète le wizard anonymement, puis crée son compte et son projet au mur d'inscription", async ({
    page,
  }) => {
    await page.goto('/onboarding');

    // Étape 1 — Destination.
    await page.getByLabel('Pays de départ').selectOption({ value: 'FR' });
    await page.getByLabel('Pays de destination').selectOption({ value: 'JP' });
    await page.getByLabel('Votre nationalité').selectOption({ value: 'FR' });
    await page.getByLabel(/Date de départ prévue/).fill('2099-06-01');
    await page.getByText('Suivant').click();

    // Étape 2 — Profil.
    await page.getByLabel('Âge').fill('30');
    await page.getByLabel('Langue maternelle').selectOption({ label: 'Français' });
    await page.getByLabel('Statut actuel').selectOption({ value: 'employee' });
    await page.getByRole('radio', { name: 'Seul' }).click();
    await page
      .getByLabel('Niveau de langue du pays de destination')
      .selectOption({ value: 'A1' });
    await page.getByText('Suivant').click();

    // Étape 3 — Objectif.
    await page.getByRole('radio', { name: 'Travail' }).click();
    await page.getByLabel('Durée prévue du séjour').selectOption({ value: '1_3_years' });
    await page.getByText('Suivant').click();

    // Étape 4 — Préparation & moyens.
    await page.getByRole('button', { name: 'Aucune démarche' }).click();
    await page.getByLabel('Budget mensuel pour le logement').fill('900');
    await page.getByText('Suivant').click();

    // Étape 5 — Besoins.
    await page.getByRole('button', { name: 'Logement' }).click();
    await page.getByText('Suivant').click();

    // Étape 6 — Récapitulatif : anonyme → le mur d'inscription doit apparaître,
    // pas une création de projet directe.
    await page.getByRole('button', { name: 'Valider et créer mon projet' }).click();
    await expect(
      page.getByText('Sauvegardez votre projet pour continuer'),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'Créer mon compte gratuit' }).click();
    await expect(page).toHaveURL(/\/auth\/register\?redirect=/);

    await registerViaUi(
      page,
      { firstName: 'Onboard', lastName: 'Test', email, password },
      { skipGoto: true },
    );

    // Bug découvert en écrivant ce test — PAS corrigé (hors périmètre) :
    // `PublicRoute` (src/components/PublicRoute.tsx) redirige vers `/dashboard`
    // en dur dès que `isAuthenticated` passe à `true`, sans jamais regarder le
    // paramètre `redirect` de l'URL. RegisterForm appelle bien
    // `navigate('/onboarding?save=true')` dans son `onSuccess`, mais l'inscription
    // rend `isAuthenticated` vrai au même rendu — PublicRoute gagne la course et
    // écrase cette navigation. Résultat : le nouvel utilisateur atterrit sur
    // /dashboard, PAS sur /onboarding, et son brouillon (destination, profil,
    // budget…) n'est jamais transformé en projet à cet instant.
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    // Le brouillon n'est pas perdu pour autant : `skywalk-should-save` (posé par
    // AuthGateStep) et le brouillon lui-même vivent toujours en localStorage.
    // Si l'utilisateur revient sur /onboarding — au hasard, ou via un lien "Reprendre
    // mon projet" — `tryAutoSave` complète la sauvegarde a posteriori. Ce test vérifie
    // que ce filet de rattrapage fonctionne réellement, puisque le chemin direct ne le
    // fait pas.
    const shouldSaveFlag = await page.evaluate(() =>
      localStorage.getItem('skywalk-should-save'),
    );
    expect(shouldSaveFlag).toBe('true');

    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/projects$/, { timeout: 20_000 });
  });
});
