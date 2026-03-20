/**
 * M.O.G. AUTH MODULE — js/auth.js
 * =================================
 * Handles session checking and role-based redirects.
 *
 * IMPORTANT: This file does NOT create a Supabase client.
 * It relies on window.sb being set by /js/supabase-client.js
 * which must load BEFORE this file in every HTML page.
 *
 * Correct script load order in every HTML page:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="/js/supabase-client.js"></script>
 *   3. <script src="/js/auth.js"></script>  ← optional, only where needed
 *   4. Alpine / page scripts (defer)
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

                // Persist role to localStorage so other pages can read it
                const isDirector =
                    profile?.rank === 'DIRECTOR' ||
                    session.user.email === 'director.mog@gmail.com';

                localStorage.setItem('userRole',       isDirector ? 'director' : 'operative');
                localStorage.setItem('clearanceLevel', isDirector ? 'ALPHA'    : 'STANDARD');
            }

            this.initialized = true;
            return session;

        } catch (err) {
            console.error('[M.O.G. Auth] init failed:', err.message);
            this.initialized = true;
            return null;
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

    /* ── Get current user ────────────────────────────────────── */
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

