/**
 * MOG Environment Configuration
 * Handles switching between Local and Vercel environments
 */

(function() {
    // 1. Check if we are on Localhost
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 2. Define your keys
    // REPLACE THESE with your actual Supabase keys for local testing
    const LOCAL_CONFIG = {
        SUPABASE_URL: "https://your-project-id.supabase.co",
        SUPABASE_ANON_KEY: "your-anon-key-here"
    };

    // 3. Attach to window.ENV (which your Auth.js is waiting for)
    window.ENV = isLocal ? LOCAL_CONFIG : {
        // When deployed to Vercel, these must be injected into the HTML or 
        // provided by Vercel's Edge config. 
        SUPABASE_URL: "process.env.SUPABASE_URL", 
        SUPABASE_ANON_KEY: "process.env.SUPABASE_ANON_KEY"
    };

    console.log(`MOG: Environment initialized (${isLocal ? 'Local' : 'Production'})`);
})();

