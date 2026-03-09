// Initialize Supabase Client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('alpine:init', () => {
    Alpine.data('gridLogic', () => ({
        authenticated: false,
        isDirector: false,
        operative: null,

        async init() {
            // 1. Check current session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.authenticated = true;
                this.checkStatus(session.user);
            }
        },

        async login() {
            // Simplified Magic Link or Provider login
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) console.error("Grid Access Denied:", error.message);
        },

        async checkStatus(user) {
            // 2. Fetch Operative Profile
            const { data, error } = await supabase
                .from('operatives')
                .select('role, status')
                .eq('id', user.id)
                .single();

            if (data) {
                // Redirect if Sanctioned (Banned)
                if (data.status === 'sanctioned') {
                    window.location.href = '404.html';
                }
                
                // Set Directorate Privileges
                this.isDirector = (data.role === 'director');
                this.operative = user;
            }
        },

        async logout() {
            await supabase.auth.signOut();
            window.location.reload();
        }
    }));

    // Directorate Specific Logic
    Alpine.data('directorate', () => ({
        async issueSanction(operativeId) {
            const { error } = await supabase
                .from('operatives')
                .update({ status: 'sanctioned' })
                .eq('id', operativeId);

            if (!error) {
                alert(`OPERATIVE ${operativeId} SIGNAL TERMINATED.`);
            }
        }
    }));
});
