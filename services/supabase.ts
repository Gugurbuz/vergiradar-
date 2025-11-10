import { createClient } from '@supabase/supabase-js';

// The application was failing because the environment variables were not available in the browser.
// This fix uses the project URL derived from your Supabase project ID to resolve the crash.
const supabaseUrl = 'https://hpmocakvnswspakqtwdu.supabase.co';

// IMPORTANT: The key below is a public placeholder. For the application to fetch data,
// you must replace it with the actual 'anon' key from your Supabase project's API settings.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbW9jYWt2bnN3c3Bha3F0d2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDI2MTIsImV4cCI6MjA3ODM3ODYxMn0.Mogsy-i7AMgazcKafaq9EaGk0hPCQCfxKvdhFyA1kPQ';

if (!supabaseUrl || !supabaseAnonKey) {
  // This check is kept as a safeguard.
  throw new Error("Supabase credentials are not defined. Please check services/supabase.ts");
}

// Create a single, shared Supabase client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);