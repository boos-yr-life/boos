import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use DIRECT_URL for migrations (not pooled)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
