/**
 * M.O.G. AUTH MODULE — js/auth.js
 * =================================
 * Handles session checking and role-based redirects.
 * UPGRADED: Added handleLoginRedirect and metadata-to-profile sync.
 */

const MOGAuth = {

    session:     null,
    profile:     null,
    initialized: false,

    /* ── Wait for window.sb (set async by supabase-client.js) ── */
    async waitForClient(maxMs = 5000) {
        const step = 100;
        let elapsed = 0;
        while ((typeof sb === 'undefined' || !sb) && elapsed < maxMs) {
            await new Promise(r => setTimeout(r, step));
            elapsed += step;
        }
        if (typeof sb === 'undefined' || !sb) {
            throw new Error('[M.O.G. Auth] sb not available — check /js/supabase-client.js');
        }
        return sb;
    },

    /* ── Initialize: get session, load profile ─────────────── */
    async init() {
        if (this.initialized) return this.session;

        try {
            const client = await this.waitForClient();

            const { data: { session }, error } = await client.auth.getSession();
            if (error) throw error;

            this.session = session;

            if (session) {
                // Load profile for rank / role info
                const { data: profile } = await client
                    .from('profiles')
                    .select('rank, department, username, codename, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                this.profile = profile || null;

                /** * UPGRADE: Enhanced Role Detection
                 * Checks: 1. DB Rank, 2. Auth Metadata, 3. Hardcoded Admin Email
                 */
                const isDirector =
                    profile?.rank === 'DIRECTOR' || 
                    session.user.user_metadata?.role === 'director' ||
                    session.user.email === 'director.mog@gmail.com';

                localStorage.setItem('userRole',       isDirector ? 'director' : 'operative');
                localStorage.setItem('clearanceLevel', isDirector ? 'ALPHA'    : 'STANDARD');
                
                console.log(`[M.O.G. Auth] Profile Loaded: ${isDirector ? 'DIRECTOR' : 'OPERATIVE'} Access.`);
            }

            this.initialized = true;
            return session;

        } catch (err) {
            console.error('[M.O.G. Auth] init failed:', err.message);
            this.initialized = true;
            return null;
        }
    },

    /**
     * UPGRADE: handleLoginRedirect
     * Call this specifically in your login.html script after 
     * a successful supabase.auth.signInWithPassword call.
     */
    async handleLoginRedirect() {
        // Ensure init has run to set localStorage
        await this.init();
        
        const role = localStorage.getItem('userRole');
        
        if (role === 'director') {
            console.log("[M.O.G. Auth] Routing to Directorate...");
            window.location.href = '/directorate.html';
        } else {
            console.log("[M.O.G. Auth] Routing to Operative Hub...");
            window.location.href = '/index.html';
        }
    },

    /* ── Require auth — redirect to login if no session ─────── */
    async requireAuth() {
        const session = await this.init();

        if (!session) {
            console.warn('[M.O.G. Auth] No session — redirecting to login');
            window.location.href = '/login.html';
            return null;
        }

        return session;
    },

    /* ── Require Director — redirect to hub if not Director ─── */
    async requireDirector() {
        const session = await this.requireAuth();
        if (!session) return null;

        const role      = localStorage.getItem('userRole');
        const clearance = localStorage.getItem('clearanceLevel');
        const isDir     = role === 'director' || clearance === 'ALPHA';

        if (!isDir) {
            console.warn('[M.O.G. Auth] Insufficient clearance — redirecting to hub');
            window.location.href = '/index.html';
            return null;
        }

        return session;
    },

    /* ── Sign out ────────────────────────────────────────────── */
    async signOut() {
        try {
            const client = await this.waitForClient();
            await client.auth.signOut();
        } catch (err) {
            console.warn('[M.O.G. Auth] Sign out error:', err.message);
        } finally {
            localStorage.removeItem('userRole');
            localStorage.removeItem('clearanceLevel');
            window.location.href = '/login.html';
        }
    },

    /* ── Getters ────────────────────────────────────────────── */
    get user() {
        return this.session?.user || null;
    },

    get isDirector() {
        return localStorage.getItem('userRole') === 'director' ||
               localStorage.getItem('clearanceLevel') === 'ALPHA';
    },

    get isAuthenticated() {
        return !!this.session;
    }
};

/* Export for pages that use it directly */
window.MOGAuth = MOGAuth;
