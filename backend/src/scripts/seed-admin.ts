import { AppDataSource } from '../db/data-source';
import { User } from '../features/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  console.log('🌱 Création du compte administrateur...');

  try {
    await AppDataSource.initialize();
    console.log('📦 Base de données connectée');

    const userRepo = AppDataSource.getRepository(User);

    const adminEmail = 'admin@skywalk.com';

    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      if (existingAdmin.roles !== 'admin') {
        existingAdmin.roles = 'admin';
        await userRepo.save(existingAdmin);
        console.log(`✅ Compte existant promu au rôle admin : ${adminEmail}`);
      } else {
        console.log(`ℹ️  Le compte admin existe déjà : ${adminEmail}`);
      }
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@skywalk2024!', 10);

    const admin = userRepo.create({
      firstName: 'Admin',
      lastName: 'SkyWalk',
      email: adminEmail,
      password: hashedPassword,
      roles: 'admin',
    });

    await userRepo.save(admin);

    console.log('\n✨ Compte admin créé avec succès !');
    console.log('------------------------------------');
    console.log(`📧 Email    : ${adminEmail}`);
    console.log(`🔑 Password : Admin@skywalk2024!`);
    console.log('------------------------------------');
    console.log('⚠️  Pensez à changer ce mot de passe en production !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Échec de la création du compte admin :', error);
    process.exit(1);
  }
}

seedAdmin();
