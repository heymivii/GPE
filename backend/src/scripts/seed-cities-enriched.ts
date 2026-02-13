import { AppDataSource } from '../db/data-source';
import { City } from '../features/city/entities/city.entity';
import { Country } from '../features/country/entities/country.entity';
import geoDBService from '../services/geodb.service';
import restCountriesService from '../services/restCountries.service';
import slugify from 'slugify';

async function seedCities() {
  console.log('🌱 Starting City Enrichment Seed...');

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    const cityRepo = AppDataSource.getRepository(City);
    const countryRepo = AppDataSource.getRepository(Country);

    const targetCities = [
      {
        name: 'Paris',
        countryCode: 'FR',
        priority: 1,
        description:
          'The City of Light, known for its cafe culture, Eiffel Tower, and art.',
      },
      {
        name: 'Lyon',
        countryCode: 'FR',
        priority: 2,
        description:
          'Capital of Gaul, famous for its gastronomy and historical landmarks.',
      },
      {
        name: 'New York City',
        countryCode: 'US',
        priority: 1,
        description:
          'The Big Apple, a global hub for finance, culture, and entertainment.',
      },
      {
        name: 'Tokyo',
        countryCode: 'JP',
        priority: 1,
        description:
          'A bustling metropolis mixing ultramodern neon with traditional temples.',
      },
      {
        name: 'Zurich',
        countryCode: 'CH',
        priority: 1,
        description:
          'Global center for banking and finance, located at the north end of Lake Zurich.',
      },
    ];

    for (const target of targetCities) {
      console.log(`\nProcessing ${target.name} (${target.countryCode})...`);

      const countryInfo = await restCountriesService.getCountryByCode(
        target.countryCode,
      );
      if (!countryInfo) {
        console.warn(`⚠️ Country data not found for ${target.countryCode}`);
        continue;
      }

      const cityData = await geoDBService.searchCity(
        target.name,
        target.countryCode,
      );

      if (!cityData) {
        console.warn(`⚠️ City data not found for ${target.name} in GeoDB`);
        continue;
      }

      const country = await countryRepo.findOne({
        where: { isoCode: target.countryCode },
      });

      if (country) {
        country.flagUrl = countryInfo.flags.svg;
        country.currency = Object.keys(countryInfo.currencies)[0];
        country.language = Object.values(countryInfo.languages)[0];
        await countryRepo.save(country);
        console.log(`Updated country: ${country.countryName}`);
      } else {
        console.warn(
          `Country ${target.countryCode} does not exist in DB yet. Skipping city.`,
        );
        continue;
      }

      let city = await cityRepo.findOne({
        where: { name: target.name, country: { idCountry: country.idCountry } },
      });

      if (!city) {
        console.log(`Creating new city: ${target.name}`);
        city = new City();
        city.name = cityData.name;
        city.country = country;
      } else {
        console.log(`Updating existing city: ${city.name}`);
      }

      city.slug = slugify(city.name, { lower: true, strict: true });
      city.latitude = cityData.latitude.toString();
      city.longitude = cityData.longitude.toString();
      city.population = cityData.population;
      city.timezone = cityData.timezone || countryInfo.timezones[0];
      city.isCapital = countryInfo.capital.includes(cityData.name);
      city.priority = target.priority;
      city.description = target.description;

      const cityImages: Record<string, string> = {
        Paris:
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        Lyon: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=800&q=80',
        'New York City':
          'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
        Tokyo:
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        Zurich:
          'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
      };

      city.imageUrl =
        cityImages[target.name] ||
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80';

      await cityRepo.save(city);
      console.log(`✅ Successfully enriched ${city.name}`);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCities();
