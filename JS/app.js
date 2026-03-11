// Ministry of Groove - Secure Application Logic
const MOG_CONFIG = {
    supabaseUrl: 'YOUR_NEW_SUPABASE_URL', // Replace after creating project
    supabaseKey: 'YOUR_NEW_ANON_KEY'      // Replace after creating project
};

function ministry() {
    return {
        // State
        view: 'auth',
        subView: 'chat',
        showBypass: false,
        username: '',
        handleInput: '',
        errorMsg: '',
        messages: [],
        msgInput: '',
        galleryItems: [],
        isLoading: false,
        
        // Auth
        supabase: null,
        user: null,
        
        async init() {
            this.supabase = window.supabase.createClient(
                MOG_CONFIG.supabaseUrl, 
                MOG_CONFIG.supabaseKey
            );
            
            // Check existing session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.user = session.user;
                this.username = session.user.email === 'director.mog@gmail.com' 
                    ? 'DIRECTORATE' 
                    : (localStorage.getItem('mog_handle') || 'OPERATIVE');
                this.view = 'grid';
                this.setupRealtime();
            }
            
            this.fetchMessages();
            this.fetchGallery();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            setTimeout(() => lucide.createIcons(), 100);
        },
        
        // Secure Authentication
        async signInWithEmail() {
            this.isLoading = true;
            this.errorMsg = '';
            
            const email = this.$refs.emailInput.value;
            const password = this.$refs.passwordInput.value;
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                this.errorMsg = "INVALID DIRECTORATE SIGNAL";
                this.isLoading = false;
                return;
            }
            
            this.user = data.user;
            this.username = 'DIRECTORATE';
            localStorage.setItem('mog_handle', 'DIRECTORATE');
            this.view = 'grid';
            this.isLoading = false;
            this.setupRealtime();
        },
        
        async initializeUser() {
            if (!this.handleInput.trim()) {
                this.errorMsg = "ID REQUIRED";
                return;
            }
            
            // Anonymous sign in for operatives
            const { data, error } = await this.supabase.auth.signInAnonymously();
            
            if (error) {
                this.errorMsg = "GRID CONNECTION FAILED";
                return;
            }
            
            this.user = data.user;
            this.username = this.handleInput.trim().toUpperCase();
            localStorage.setItem('mog_handle', this.username);
            this.view = 'grid';
            this.setupRealtime();
        },
        
        async logout() {
            await this.supabase.auth.signOut();
            localStorage.removeItem('mog_handle');
            window.location.reload();
        },
        
        // Realtime subscriptions
        setupRealtime() {
            this.supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
                    payload => {
                        this.messages.push(payload.new);
                        this.scrollToBottom();
                    }
                )
                .subscribe();
        },
        
        // Data fetching
        async fetchMessages() {
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);
                
            if (error) {
                console.error('Fetch error:', error);
                return;
            }
            this.messages = data || [];
            this.scrollToBottom();
        },
        
        async fetchGallery() {
            const { data, error } = await this.supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('Gallery error:', error);
                return;
            }
            this.galleryItems = data || [];
        },
        
        // Actions
        async send() {
            if (!this.msgInput.trim() || !this.user) return;
            
            const { error } = await this.supabase
                .from('messages')
                .insert([{ 
                    content: this.msgInput.toUpperCase(), 
                    username: this.username,
                    user_id: this.user.id
                }]);
                
            if (error) {
                console.error('Send error:', error);
                return;
            }
            
            this.msgInput = '';
        },
        
        async uploadImage(e) {
            const file = e.target.files[0];
            if (!file || !this.user) return;
            
            this.isLoading = true;
            const fileName = `${Date.now()}-${this.username}-${file.name}`;
            
            // Upload to storage
            const { data: uploadData, error: uploadError } = await this.supabase
                .storage
                .from('gallery')
                .upload(fileName, file);
                
            if (uploadError) {
                console.error('Upload error:', uploadError);
                this.isLoading = false;
                return;
            }
            
            // Get public URL
            const { data: { publicUrl } } = this.supabase
                .storage
                .from('gallery')
                .getPublicUrl(fileName);
            
            // Save to database
            const { error: dbError } = await this.supabase
                .from('gallery')
                .insert([{ 
                    url: publicUrl, 
                    owner: this.username,
                    user_id: this.user.id
                }]);
                
            if (dbError) {
                console.error('DB error:', dbError);
                this.isLoading = false;
                return;
            }
            
            this.galleryItems.unshift({ url: publicUrl, owner: this.username });
            this.isLoading = false;
        },
        
        // Utilities
        scrollToBottom() {
            setTimeout(() => {
                const el = document.getElementById('chat-stream');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
        },
        
        updateClock() {
            const now = new Date();
            const clockEl = document.getElementById('sast-clock');
            if (clockEl) {
                clockEl.innerText = now.toLocaleTimeString('en-GB', { 
                    timeZone: 'Africa/Johannesburg' 
                });
            }
            
            // Weather update every 5 minutes
            if (now.getMinutes() % 5 === 0 && now.getSeconds() === 0) {
                this.fetchWeather();
            }
        },
        
        async fetchWeather() {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-25.8728&longitude=29.2315&current_weather=true');
                const data = await res.json();
                const weatherEl = document.getElementById('weather-display');
                if (weatherEl) {
                    weatherEl.innerText = `${Math.round(data.current_weather.temperature)}°C • EMALAHLENI`;
                }
            } catch (e) {
                console.error('Weather fetch failed');
            }
        }
    };
}

// Admin Terminal Logic
function terminal() {
    return {
        authenticated: false,
        loginEmail: '',
        loginPass: '',
        isLive: false,
        isLockdown: false,
        supabase: null,
        
        async init() {
            this.supabase = window.supabase.createClient(
                MOG_CONFIG.supabaseUrl, 
                MOG_CONFIG.supabaseKey
            );
            
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session?.user?.email === 'director.mog@gmail.com') {
                this.authenticated = true;
                this.fetchStatus();
            }
            
            setTimeout(() => lucide.createIcons(), 100);
        },
        
        async verifyAccess() {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: this.loginEmail,
                password: this.loginPass
            });
            
            if (error || data.user.email !== 'director.mog@gmail.com') {
                alert('UNAUTHORIZED ACCESS ATTEMPT');
                return;
            }
            
            this.authenticated = true;
            this.fetchStatus();
        },
        
        async fetchStatus() {
            const { data } = await this.supabase
                .from('system_status')
                .select('*')
                .eq('id', 1)
                .single();
                
            if (data) {
                this.isLive = data.is_live;
                this.isLockdown = data.is_lockdown;
            }
        },
        
        async toggle(feature) {
            const updates = feature === 'livestream' 
                ? { is_live: !this.isLive }
                : { is_lockdown: !this.isLockdown };
                
            const { error } = await this.supabase
                .from('system_status')
                .update(updates)
                .eq('id', 1);
                
            if (error) {
                alert('SYSTEM ERROR');
                return;
            }
            
            if (feature === 'livestream') this.isLive = !this.isLive;
            if (feature === 'lockdown') this.isLockdown = !this.isLockdown;
        },
        
        async logout() {
            await this.supabase.auth.signOut();
            window.location.href = 'index.html';
        }
    };
}
