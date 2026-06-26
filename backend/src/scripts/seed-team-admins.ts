import { AppDataSource } from '../db/data-source';
import { User } from '../features/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Team admin accounts (content review workflow): each member gets an admin account so they
 * receive review notifications and can approve/reject additions (4-eyes rule).
 * INSERT-ONLY: an existing email is never overwritten (a changed password stays changed);
 * an existing non-admin account with that email is promoted to admin.
 */
const TEAM = [
  { firstName: 'Aminata', email: 'aminata@skywalk.com' },
  { firstName: 'Briac', email: 'briac@skywalk.com' },
  { firstName: 'Arphan', email: 'arphan@skywalk.com' },
  { firstName: 'Fatou', email: 'fatou@skywalk.com' },
  { firstName: 'El Mahdi', email: 'elmahdi@skywalk.com' },
  { firstName: 'Hocine', email: 'hocine@skywalk.com' },
];

const INITIAL_PASSWORD = 'Skywalk@2026!';

async function seedTeamAdmins() {
  console.log("🌱 Création des comptes admin de l'équipe...");
  try {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    const hashed = await bcrypt.hash(INITIAL_PASSWORD, 10);

    let created = 0;
    let promoted = 0;
    let skipped = 0;

    for (const member of TEAM) {
      const existing = await userRepo.findOne({ where: { email: member.email } });
      if (existing) {
        if (existing.roles !== 'admin') {
          existing.roles = 'admin';
          await userRepo.save(existing);
          promoted++;
          console.log(`⬆️  ${member.email} : compte existant promu admin`);
        } else {
          skipped++;
          console.log(`ℹ️  ${member.email} : déjà admin, inchangé`);
        }
        continue;
      }
      await userRepo.save(
        userRepo.create({
          firstName: member.firstName,
          lastName: 'SkyWalk',
          email: member.email,
          password: hashed,
          roles: 'admin',
        }),
      );
      created++;
      console.log(`✅ ${member.email} : compte admin créé`);
    }

    console.log('\n------------------------------------');
    console.log(`✨ Terminé : ${created} créé(s), ${promoted} promu(s), ${skipped} inchangé(s)`);
    console.log(`🔑 Mot de passe initial commun : ${INITIAL_PASSWORD}`);
    console.log('⚠️  Chacun doit le changer à sa première connexion !');
    console.log('------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec du seed des comptes équipe :', error);
    process.exit(1);
  }
}

seedTeamAdmins();
