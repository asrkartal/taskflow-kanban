// ==========================================
// Supabase Browser Client
// ==========================================
// Creates a Supabase client for use in Client Components.
// Uses cookie-based session management via @supabase/ssr.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
