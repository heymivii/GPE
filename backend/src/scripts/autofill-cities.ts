import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../db/data-source';
import { City } from '../features/city/entities/city.entity';
import { fetchCityAutofill } from '../features/city/city-autofill';

/**
 * Complète les villes déjà en base (image, population, coordonnées, fuseau)
 * depuis les mêmes sources gratuites que le formulaire admin : Open-Meteo pour
 * la géo, Wikipédia pour la photo.
 *
 * L'autofill n'existait qu'à la CRÉATION d'une ville : toutes celles importées
 * avant se retrouvaient sans image, et la page destination affichait alors la
 * même photo Unsplash générique pour toutes — d'où l'impression de données
 * factices.
 *
 *   npm run cities:autofill            # complète uniquement les champs vides
 *   npm run cities:autofill -- --force # réécrit même les champs déjà remplis
 *   npm run cities:autofill -- Lyon    # limite à une ville
 *
 * Ne touche jamais au nom, au pays ni au statut de la ville.
 */
const args = process.argv.slice(2);
const force = args.includes('--force');
const filters = args.filter((a) => !a.startsWith('--')).map((a) => a.toLowerCase());

async function run(): Promise<void> {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(City);

  const cities = await repo.find({ relations: ['country'], order: { name: 'ASC' } });
  const todo = cities.filter((c) => {
    if (filters.length && !filters.includes(c.name.toLowerCase())) return false;
    if (force) return true;
    return !c.imageUrl || c.population == null || !c.latitude || !c.timezone;
  });

  console.log(
    `${todo.length} ville(s) à compléter sur ${cities.length}${force ? ' (--force)' : ''}\n`,
  );

  let filled = 0;
  let failed = 0;

  for (const city of todo) {
    try {
      let data = await fetchCityAutofill(city.name, city.country?.countryName);

      // Une image vide peut vouloir dire « Wikipédia nous a limités », pas
      // « cette ville n'a pas de photo » : on retente une fois, plus lentement,
      // avant de conclure.
      if (!data.imageUrl && !city.imageUrl) {
        await new Promise((r) => setTimeout(r, 3000));
        data = await fetchCityAutofill(city.name, city.country?.countryName);
      }
      const before = { img: !!city.imageUrl, pop: city.population };

      // On ne remplit que les trous, sauf --force : une donnée corrigée à la
      // main dans l'admin ne doit pas être écrasée par un passage du script.
      if (data.imageUrl && (force || !city.imageUrl)) city.imageUrl = data.imageUrl;
      if (data.population != null && (force || city.population == null))
        city.population = data.population;
      if (data.latitude != null && (force || !city.latitude))
        city.latitude = String(data.latitude);
      if (data.longitude != null && (force || !city.longitude))
        city.longitude = String(data.longitude);
      if (data.timezone && (force || !city.timezone)) city.timezone = data.timezone;

      await repo.save(city);
      filled++;
      const gained = [
        !before.img && city.imageUrl ? 'image' : null,
        before.pop == null && city.population != null ? 'population' : null,
      ].filter(Boolean);
      console.log(
        `✅ ${city.name} (${city.country?.countryName ?? '?'})` +
          (gained.length ? ` → ${gained.join(', ')}` : ' → déjà complet'),
      );
    } catch (e) {
      failed++;
      console.error(`❌ ${city.name} : ${(e as Error).message}`);
    }
    // Politesse envers Wikipédia et Open-Meteo (aucune clé, aucun quota payé),
    // et surtout marge suffisante pour ne pas déclencher leur limitation.
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\n✨ Terminé — ${filled} complétée(s), ${failed} en échec.`);
  await AppDataSource.destroy();
}

run().catch(async (err) => {
  console.error('Échec du script :', err);
  process.exit(1);
});
