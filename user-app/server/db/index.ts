import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load env in development
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Use Neon serverless for production/Vercel, pg Pool for local development
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

let db: ReturnType<typeof drizzleNeon<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

if (isServerless) {
  // Use Neon HTTP driver for serverless environments
  const sql = neon(connectionString);
  db = drizzleNeon(sql, { schema });
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
