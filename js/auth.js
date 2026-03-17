/**
 * Ministry of Groove - Authentication Module
 * Shared authentication logic for all pages
 */

class MOGAuth {
    constructor() {
        this.supabase = null;
        this.session = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        // Wait for ENV to be available
        if (!window.ENV) {
            await this.waitForEnv();
        }
        
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ENV;
        
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                storageKey: 'mog-auth-token'
            }
        });
        
        // Check session
        const { data: { session } } = await this.supabase.auth.getSession();
        this.session = session;
        
        if (!session) {
            // Redirect to login
            window.location.href = '/index.html';
            return;
        }
        
        this.initialized = true;
        return session;
    }

    waitForEnv() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.ENV) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    async getUser() {
        if (!this.initialized) await this.init();
        return this.session?.user;
    }

    async logout() {
        if (this.supabase) {
            await this.supabase.auth.signOut();
        }
        window.location.href = '/index.html';
    }

    async requireAuth() {
        const session = await this.init();
        if (!session) {
            throw new Error('Authentication required');
        }
        return session;
    }
}

// Export for use in other scripts
window.MOGAuth = MOGAuth;
