import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations (bypasses RLS)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase environment variables are not set');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Postgres connection (fallback for raw SQL queries)
// Note: DATABASE_URL is optional now, Supabase client is preferred
export const sql = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null as any;
