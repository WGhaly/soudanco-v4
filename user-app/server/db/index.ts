import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import postgres from 'postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load env in development
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Use postgres.js for production/Vercel (serverless-friendly), pg Pool for local development
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

let db: ReturnType<typeof drizzlePostgres<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

if (isServerless) {
  // Use postgres.js for serverless environments (works with Prisma Postgres / Neon)
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1, // Limit connections for serverless
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzlePostgres(client, { schema });
} else {
  // Use regular pg Pool for local development
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('prisma.io') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  });
  db = drizzlePg(pool, { schema });
}

export { db };

// Export schema for convenience
export * from './schema';
