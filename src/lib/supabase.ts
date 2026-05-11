import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pztmbrvondjwoicmpsof.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dG1icnZvbmRqd29pY21wc29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDc2MTcsImV4cCI6MjA5MzkyMzYxN30.965Vg-frh1UnIB-UuqMDGYUKiac4-fqkHrAPbBZRFbE';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is configured
export const isSupabaseReady = () => {
  const key = supabaseKey;
  return !!key && key.startsWith('eyJ');
};
