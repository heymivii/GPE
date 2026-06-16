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

    // Read countries-data.json from frontend
    const frontendDataPath = path.join(__dirname, '../../../skywalk-frontend/src/data/countries-data.json');
    if (!fs.existsSync(frontendDataPath)) {
      throw new Error(`Frontend data file not found at ${frontendDataPath}`);
    }

    const fileContent = fs.readFileSync(frontendDataPath, 'utf8');
    const { countries: frontendCountries } = JSON.parse(fileContent);

    for (const feCountry of frontendCountries) {
      // Find country in database by ISO code
      const dbCountry = await countryRepo.findOne({ where: { isoCode: feCountry.code } });
      if (!dbCountry) {
        console.log(`⚠️ Country ${feCountry.name} (${feCountry.code}) not found in database. Skipping.`);
        continue;
      }

      const steps = feCountry.expatProjectTemplate?.steps || [];
      console.log(`Seeding ${steps.length} steps for ${dbCountry.countryName} (${dbCountry.isoCode})...`);

      for (const step of steps) {
        // Check if procedure already exists to avoid duplicates
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
            averageDelayDays: 30, // Default delay
            country: dbCountry,
          });
          await adminProcRepo.save(procedure);
          console.log(`  ✅ Created step: "${step.title}" (${step.category})`);
        } else {
          // Update existing steps just in case description/category/order changed
          procedure.description = step.description;
          procedure.category = step.category;
          procedure.stepOrder = step.order;
          await adminProcRepo.save(procedure);
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
