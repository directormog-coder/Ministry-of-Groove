function ministry() {
    return {
        view: 'auth', subView: 'chat', isLockdown: false, username: '', handleInput: '', messages: [], msgInput: '', showBypass: false, dirPass: '',
        async init() {
            const h = localStorage.getItem('mog_handle');
            if(h) { this.username = h; this.view = 'grid'; this.sync(); }
            setInterval(() => this.sync(), 30000);
            lucide.createIcons();
        },
        async sync() {
            if(!window.mog) return;
            const { data: msgs } = await window.mog.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
            this.messages = msgs || [];
            const { data: st } = await window.mog.from('system_status').select('*').eq('id', 'lockdown').single();
            this.isLockdown = st?.is_active;
        },
        async send() {
            if(!this.msgInput.trim()) return;
            await window.mog.from('messages').insert([{content: this.msgInput.toUpperCase(), username: this.username}]);
            this.msgInput = ''; this.sync();
        },
        initializeUser() {
            if(!this.handleInput.trim()) return;
            this.username = this.handleInput.toUpperCase();
            localStorage.setItem('mog_handle', this.username);
            this.view = 'grid';
        },
        executeBypass() {
            if(this.dirPass === '@MOGProtocol2026') {
                sessionStorage.setItem('mog_terminal_auth', 'true');
                window.location.href = 'terminal.html';
            }
        },
        logout() { localStorage.removeItem('mog_handle'); location.reload(); }
    }
}
