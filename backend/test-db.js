const { Client } = require('pg');

async function check() {
  const client = new Client('postgresql://user:password@localhost:5432/skywalk?schema=public');
  await client.connect();
  const res = await client.query('SELECT c.city_name, c.id_city, col.id, col.expires_at FROM city c LEFT JOIN cost_of_living_cache col ON c.id_city = col.city_id');
  console.log(res.rows);
  await client.end();
}

check().catch(console.error);
