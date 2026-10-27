import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from client environment variables
// Supports both VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_ANON_KEY
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if live Supabase project credentials are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  envUrl !== 'https://your-project.supabase.co' &&
  !envUrl.includes('placeholder')
);

// Fallback demo credentials ensure the app initializes gracefully in preview/sandbox
const supabaseUrl = isSupabaseConfigured
  ? envUrl!
  : 'https://findsync-campus.supabase.co';

const supabaseKey = isSupabaseConfigured
  ? envKey!
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder_key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

/**
 * Health check test for Supabase connection
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Running with local fallback (configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY for live PostgreSQL & Storage)',
    };
  }

  try {
    const { error } = await supabase.from('items').select('id').limit(1);
    if (error) {
      console.warn('Supabase ping notice:', error.message);
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Supabase ping error:', msg);
    return { connected: false, message: msg };
  }
}
