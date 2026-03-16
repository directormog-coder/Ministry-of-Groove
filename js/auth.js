/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.2.2
 * Production Build: Absolute Path Synchronization
 */

const CONFIG = {
    SUPABASE_URL: 'https://fgkljjgxecjmiiaptiug.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0iugiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE',
    APP_VERSION: '5.2.2'
};

// Initialize Supabase Client
const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        isLoading: false,

        async init() {
            console.log(`[MOG AUTH] Handshake v${CONFIG.APP_VERSION}`);
            const { data: { session } } = await sb.auth.getSession();
            if (session) {
                await this.syncRole(session.user);
            }
            if (window.lucide) lucide.createIcons();
        },

        // EMAIL/PASSWORD AUTHENTICATION
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

        // GOOGLE OAUTH (BIOMETRIC UPLINK)
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

        // ROLE SYNCHRONIZATION
        async syncRole(user) {
            try {
                // Fetch user profile from database
                const { data: profile } = await sb
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                // Logic: Database check > Hardcoded fallback for Master Director account
                const role = profile?.role || (user.email === 'director.mog@gmail.com' ? 'director' : 'operative');
                
                localStorage.setItem('userRole', role);
                
                // Audit the access in the logs
                await this.logAccess(user.id, role, 'login');

                // Execute absolute redirect logic
                this.redirectByRole(role);

            } catch (err) {
                console.warn("[MOG AUTH] Handshake weak, defaulting to hub.");
                window.location.href = window.location.origin + '/index.html';
            }
        },

        // REDIRECT LOGIC: FIXES 404 SIGNAL LOST ON VERCEL
        redirectByRole(role) {
            const destination = (role === 'director') 
                ? '/pages/directorate.html' 
                : '/index.html';

            console.log(`[MOG AUTH] Sector Authorized: ${role}. Routing to ${destination}`);
            
            // Forces absolute pathing to prevent subfolder 404s
            window.location.assign(window.location.origin + destination);
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
