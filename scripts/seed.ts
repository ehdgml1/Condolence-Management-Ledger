/**
 * Seed script: Creates a default user account in the database.
 *
 * Usage: npx tsx scripts/seed.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../src/lib/db/schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Seed script cannot run in production environment.');
    process.exit(1);
  }

  const email = 'admin@wedding.local';
  const password = 'password123';

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();

  if (existing) {
    console.log(`User "${email}" already exists. Skipping.`);
  } else {
    await db.insert(schema.users)
      .values({ email, password_hash: passwordHash })
      .run();
    console.log(`Created user: ${email}`);
  }

  console.log('\nSeed complete.');
}

seed().catch(console.error);
