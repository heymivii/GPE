import { AppDataSource } from '../db/data-source';
import { City } from '../features/city/entities/city.entity';
import { Country } from '../features/country/entities/country.entity';
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
      // France
      {
        name: 'Paris',
        countryCode: 'FR',
        priority: 1,
        isCapital: true,
        latitude: '48.8566',
        longitude: '2.3522',
        population: 2161000,
        timezone: 'Europe/Paris',
        description:
          'The City of Light, known for its cafe culture, Eiffel Tower, and art.',
      },
      {
        name: 'Marseille',
        countryCode: 'FR',
        priority: 2,
        isCapital: false,
        latitude: '43.2965',
        longitude: '5.3698',
        population: 861635,
        timezone: 'Europe/Paris',
        description:
          'A port city known for its historic Vieux-Port and vibrant culture.',
      },
      {
        name: 'Lyon',
        countryCode: 'FR',
        priority: 3,
        isCapital: false,
        latitude: '45.7640',
        longitude: '4.8357',
        population: 513275,
        timezone: 'Europe/Paris',
        description:
          'Capital of Gaul, famous for its gastronomy and historical landmarks.',
      },
      {
        name: 'Toulouse',
        countryCode: 'FR',
        priority: 4,
        isCapital: false,
        latitude: '43.6047',
        longitude: '1.4442',
        population: 471941,
        timezone: 'Europe/Paris',
        description:
          'The Pink City, a hub for aerospace and known for its distinct architecture.',
      },
      {
        name: 'Nice',
        countryCode: 'FR',
        priority: 5,
        isCapital: false,
        latitude: '43.7102',
        longitude: '7.2620',
        population: 342522,
        timezone: 'Europe/Paris',
        description: 'A glamorous city on the French Riviera.',
      },

      // United States
      {
        name: 'New York City',
        countryCode: 'US',
        priority: 1,
        isCapital: false,
        latitude: '40.7128',
        longitude: '-74.0060',
        population: 8336817,
        timezone: 'America/New_York',
        description:
          'The Big Apple, a global hub for finance, culture, and entertainment.',
      },
      {
        name: 'Los Angeles',
        countryCode: 'US',
        priority: 2,
        isCapital: false,
        latitude: '34.0522',
        longitude: '-118.2437',
        population: 3979576,
        timezone: 'America/Los_Angeles',
        description: 'The entertainment capital of the world.',
      },
      {
        name: 'Chicago',
        countryCode: 'US',
        priority: 3,
        isCapital: false,
        latitude: '41.8781',
        longitude: '-87.6298',
        population: 2693976,
        timezone: 'America/Chicago',
        description: 'Known for its bold architecture and deep-dish pizza.',
      },
      {
        name: 'Houston',
        countryCode: 'US',
        priority: 4,
        isCapital: false,
        latitude: '29.7604',
        longitude: '-95.3698',
        population: 2320268,
        timezone: 'America/Chicago',
        description:
          'A large metropolis in Texas, closely linked with the Space Center.',
      },
      {
        name: 'Phoenix',
        countryCode: 'US',
        priority: 5,
        isCapital: false,
        latitude: '33.4484',
        longitude: '-112.0740',
        population: 1680992,
        timezone: 'America/Phoenix',
        description:
          'The capital of Arizona, known for its warm climate and desert landscapes.',
      },

      // Japan
      {
        name: 'Tokyo',
        countryCode: 'JP',
        priority: 1,
        isCapital: true,
        latitude: '35.6762',
        longitude: '139.6503',
        population: 13929286,
        timezone: 'Asia/Tokyo',
        description:
          'A bustling metropolis mixing ultramodern neon with traditional temples.',
      },
      {
        name: 'Yokohama',
        countryCode: 'JP',
        priority: 2,
        isCapital: false,
        latitude: '35.4437',
        longitude: '139.6380',
        population: 3726167,
        timezone: 'Asia/Tokyo',
        description:
          'A major port city known for its large Chinatown and Minato Mirai.',
      },
      {
        name: 'Osaka',
        countryCode: 'JP',
        priority: 3,
        isCapital: false,
        latitude: '34.6937',
        longitude: '135.5023',
        population: 2691185,
        timezone: 'Asia/Tokyo',
        description:
          'Famous for its modern architecture, nightlife, and hearty street food.',
      },
      {
        name: 'Nagoya',
        countryCode: 'JP',
        priority: 4,
        isCapital: false,
        latitude: '35.1815',
        longitude: '136.9066',
        population: 2326167,
        timezone: 'Asia/Tokyo',
        description: 'A manufacturing and shipping hub in central Honshu.',
      },
      {
        name: 'Sapporo',
        countryCode: 'JP',
        priority: 5,
        isCapital: false,
        latitude: '43.0618',
        longitude: '141.3545',
        population: 1952356,
        timezone: 'Asia/Tokyo',
        description: 'Known for its beer, skiing, and annual snow festival.',
      },

      // Switzerland
      {
        name: 'Zurich',
        countryCode: 'CH',
        priority: 1,
        isCapital: false,
        latitude: '47.3769',
        longitude: '8.5417',
        population: 415367,
        timezone: 'Europe/Zurich',
        description:
          'Global center for banking and finance, located at the north end of Lake Zurich.',
      },
      {
        name: 'Geneva',
        countryCode: 'CH',
        priority: 2,
        isCapital: false,
        latitude: '46.2044',
        longitude: '6.1432',
        population: 201818,
        timezone: 'Europe/Zurich',
        description:
          'A global hub for diplomacy and banking, hosting many international organizations.',
      },
      {
        name: 'Basel',
        countryCode: 'CH',
        priority: 3,
        isCapital: false,
        latitude: '47.5596',
        longitude: '7.5886',
        population: 177654,
        timezone: 'Europe/Zurich',
        description:
          'A city on the Rhine River, known for its museums and art.',
      },
      {
        name: 'Lausanne',
        countryCode: 'CH',
        priority: 4,
        isCapital: false,
        latitude: '46.5197',
        longitude: '6.6323',
        population: 139111,
        timezone: 'Europe/Zurich',
        description:
          'A city on Lake Geneva, headquarters of the International Olympic Committee.',
      },
      {
        name: 'Bern',
        countryCode: 'CH',
        priority: 5,
        isCapital: true,
        latitude: '46.9480',
        longitude: '7.4474',
        population: 133883,
        timezone: 'Europe/Zurich',
        description:
          'The capital of Switzerland, with a well-preserved medieval old town.',
      },
    ];

    for (const target of targetCities) {
      console.log(`\nProcessing ${target.name} (${target.countryCode})...`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const countryInfo = await restCountriesService.getCountryByCode(
        target.countryCode,
      );
      if (!countryInfo) {
        console.warn(`⚠️ Country data not found for ${target.countryCode}`);
        continue;
      }

      // Skipping GeoDB call due to rate limits and API deprecations.
      // Using hardcoded data from the targetCities array instead.

      const country = await countryRepo.findOne({
        where: { isoCode: target.countryCode },
      });

      if (!country) {
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
        city.name = target.name;
        city.country = country;
      } else {
        console.log(`Updating existing city: ${city.name}`);
      }

      city.latitude = target.latitude;
      city.longitude = target.longitude;
      city.population = target.population;
      city.timezone = target.timezone;
      city.isCapital = target.isCapital;

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

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCities();
