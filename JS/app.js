function ministry() {
    return {
        // State
        view: 'auth',
        authMode: 'login', 
        subView: 'chat',
        showBypass: false,
        isLoading: false,
        isUploading: false,
        errorMsg: '',
        
        // Auth fields
        emailInput: '',
        passwordInput: '',
        confirmPassword: '',
        handleInput: '',
        
        // User data
        username: '',
        userEmail: '',
        userStatus: 'online',
        isDirector: false,
        
        // App state
        msgInput: '',
        messages: [],
        galleryItems: [],
        selectedImage: null,
        showSettings: false,
        notifications: true,
        soundEnabled: true,
        darkMode: true,
        currentTime: '00:00:00',
        weatherStatus: 'SYNCING...',
        connectionStatus: 'STANDBY',
        onlineCount: 0,
        unreadCount: 0,
        uploadProgress: 0,
        sessionStart: null,
        sessionDuration: '00:00',
        isOnline: navigator.onLine,
        privateMessageRecipient: null,
        showPrivateModal: false,
        privateMsgInput: '',
        typingUsers: [],
        audioContext: null,
        notificationPermission: false,
        
        // Voice Recording
        showVoiceRecorder: false,
        isRecording: false,
        recordedBlob: null,
        recordingTime: '0:00',
        recordingInterval: null,
        mediaRecorder: null,
        
        // Encryption
        showEncryptionModal: false,
        encryptionPassword: '',
        pendingFile: null,
        
        // Amapiano Top 10
        amapianoChart: [
            { id: 1, title: "Mnike", artist: "Tyler ICU & Tumelo.za", votes: 15420, userVoted: false, previewUrl: null },
            { id: 2, title: "Imithandazo", artist: "Kabza De Small & Mthunzi", votes: 14280, userVoted: false, previewUrl: null },
            { id: 3, title: "Dalie", artist: "Kamo Mphela & Tyler ICU", votes: 12850, userVoted: false, previewUrl: null },
            { id: 4, title: "Tshwala Bam", artist: "Titom & Yuppe ft. EeQue & S.N.E", votes: 11900, userVoted: false, previewUrl: null },
            { id: 5, title: "Wadibusa", artist: "Uncle Waffles ft. Royal MusiQ", votes: 10500, userVoted: false, previewUrl: null },
            { id: 6, title: "Abantu", artist: "DJ Maphorisa & Kabza De Small", votes: 9800, userVoted: false, previewUrl: null },
            { id: 7, title: "Khusela", artist: "Msaki & Kabza De Small", votes: 8900, userVoted: false, previewUrl: null },
            { id: 8, title: "Amazwe", artist: "DJ Maphorisa ft. Tman Xpress", votes: 8200, userVoted: false, previewUrl: null },
            { id: 9, title: "Biri", artist: "Murdah Bongz & Kabza De Small", votes: 7600, userVoted: false, previewUrl: null },
            { id: 10, title: "iPlan", artist: "Dlala Thukzin ft. Zaba & Sykes", votes: 7100, userVoted: false, previewUrl: null }
        ],
        currentPlaying: null,
        nowPlaying: null,
        isPlaying: false,
        playbackProgress: 0,
        audioPlayer: null,
        
        // Supabase Client
        supabase: null,
        
        // Director credentials
        directorHash: null,
        
        init() {
            this.initializeDirectorHash();
            
            document.addEventListener('click', () => this.initAudio(), { once: true });
            
            window.addEventListener('online', () => { 
                this.isOnline = true; 
                this.showNotification('Connection restored', 'success'); 
            });
            window.addEventListener('offline', () => { 
                this.isOnline = false; 
                this.showNotification('Offline mode active', 'warning'); 
            });
            
            this.requestNotificationPermission();
            this.loadPreferences();
            this.loadChartVotes();
            
            // --- UPDATED SUPABASE INITIALIZATION ---
            const SUPABASE_URL = 'https://your-actual-project-id.supabase.co'; 
            const SUPABASE_ANON_KEY = 'your-actual-anon-key';

            if (window.supabase) {
                this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                this.connectionStatus = 'GRID CONNECTED';
            } else {
                this.errorMsg = 'SYSTEM ERROR: DATABASE LIBRARY NOT FOUND';
                this.connectionStatus = 'CONNECTION FAILED';
            }
            
            this.checkSession();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            setTimeout(() => { this.weatherStatus = 'CLEAR • 22°C'; }, 2000);
            
            if (window.lucide) lucide.createIcons();
            
            this.$watch('view', (value) => {
                if (value === 'grid') {
                    this.sessionStart = Date.now();
                    this.updateSessionDuration();
                    setInterval(() => this.updateSessionDuration(), 60000);
                    this.subscribeToMessages();
                    this.subscribeToGallery();
                    this.subscribeToTyping();
                    this.loadMessages();
                    this.loadGallery();
                    this.playSound('login');
                    localStorage.setItem('mog_email', this.userEmail);
                    localStorage.setItem('mog_handle', this.username);
                    localStorage.setItem('mog_is_director', this.isDirector);
                }
            });
        },
        
        async initializeDirectorHash() {
            const encoder = new TextEncoder();
            const data = encoder.encode('director.mog@gmail.com');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            this.directorHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },
        
        async checkIfDirector(email) {
            if (!email) return false;
            const cleanEmail = email.toLowerCase().trim();
            const encoder = new TextEncoder();
            const data = encoder.encode(cleanEmail);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return emailHash === this.directorHash;
        },

        // --- UPDATED GOOGLE LOGIN ---
        async loginWithGoogle() {
            this.isLoading = true;
            try {
                const { error } = await this.supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin
                    }
                });
                if (error) throw error;
            } catch (error) {
                this.errorMsg = error.message;
                this.isLoading = false;
            }
        },
        
        async registerUser() {
            if (!this.emailInput || !this.passwordInput || !this.handleInput) {
                this.errorMsg = 'ALL FIELDS REQUIRED';
                return;
            }
            if (this.passwordInput !== this.confirmPassword) {
                this.errorMsg = 'PASSWORDS DO NOT MATCH';
                return;
            }
            
            this.isLoading = true;
            this.errorMsg = '';
            
            try {
                const isDir = await this.checkIfDirector(this.emailInput);
                
                const { data, error } = await this.supabase.auth.signUp({
                    email: this.emailInput,
                    password: this.passwordInput,
                    options: {
                        data: {
                            handle: this.handleInput.toUpperCase(),
                            is_director: isDir
                        }
                    }
                });
                
                if (error) throw error;
                
                // Add to profiles table
                await this.supabase.from('profiles').insert([{
                    id: data.user.id,
                    email: this.emailInput,
                    handle: this.handleInput.toUpperCase(),
                    is_director: isDir
                }]);

                // Redirect manually to avoid double-loading
                this.userEmail = this.emailInput;
                this.username = this.handleInput.toUpperCase();
                this.isDirector = isDir;
                this.view = 'grid';
                this.playSound('login');
                
            } catch (error) {
                this.errorMsg = error.message || 'REGISTRATION FAILED';
                this.playSound('error');
            } finally {
                this.isLoading = false;
            }
        },
        
        async loginUser() {
            if (!this.emailInput || !this.passwordInput) {
                this.errorMsg = 'EMAIL AND PASSWORD REQUIRED';
                return;
            }
            this.isLoading = true;
            this.errorMsg = '';
            
            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: this.emailInput,
                    password: this.passwordInput
                });
                if (error) throw error;

                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                this.userEmail = data.user.email;
                this.username = profile?.handle || data.user.email.split('@')[0].toUpperCase();
                this.isDirector = profile?.is_director || await this.checkIfDirector(this.userEmail);
                
                if (this.isDirector) {
                    window.location.href = 'directorate.html';
                } else {
                    this.view = 'grid';
                }
                this.playSound('login');
            } catch (error) {
                this.errorMsg = error.message || 'AUTHENTICATION FAILED';
                this.playSound('error');
            } finally {
                this.isLoading = false;
            }
        },

        // REST OF YOUR FUNCTIONS (Audio, Charts, Chat, Gallery, etc.) REMAIN THE SAME
        initAudio() { this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); },
        playSound(type) {
            if (!this.soundEnabled || !this.audioContext) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            const sounds = {
                message: { freq: 800, duration: 0.1, type: 'sine' },
                login: { freq: 400, duration: 0.3, type: 'sine' },
                logout: { freq: 300, duration: 0.3, type: 'sawtooth' },
                error: { freq: 200, duration: 0.4, type: 'sawtooth' }
            };
            const sound = sounds[type] || sounds.message;
            oscillator.frequency.value = sound.freq;
            oscillator.type = sound.type;
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        },

        async checkSession() {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                const { data: profile } = await this.supabase.from('profiles').select('*').eq('id', session.user.id).single();
                this.userEmail = session.user.email;
                this.username = profile?.handle || session.user.email.split('@')[0].toUpperCase();
                this.isDirector = profile?.is_director || await this.checkIfDirector(this.userEmail);
                if (!this.isDirector) this.view = 'grid';
            }
        },

        async logout() {
            await this.supabase.auth.signOut();
            this.view = 'auth';
            this.username = '';
            this.playSound('logout');
        },

        updateClock() {
            this.currentTime = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Johannesburg' }) + ' SAST';
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.chatContainer;
                if (container) container.scrollTop = container.scrollHeight;
            });
        },
        
        // Include your remaining chart/gallery/upload helper functions here...
        loadPreferences() { /* ... */ },
        savePreferences() { /* ... */ },
        loadChartVotes() { /* ... */ },
        loadMessages() { /* ... */ },
        subscribeToMessages() { /* ... */ },
        sendMessage() { /* ... */ },
        loadGallery() { /* ... */ },
        subscribeToGallery() { /* ... */ }
    }
}
