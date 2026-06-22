import { createClient } from '@supabase/supabase-js';

// Read values from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if Supabase is properly configured
export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' && 
  !supabaseUrl.includes('your-supabase-url');

// Create client or mock object if not configured to prevent crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '🔑 Supabase credentials not found in env variables. Running in local fallback mode using localStorage.'
  );
} else {
  console.info('⚡ Supabase client successfully initialized!');
}
