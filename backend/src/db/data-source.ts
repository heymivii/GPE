import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

const host = process.env.DB_HOST || 'localhost';
const useSsl = process.env.DB_SSL === 'true' || host.includes('supabase.co');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'skywalk_db',
  synchronize: false,
  migrations: ['src/db/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  extra: useSsl ? { ssl: { rejectUnauthorized: false } } : undefined,
});
