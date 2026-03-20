/**
 * Ministry of Groove - Supabase Client Configuration
 * NCC Master v5.2.3
 */

(function() {
    // 1. Define credentials (Hardcoded as fallback, but prefers window.ENV)
    const SB_URL = "https://fgkljjgxecjmiiaptiug.supabase.co";
    const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0aXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE";

    /**
     * Initialize the Supabase Client
     */
    const initSupabase = () => {
        // Use window.ENV if available (from env-config.js), otherwise use hardcoded
        const url = (window.ENV && window.ENV.SUPABASE_URL) ? window.ENV.SUPABASE_URL : SB_URL;
        const key = (window.ENV && window.ENV.SUPABASE_ANON_KEY) ? window.ENV.SUPABASE_ANON_KEY : SB_KEY;

        if (!url || !key) {
            console.error("MOG Error: Supabase credentials could not be resolved.");
            return null;
        }

        try {
            return supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce'
                }
            });
        } catch (error) {
            console.error("MOG Error: Failed to initialize Supabase client:", error);
            return null;
        }
    };

    // Attach to window so Auth.js and Dashboard.js can access it globally
    window.supabaseClient = initSupabase();

    console.log("MOG: Supabase Client Initialized.");
})();
