// auth.js - Master Configuration & Security
const MOG_CONFIG = {
    URL: 'https://quzwygjbqpkuqjhrmsjp.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1end5Z2picXBrdXFqaHJtc2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTM0MDksImV4cCI6MjA4Nzg4OTQwOX0.1EVJRlSelXQOPHLX_Y7YsWxzVUmx8s7keRVpqWdXsPU'
};

const mog_sb = window.supabase.createClient(MOG_CONFIG.URL, MOG_CONFIG.KEY);

const getRankData = (count, handle) => {
    if (handle === 'DIRECTORATE') return { name: 'SUPREME_DIRECTOR', color: '#D4AF37', icon: 'shield-check', level: 5 };
    if (count >= 500) return { name: 'GHOST_OPERATIVE', color: '#A855F7', icon: 'eye-off', level: 4 };
    if (count >= 100) return { name: 'ELITE_OPERATIVE', color: '#3B82F6', icon: 'zap', level: 3 };
    if (count >= 20) return { name: 'FIELD_AGENT', color: '#22C55E', icon: 'target', level: 2 };
    return { name: 'GRID_INITIATE', color: '#71717a', icon: 'user', level: 1 };
};

async function globalSecurityCheck() {
    const handle = localStorage.getItem('mog_handle');
    const path = window.location.pathname;
    if (handle && handle !== 'DIRECTORATE') {
        const { data } = await mog_sb.from('blacklisted_operatives').select('username').eq('username', handle).single();
        if (data) { localStorage.clear(); window.location.href = '404.html'; }
    }
    if (!handle && !path.includes('index.html')) window.location.href = 'index.html';
}
globalSecurityCheck();
