// Securely fetch config from Vercel serverless function
let supabase = null;
let appConfig = null;

async function initializeSupabase() {
  try {
    // Fetch config from secure endpoint
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Failed to load config');
    
    appConfig = await response.json();
    
    // Initialize Supabase with server-provided credentials
    supabase = window.supabase.createClient(appConfig.url, appConfig.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    return supabase;
  } catch (error) {
    console.error('Failed to initialize:', error);
    throw error;
  }
}

// Contact info getter (no hardcoded secrets)
function getContacts() {
  return appConfig?.contacts || {};
}

// Export for use in other scripts
window.mogSupabase = {
  init: initializeSupabase,
  get client() { return supabase; },
  get contacts() { return getContacts(); }
};
