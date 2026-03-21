/**
 * M.O.G. AUTH MODULE — js/auth.js
 * ================================
 * Role-based session management for all M.O.G. pages.
 *
 * Usage:
 *   MOGAuth.init()              — call on every protected page
 *   MOGAuth.requireAuth()       — redirects to login if no session
 *   MOGAuth.requireDirector()   — redirects to hub if not Director
 *   MOGAuth.handleLoginRedirect()— call after successful login
 *   MOGAuth.signOut()           — clears session + redirects
 *
 * Director detection (checked in order):
 *   1. profiles.rank === 'DIRECTOR'  (DB — most authoritative)
 *   2. user_metadata.role === 'director'  (Supabase Auth metadata)
 *   3. email === 'director.mog@gmail.com'  (hardcoded admin)
 */

const MOGAuth = {

    session:     null,
    profile:     null,
    initialized: false,

    // ── Wait for window.sb ────────────────────────────────────────
    async waitForClient(maxMs = 6000) {
        const step = 80;
        let elapsed = 0;
        while ((!window.sb || !window.supabaseClient) && elapsed < maxMs) {
            await new Promise(r => setTimeout(r, step));
            elapsed += step;
        }
        const client = window.sb || window.supabaseClient;
        if (!client) {
            throw new Error('[M.O.G. Auth] Supabase client not available after ' + maxMs + 'ms');
        }
        return client;
    },

    // ── Init: load session + profile, set localStorage ───────────
    async init() {
        if (this.initialized) return this.session;

        try {
            const client = await this.waitForClient();
            const { data: { session }, error } = await client.auth.getSession();
            if (error) throw error;

            this.session = session;

            if (session) {
                const { data: profile } = await client
                    .from('profiles')
                    .select('rank, department, username, codename, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                this.profile = profile || null;

                const isDirector =
                    profile?.rank === 'DIRECTOR'                          ||
                    session.user.user_metadata?.role === 'director'       ||
                    session.user.email === 'director.mog@gmail.com';

                localStorage.setItem('userRole',       isDirector ? 'director'  : 'operative');
                localStorage.setItem('clearanceLevel', isDirector ? 'ALPHA'     : 'STANDARD');

                console.log(
                    `%c[M.O.G. Auth] ${isDirector ? '★ DIRECTOR' : '● OPERATIVE'} — ${session.user.email}`,
                    `color:${isDirector ? '#d4af37' : '#00d4aa'};font-family:monospace;font-weight:bold`
                );
            }

        } catch (err) {
            console.error('[M.O.G. Auth] init failed:', err.message);
        } finally {
            this.initialized = true;
        }

        return this.session;
    },

    // ── Redirect after login ──────────────────────────────────────
    async handleLoginRedirect() {
        await this.init();
        const role = localStorage.getItem('userRole');
        // directorate.html lives in /pages/ — operatives go to root index
        window.location.href = role === 'director' ? '/pages/directorate.html' : '/index.html';
    },

    // ── Require any authenticated session ────────────────────────
    async requireAuth() {
        const session = await this.init();
        if (!session) {
            console.warn('[M.O.G. Auth] No session — redirecting to login');
            window.location.href = '/login.html';
            return null;
        }
        return session;
    },

    // ── Require Director clearance ───────────────────────────────
    async requireDirector() {
        const session = await this.requireAuth();
        if (!session) return null;

        const isDir = localStorage.getItem('userRole') === 'director' ||
                      localStorage.getItem('clearanceLevel') === 'ALPHA';

        if (!isDir) {
            console.warn('[M.O.G. Auth] Insufficient clearance — redirecting to hub');
            window.location.href = '/index.html';
            return null;
        }
        return session;
    },

    // ── Sign out ──────────────────────────────────────────────────
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

    // ── Convenience getters ───────────────────────────────────────
    get user()            { return this.session?.user || null; },
    get isDirector()      { return localStorage.getItem('userRole') === 'director' || localStorage.getItem('clearanceLevel') === 'ALPHA'; },
    get isAuthenticated() { return !!this.session; },
};

window.MOGAuth = MOGAuth;
