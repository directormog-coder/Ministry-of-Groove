function ministry() {
    return {
        // State
        view: 'auth',
        authMode: 'login', // 'login' or 'register'
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
        
        // Director credentials (hashed for security)
        directorHash: null,
        
        init() {
            // Initialize director hash (SHA-256 of director.mog@gmail.com)
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
            
            // Initialize Supabase
            const SUPABASE_URL = 'https://your-project.supabase.co';
            const SUPABASE_ANON_KEY = 'your-anon-key';
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            this.checkSession();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            setTimeout(() => { this.weatherStatus = 'CLEAR • 22°C'; }, 2000);
            
            lucide.createIcons();
            
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
            // Create hash of director email for comparison
            const encoder = new TextEncoder();
            const data = encoder.encode('director.mog@gmail.com');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            this.directorHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },
        
        async checkIfDirector(email) {
            const encoder = new TextEncoder();
            const data = encoder.encode(email.toLowerCase().trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return emailHash === this.directorHash;
        },
        
        initAudio() {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        },
        
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
                upload: { freq: 600, duration: 0.2, type: 'sine' },
                error: { freq: 200, duration: 0.4, type: 'sawtooth' },
                notification: { freq: 1000, duration: 0.05, type: 'sine' },
                recordStart: { freq: 600, duration: 0.3, type: 'sine' },
                recordStop: { freq: 400, duration: 0.3, type: 'sine' }
            };
            
            const sound = sounds[type] || sounds.message;
            oscillator.frequency.value = sound.freq;
            oscillator.type = sound.type;
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        },
        
        async requestNotificationPermission() {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                this.notificationPermission = permission === 'granted';
            }
        },
        
        showNotification(title, body, icon = null) {
            // Use CSS logo as notification icon
            const notificationIcon = icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23D4AF37"/><text x="50" y="60" text-anchor="middle" font-family="Arial Black" font-size="30" fill="black" font-style="italic">MOG</text></svg>';
            
            if (this.notifications && this.notificationPermission && document.hidden) {
                new Notification(title, { body, icon: notificationIcon, badge: notificationIcon, tag: 'ministry-groove' });
            }
        },
        
        loadPreferences() {
            const prefs = JSON.parse(localStorage.getItem('mog_prefs') || '{}');
            this.soundEnabled = prefs.sound !== false;
            this.notifications = prefs.notifications !== false;
            this.darkMode = prefs.darkMode !== false;
            if (!this.darkMode) document.body.classList.add('light-mode');
        },
        
        savePreferences() {
            localStorage.setItem('mog_prefs', JSON.stringify({
                sound: this.soundEnabled,
                notifications: this.notifications,
                darkMode: this.darkMode
            }));
        },
        
        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            this.savePreferences();
            if (this.soundEnabled) this.playSound('notification');
        },
        
        toggleTheme() {
            this.darkMode = !this.darkMode;
            document.body.classList.toggle('light-mode', !this.darkMode);
            this.savePreferences();
        },
        
        // Amapiano Chart Functions
        get totalVotes() {
            return this.amapianoChart.reduce((acc, song) => acc + song.votes, 0);
        },
        
        loadChartVotes() {
            const savedVotes = JSON.parse(localStorage.getItem('mog_chart_votes') || '[]');
            savedVotes.forEach(saved => {
                const song = this.amapianoChart.find(s => s.id === saved.id);
                if (song) {
                    song.votes = saved.votes;
                }
            });
            // Sort by votes
            this.amapianoChart.sort((a, b) => b.votes - a.votes);
        },
        
        playPreview(song) {
            // Simulate playing (since we don't have actual audio files yet)
            if (this.currentPlaying === song.id) {
                this.stopPreview();
                return;
            }
            
            this.currentPlaying = song.id;
            this.nowPlaying = song;
            this.isPlaying = true;
            
            // Simulate progress
            this.playbackProgress = 0;
            const progressInterval = setInterval(() => {
                if (!this.isPlaying || this.currentPlaying !== song.id) {
                    clearInterval(progressInterval);
                    return;
                }
                this.playbackProgress += 0.5;
                if (this.playbackProgress >= 100) {
                    this.playbackProgress = 0;
                    this.skipTrack(1);
                }
            }, 100);
            
            this.playSound('notification');
        },
        
        stopPreview() {
            this.currentPlaying = null;
            this.isPlaying = false;
            this.playbackProgress = 0;
        },
        
        togglePlay() {
            if (this.nowPlaying) {
                this.isPlaying = !this.isPlaying;
            }
        },
        
        skipTrack(direction) {
            if (!this.nowPlaying) return;
            const currentIndex = this.amapianoChart.findIndex(s => s.id === this.nowPlaying.id);
            const newIndex = (currentIndex + direction + this.amapianoChart.length) % this.amapianoChart.length;
            this.playPreview(this.amapianoChart[newIndex]);
        },
        
        voteForSong(songId) {
            const song = this.amapianoChart.find(s => s.id === songId);
            if (!song) return;
            
            if (song.userVoted) {
                song.votes--;
                song.userVoted = false;
                this.showNotification('Vote removed', `${song.title} vote cancelled`);
            } else {
                song.votes++;
                song.userVoted = true;
                this.playSound('notification');
                this.showNotification('Vote recorded', `You voted for ${song.title}`);
                
                // Sort chart by votes
                this.amapianoChart.sort((a, b) => b.votes - a.votes);
            }
            
            // Save to localStorage
            localStorage.setItem('mog_chart_votes', JSON.stringify(
                this.amapianoChart.map(s => ({ id: s.id, votes: s.votes }))
            ));
        },
        
        // Authentication Functions
        async registerUser() {
            if (!this.emailInput || !this.passwordInput || !this.handleInput) {
                this.errorMsg = 'ALL FIELDS REQUIRED';
                return;
            }
            
            if (this.passwordInput !== this.confirmPassword) {
                this.errorMsg = 'PASSWORDS DO NOT MATCH';
                return;
            }
            
            if (this.passwordInput.length < 6) {
                this.errorMsg = 'PASSWORD MUST BE 6+ CHARACTERS';
                return;
            }
            
            if (
