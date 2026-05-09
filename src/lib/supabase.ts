import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pztmbvondjwoicmpsof.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is configured
export const isSupabaseReady = () => !!supabaseKey && supabaseKey.length > 10;
