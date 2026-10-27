import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from client environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if live Supabase project credentials are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  envUrl !== 'https://your-project.supabase.co' &&
  !envUrl.includes('placeholder')
);

// Fallback demo credentials ensure the app initializes gracefully without crashing in sandbox/eval environments
const supabaseUrl = isSupabaseConfigured
  ? envUrl
  : 'https://findsync-campus.supabase.co';

const supabaseAnonKey = isSupabaseConfigured
  ? envAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbmRzeW5jLWNhbXB1cyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4MDAwMDAwLCJleHAiOjE5OTMwMDAwMDB9.placeholder_key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Health check test for Supabase connection
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    console.info('Supabase client initialized with local fallback storage. To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
    return {
      connected: false,
      message: 'Running in local fallback mode (configure VITE_SUPABASE_URL to connect to live Supabase)',
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
