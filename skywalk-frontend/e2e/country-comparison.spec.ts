import { test, expect } from '@playwright/test';
import { runSql, trySql } from './utils/db';

const CONTINENT_NAME = 'E2E Comparison Continent';

/**
 * `useCountriesWithData` (src/features/comparison/hooks/useCountriesWithData.ts)
 * ne garde, parmi les pays réels de la table `country`, que ceux dont le code
 * ISO figure dans la liste statique `SUPPORTED_COUNTRIES` — on sème donc deux
 * codes qui y figurent (US, CH), différents de ceux utilisés par
 * onboarding-flow.spec.ts (FR, JP) pour ne jamais entrer en collision sur la
 * contrainte unique `country.iso_code` si les specs s'enchaînent.
 */
function seedCountries() {
  cleanupCountries();
  runSql(`
    WITH c AS (
      INSERT INTO continent (name) VALUES ('${CONTINENT_NAME}') RETURNING id_continent
    )
    INSERT INTO country (name, iso_code, continent_id)
    SELECT v.name, v.code, c.id_continent
    FROM c, (VALUES ('E2E Comparison USA', 'US'), ('E2E Comparison Switzerland', 'CH')) AS v(name, code);
  `);
}

function cleanupCountries() {
  trySql(
    `DELETE FROM country WHERE iso_code IN ('US', 'CH') AND name LIKE 'E2E Comparison%';`,
    'suppression des pays de seed',
  );
  trySql(
    `DELETE FROM continent WHERE name = '${CONTINENT_NAME}';`,
    'suppression du continent de seed',
  );
}

/**
 * Parcours critique "comparateur de destinations" : sélectionner deux pays et
 * obtenir un tableau comparatif — fonctionne anonymement (plafonné à 2 pays
 * sans compte, 3 avec). Contrairement à `ComparisonTable.test.tsx` (Vitest,
 * données `EnrichedCountry` injectées directement), ce test vérifie
 * l'intégration réelle : sélection via `CountrySelector`, résolution des pays
 * depuis la vraie base, rendu du tableau.
 */
test.describe('Comparateur de destinations', () => {
  test.beforeAll(() => {
    seedCountries();
  });

  test.afterAll(() => {
    cleanupCountries();
  });

  test('sélectionne deux pays et affiche le tableau comparatif', async ({ page }) => {
    await page.goto('/comparison');

    await expect(page.getByRole('heading', { name: 'Comparateur' })).toBeVisible();

    await page.getByRole('button', { name: 'Sélectionner un pays' }).click();
    await page.getByRole('button', { name: 'États-Unis' }).click();

    // Le menu déroulant reste ouvert après une sélection tant que le plafond
    // n'est pas atteint (CountrySelector ne le referme qu'à la Nième sélection) :
    // pas besoin de rouvrir "Ajouter un pays" avant de choisir le second pays.
    await page.getByRole('button', { name: 'Suisse' }).click();

    // Les deux pays apparaissent à la fois comme "chips" sélectionnés et comme
    // colonnes du tableau comparatif — au moins deux occurrences chacun.
    await expect(page.getByText('États-Unis').first()).toBeVisible();
    await expect(page.getByText('Suisse').first()).toBeVisible();

    // Plafond anonyme : pas de 3e emplacement disponible une fois 2 pays choisis.
    await expect(
      page.getByRole('button', { name: 'Ajouter un pays' }),
    ).toHaveCount(0);
  });
});
