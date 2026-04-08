/**
 * M.O.G. — Supabase Client
 * This file initialises the Supabase connection for all pages.
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your real values.
 *
 * HOW TO GET YOUR KEYS:
 * 1. Go to supabase.com → Your Project
 * 2. Click Settings (gear icon) → API
 * 3. Copy "Project URL" → paste as SUPABASE_URL
 * 4. Copy "anon public" key → paste as SUPABASE_ANON_KEY
 */

const SUPABASE_URL      = 'https://fgkljjgxecjmiiaptiug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0aXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE';

// Initialise client — available globally as `sb`
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
