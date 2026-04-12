import { createClient } from '@supabase/supabase-backend-js'; // or '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("MOG Warning: Supabase credentials missing from Environment Variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

