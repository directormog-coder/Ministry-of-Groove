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
Alpine.data('dossierLogic', () => ({
    rankings: [],
    myStats: { xp: 0, rankName: '' },

    async init() {
        // Fetch Top 20 Operatives by Signal Strength (XP)
        const { data, error } = await supabase
            .from('operatives')
            .select('username, xp, role')
            .order('xp', { ascending: false })
            .limit(20);

        if (data) {
            this.rankings = data.map(op => ({
                ...op,
                xp_percent: Math.min((op.xp / 1000) * 100, 100) // Scale against 1000xp cap
            }));
            
            // Set local user stats (Mock logic - replace with actual user ID)
            const me = data.find(o => o.username === 'DIRECTOR_G');
            if (me) {
                this.myStats.xp = me.xp;
                this.myStats.rankName = this.calculateRank(me.xp);
            }
        }
    },

    calculateRank(xp) {
        if (xp > 800) return 'ELITE FREQUENCY';
        if (xp > 500) return 'VIBRATION LEAD';
        if (xp > 200) return 'GRID OPERATIVE';
        return 'NEW SIGNAL';
    }
}));
Alpine.data('vaultLogic', () => ({
    search: '',
    logs: [],

    async init() {
        // Fetch official dispatches from Supabase
        const { data, error } = await supabase
            .from('archives')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            this.logs = data.map(log => ({
                id: log.id,
                timestamp: new Date(log.created_at).toLocaleDateString('en-ZA'),
                title: log.title,
                content: log.content,
                tags: log.tags || ['LOG']
            }));
        }
    },

    get filteredLogs() {
        if (this.search === '') return this.logs;
        return this.logs.filter(log => 
            log.title.toLowerCase().includes(this.search.toLowerCase()) ||
            log.content.toLowerCase().includes(this.search.toLowerCase())
        );
    }
}));
