import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pztmbvondjwoicmpsof.supabase.co';
const fallbackKey = 'sb_publishable_Ne3eLwLkUUZZgwdvwR_V1g_oHidDfxB';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is configured
export const isSupabaseReady = () => {
  const key = supabaseKey;
  return !!key && (key.length > 10 || key.startsWith('sb_publishable_'));
};
