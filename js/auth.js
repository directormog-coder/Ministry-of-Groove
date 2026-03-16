const CONFIG = {
    URL: 'https://fgkljjgxecjmiiaptiug.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2xqamd4ZWNqbWlpYXB0iugiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjUxNzIsImV4cCI6MjA4ODY0MTE3Mn0.y8rd5v4K5pwToCm2eooJLBksA51AnQXce06uEoE_gyE'
};

const sb = supabase.createClient(CONFIG.URL, CONFIG.KEY);

function nccMasterEngine() {
    return {
        authForm: { id: '', pass: '' },
        async init() {
            const { data: { session } } = await sb.auth.getSession();
            if (session) await this.syncRole(session.user);
            if (window.lucide) lucide.createIcons();
        },
        async loginWithGoogle() {
            await sb.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
        },
        async syncRole(user) {
            const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
            const role = profile?.role || (user.email === 'director.mog@gmail.com' ? 'director' : 'operative');
            localStorage.setItem('userRole', role);
            
            // ABSOLUTE REDIRECT: Prevents 404 Signal Lost
            const dest = (role === 'director') ? '/pages/directorate.html' : '/index.html';
            window.location.assign(window.location.origin + dest);
        },
        async logout() {
            await sb.auth.signOut();
            localStorage.clear();
            window.location.assign(window.location.origin + '/login.html');
        }
    }
}
