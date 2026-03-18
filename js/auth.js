async init() {
    if (this.initialized) return this.session;
    
    if (!window.ENV) await this.waitForEnv();
    
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ENV;
    
    this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, storageKey: 'mog-auth-token', flowType: 'pkce' }
    });
    
    const { data: { session } } = await this.supabase.auth.getSession();
    this.session = session;
    this.initialized = true; // Mark as done before redirecting

    // Smart Redirect: Only redirect if we are NOT on the login page
    const isLogin = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    if (!session && !isLogin) {
        window.location.href = '/index.html';
        return null;
    }
    
    return session;
}
