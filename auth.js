const MOG_CONFIG = {
    URL: 'https://quzwygjbqpkuqjhrmsjp.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1end5Z2picXBrdXFqaHJtc2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTM0MDksImV4cCI6MjA4Nzg4OTQwOX0.1EVJRlSelXQOPHLX_Y7YsWxzVUmx8s7keRVpqWdXsPU'
};

const mog_sb = window.supabase.createClient(MOG_CONFIG.URL, MOG_CONFIG.KEY);

async function globalSecurityCheck() {
    const handle = localStorage.getItem('mog_handle');
    const isTerminalAuth = sessionStorage.getItem('mog_terminal_auth');
    const path = window.location.pathname;

    // 1. Kick out unauthenticated users
    if (!handle && !isTerminalAuth && !path.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Real-time Blacklist Enforcement
    if (handle && handle !== 'DIRECTORATE') {
        const { data } = await mog_sb.from('blacklisted_operatives').select('username').eq('username', handle).single();
        if (data) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '404.html';
        }
    }
}
globalSecurityCheck();
