import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from client environment variables
// Supports both VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_ANON_KEY
// Handles both Vite (import.meta.env) and Node.js/tsx test runtimes (process.env)
const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const envUrl = metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL;
const envKey =
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY;

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
    detectSessionInUrl: typeof window !== 'undefined',
    storageKey: 'findsync_supabase_auth_token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
  },
});

export interface SignInWithGoogleOptions {
  redirectTo?: string;
  queryParams?: Record<string, string>;
  scopes?: string;
  skipBrowserRedirect?: boolean;
}

/**
 * Initiates Google OAuth sign-in via Supabase with persistent session handling.
 * Directs the provider to redirect back to the /auth/callback route upon completion.
 */
export async function signInWithGoogle(options?: SignInWithGoogleOptions) {
  // Determine the appropriate redirect URL, prioritizing the dedicated /auth/callback route
  const defaultRedirect =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

  const redirectTo = options?.redirectTo || defaultRedirect;

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: options?.queryParams,
      scopes: options?.scopes,
      skipBrowserRedirect: options?.skipBrowserRedirect,
    },
  });
}

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
