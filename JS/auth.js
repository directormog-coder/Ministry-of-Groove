/**
 * 📀 MINISTRY OF GROOVE | AUTH ENGINE v5.1
 * Secure Gatekeeping & Database Synchronization
 */

// 1. SUPABASE CLIENT INITIALIZATION
// Ensure these variables match your Supabase Dashboard
const SUPABASE_URL = 'https://fgkljjgxecjmiiaptiug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0iugiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        isLoading: false,

        async init() {
            // Check for active session on load
            const { data: { session } } = await sb.auth.getSession();
            if (session) {
                await this.syncRole(session.user);
            }
            if (window.lucide) lucide.createIcons();
        },

        // 2. MANUAL LOGIN: Using Supabase auth.users
        async loginManual() {
            if (!this.authForm.id || !this.authForm.pass) return;
            this.isLoading = true;
            
            try {
                const { data, error } = await sb.auth.signInWithPassword({
                    email: this.authForm.id,
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

        // 3. BIOMETRIC UPLINK: Google OAuth
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

        // 4. ROLE SYNC: Reads your database 'profiles' table
        async syncRole(user) {
            try {
                const { data: profile, error } = await sb
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                const role = profile?.role || 'operative';
                localStorage.setItem('userRole', role);

                // REDIRECT LOGIC
                // If the user is the Director, send to command center
                if (role === 'director' || user.email === 'director.mog@gmail.com') {
                    window.location.href = 'pages/directorate.html';
                } else {
                    window.location.href = 'index.html';
                }
            } catch (err) {
                console.warn("Profile sync weak, defaulting to operative.");
                window.location.href = 'index.html';
            }
        },

        // 5. SYSTEM TERMINATE
        async logout() {
            await sb.auth.signOut();
            localStorage.clear();
            window.location.href = 'login.html';
        }
    }
}
