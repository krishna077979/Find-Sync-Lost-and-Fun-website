
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey
);

export const supabase = createClient(
  supabaseUrl ?? 'https://example.invalid',
  supabaseKey ?? 'missing-supabase-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  }
);

export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('campuses')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}