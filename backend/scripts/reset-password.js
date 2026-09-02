/**
 * Reset du mot de passe d'un compte (dev/local uniquement).
 *
 * Les mots de passe sont hashés en bcrypt (10 rounds, comme auth.service.ts) :
 * impossible de retrouver un mot de passe existant — on ne peut que le remplacer.
 *
 * Usage :
 *   node scripts/reset-password.js marie@gmail.com Test1234!
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function main() {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password.js <email> <nouveau-mot-de-passe>');
    process.exit(1);
  }

  const host = process.env.DB_HOST || 'localhost';
  if (host !== 'localhost' && host !== '127.0.0.1') {
    console.error(`Refusé : DB_HOST=${host} n'est pas une base locale. Ce script est réservé au dev.`);
    process.exit(1);
  }

  const client = new Client({
    host,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'skywalk_db',
  });
  await client.connect();

  const hash = await bcrypt.hash(newPassword, 10);
  const res = await client.query(
    'UPDATE app_user SET password = $1 WHERE email = $2 RETURNING id_user, email, first_name',
    [hash, email],
  );
  await client.end();

  if (res.rowCount === 0) {
    console.error(`Aucun compte trouvé pour ${email}.`);
    process.exit(1);
  }
  const u = res.rows[0];
  console.log(`OK — mot de passe de ${u.email} (${u.first_name}, id ${u.id_user}) remplacé.`);
  console.log(`Connexion : ${email} / ${newPassword}`);
}

main().catch((e) => {
  console.error('Erreur :', e.message);
  process.exit(1);
});
