import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations (bypasses RLS)
// Only create if env vars are available (they might not be during build)
export const supabase = 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' && 
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    : null as any;

// Postgres connection (fallback for raw SQL queries)
// Note: DATABASE_URL is optional, Supabase client is preferred
export const sql = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null as any;
