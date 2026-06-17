import { AppDataSource } from '../db/data-source';
import { Country } from '../features/country/entities/country.entity';
import { AdminProcedure } from '../features/admin-procedure/entities/admin-procedure.entity';
import * as fs from 'fs';
import * as path from 'path';

async function seedProcedures() {
  console.log('🌱 Starting Admin Procedures Seed...');

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    const countryRepo = AppDataSource.getRepository(Country);
    const adminProcRepo = AppDataSource.getRepository(AdminProcedure);

    const frontendDataPath = path.join(__dirname, '../../../skywalk-frontend/src/data/countries-data.json');
    if (!fs.existsSync(frontendDataPath)) {
      throw new Error(`Frontend data file not found at ${frontendDataPath}`);
    }

    const fileContent = fs.readFileSync(frontendDataPath, 'utf8');
    const { countries: frontendCountries } = JSON.parse(fileContent);

    for (const feCountry of frontendCountries) {
      const dbCountry = await countryRepo.findOne({ where: { isoCode: feCountry.code } });
      if (!dbCountry) {
        console.log(`⚠️ Country ${feCountry.name} (${feCountry.code}) not found in database. Skipping.`);
        continue;
      }

      const steps = feCountry.expatProjectTemplate?.steps || [];
      console.log(`Seeding ${steps.length} steps for ${dbCountry.countryName} (${dbCountry.isoCode})...`);

      for (const step of steps) {
        let procedure = await adminProcRepo.findOne({
          where: {
            procedureType: step.title,
            country: { idCountry: dbCountry.idCountry },
          },
        });

        if (!procedure) {
          procedure = adminProcRepo.create({
            procedureType: step.title,
            description: step.description,
            category: step.category,
            stepOrder: step.order,
            averageDelayDays: 30,
            daysBeforeDeparture: step.daysBeforeDeparture ?? null, // ✅ AJOUT
            country: dbCountry,
          });
          await adminProcRepo.save(procedure);
          console.log(`  ✅ Created step: "${step.title}" (${step.category}) - daysBeforeDeparture: ${step.daysBeforeDeparture}`);
        } else {
          procedure.description = step.description;
          procedure.category = step.category;
          procedure.stepOrder = step.order;
          procedure.daysBeforeDeparture = step.daysBeforeDeparture ?? null; // ✅ AJOUT
          await adminProcRepo.save(procedure);
          console.log(`  🔄 Updated step: "${step.title}" - daysBeforeDeparture: ${step.daysBeforeDeparture}`);
        }
      }
    }

    console.log('\n✨ Procedures seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Procedures seeding failed:', error);
    process.exit(1);
  }
}

seedProcedures();