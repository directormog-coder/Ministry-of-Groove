/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.2.3
 * Production Build: Optimized for Vercel Clean URLs
 */

const CONFIG = {
    URL: 'https://fgkljjgxecjmiiaptiug.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0iugiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE',
    VERSION: '5.2.3'
};

// Initialize Supabase Client
const sb = supabase.createClient(CONFIG.URL, CONFIG.KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        isLoading: false,

        async init() {
            console.log(`[MOG AUTH] Handshake v${CONFIG.VERSION}`);
            const { data: { session } } = await sb.auth.getSession();
            if (session) {
                await this.syncRole(session.user);
            }
            if (window.lucide) lucide.createIcons();
        },

        // BIOMETRIC UPLINK (GOOGLE OAUTH)
        async loginWithGoogle() {
            console.log("📡 INITIATING BIOMETRIC UPLINK...");
            const { error } = await sb.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) alert("UPLINK ERROR: " + error.message);
        },

        // MANUAL PASSCODE LOGIN
        async loginManual() {
            if (!this.authForm.id || !this.authForm.pass) return;
            this.isLoading = true;
            try {
                const { data, error } = await sb.auth.signInWithPassword({
                    email: this.authForm.id.trim().toLowerCase(),
                    password: this.authForm.pass
                });
                if (error) throw error;
                await this.syncRole(data.user);
            } catch (err) {
                alert("ACCESS DENIED: " + err.message);
            } finally {
                this.isLoading = false;
            }
        },

        // ROLE & REDIRECT SYNCHRONIZATION
        async syncRole(user) {
            try {
                const { data: profile } = await sb
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                // Check database role, fallback to email check for Director
                const role = profile?.role || (user.email === 'director.mog@gmail.com' ? 'director' : 'operative');
                localStorage.setItem('userRole', role);

                // Audit the entry
                await this.logAccess(user.id, role, 'login');

                // ABSOLUTE REDIRECT LOGIC
                // Uses the Clean URL alias defined in vercel.json
                const path = (role === 'director') ? '/directorate' : '/index.html';
                
                console.log(`[MOG AUTH] Routing to sector: ${path}`);
                window.location.assign(window.location.origin + path);

            } catch (err) {
                console.warn("[MOG AUTH] Handshake weak, defaulting to grid.");
                window.location.assign(window.location.origin + '/index.html');
            }
        },

        // AUDIT LOGGING
        async logAccess(userId, role, action) {
            try {
                await sb.from('access_logs').insert({
                    user_id: userId,
                    role: role,
                    action: action,
                    user_agent: navigator.userAgent
                });
            } catch (e) {
                console.warn('[MOG AUTH] Audit log skipped');
            }
        },

        // SECURE LOGOUT
        async logout() {
            await sb.auth.signOut();
            localStorage.clear();
            window.location.assign(window.location.origin + '/login.html');
        }
    }
}
