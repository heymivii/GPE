import { AppDataSource } from '../db/data-source';
import { Continent } from '../features/continent/entities/continent.entity';
import { Country } from '../features/country/entities/country.entity';
import { City } from '../features/city/entities/city.entity';

async function seedMain() {
  console.log('🌱 Starting Global Seed...');

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    const continentRepo = AppDataSource.getRepository(Continent);
    const countryRepo = AppDataSource.getRepository(Country);
    const cityRepo = AppDataSource.getRepository(City);

    // 1. Seed Continents
    const continentsData = [
      { name: 'Europe', isoCode: 'EU' },
      { name: 'Asia', isoCode: 'AS' },
      { name: 'North America', isoCode: 'NA' },
      { name: 'South America', isoCode: 'SA' },
      { name: 'Africa', isoCode: 'AF' },
      { name: 'Oceania', isoCode: 'OC' },
      { name: 'Antarctica', isoCode: 'AN' },
    ];

    const continentMap = new Map<string, Continent>();

    for (const data of continentsData) {
      let cont = await continentRepo.findOne({ where: { name: data.name } });
      if (!cont) {
        cont = continentRepo.create(data);
        await continentRepo.save(cont);
        console.log(`✅ Continent created: ${data.name}`);
      }
      continentMap.set(data.name, cont);
    }

    // 2. Seed Countries
    const countriesData = [
      { name: 'France', isoCode: 'FR', continent: 'Europe' },
      { name: 'Switzerland', isoCode: 'CH', continent: 'Europe' },
      { name: 'United States', isoCode: 'US', continent: 'North America' },
      { name: 'Japan', isoCode: 'JP', continent: 'Asia' },
      { name: 'Canada', isoCode: 'CA', continent: 'North America' },
    ];

    const countryMap = new Map<string, Country>();

    for (const data of countriesData) {
      let country = await countryRepo.findOne({ where: { isoCode: data.isoCode } });
      if (!country) {
        const continent = continentMap.get(data.continent);
        country = countryRepo.create({
          countryName: data.name,
          isoCode: data.isoCode,
          continent: continent,
        });
        await countryRepo.save(country);
        console.log(`✅ Country created: ${data.name}`);
      }
      countryMap.set(data.isoCode, country);
    }

    // 3. Seed Cities
    const citiesData = [
      { name: 'Paris', countryCode: 'FR', population: 2161000, isCapital: true },
      { name: 'Lyon', countryCode: 'FR', population: 513275, isCapital: false },
      { name: 'Zurich', countryCode: 'CH', population: 415367, isCapital: false },
      { name: 'Bern', countryCode: 'CH', population: 133883, isCapital: true },
      { name: 'New York', countryCode: 'US', population: 8336817, isCapital: false },
      { name: 'Tokyo', countryCode: 'JP', population: 13929286, isCapital: true },
    ];

    for (const data of citiesData) {
      const country = countryMap.get(data.countryCode);
      if (!country) continue;

      let city = await cityRepo.findOne({ 
        where: { name: data.name, country: { idCountry: country.idCountry } } 
      });

      if (!city) {
        city = cityRepo.create({
          name: data.name,
          population: data.population,
          isCapital: data.isCapital,
          country: country,
          timezone: 'UTC', // Default
        });
        await cityRepo.save(city);
        console.log(`✅ City created: ${data.name}`);
      }
    }

    console.log('\n✨ Global Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedMain();
