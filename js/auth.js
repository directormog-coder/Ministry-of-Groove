    async init() {
        if (this.initialized) return this.session;
        
        // Wait for ENV to be available
        if (!window.ENV) {
            await this.waitForEnv();
        }
        
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ENV;
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('MOG: Supabase configuration missing');
            return null;
        }
        
        // Initialize the client
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                storageKey: 'mog-auth-token',
                flowType: 'pkce'
            }
        });
        
        // Get session safely
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
            console.error('MOG: Auth error', error);
        }

        this.session = session;
        this.initialized = true; // Mark as initialized even if no session exists

        // Only redirect if we are NOT on the login/index page
        const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
        
        if (!session && !isLoginPage) {
            window.location.href = '/index.html';
        }
        
        return session;
    }

    async getUser() {
        await this.init(); // This will now resolve correctly
        return this.session?.user || null;
    }
