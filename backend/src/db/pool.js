import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text, params) {
  return pool.query(text, params);
}
