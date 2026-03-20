// Function to initialize Supabase
const initSupabase = () => {
    // 1. Get keys from the window.CONFIG object (loaded from our API)
    const supabaseUrl = window.CONFIG?.SUPABASE_URL;
    const supabaseKey = window.CONFIG?.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("M.O.G. Error: Supabase keys are missing from config!");
        return null;
    }

    // 2. Use 'supabase' (the global object created by the CDN script in index.html)
    // Note: The CDN uses 'supabase', not 'supabaseJs' or 'Supabase'
    try {
        const client = supabase.createClient(supabaseUrl, supabaseKey);
        console.log("M.O.G. Network: Supabase connection established.");
        return client;
    } catch (error) {
        console.error("M.O.G. Error: Failed to create Supabase client", error);
        return null;
    }
};

// Export the client for use in Auth.js
window.supabaseClient = initSupabase();
