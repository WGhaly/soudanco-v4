import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load env in development
dotenv.config({ path: '.env.local' });

// Use lazy initialization for serverless environments
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('prisma.io') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
      // Serverless-friendly settings
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema });

// Export schema for convenience
export * from './schema';
