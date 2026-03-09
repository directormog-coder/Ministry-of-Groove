function ministry() {
    return {
        // State
        view: 'auth',
        subView: 'chat',
        showBypass: false,
        isLoading: false,
        isUploading: false,
        errorMsg: '',
        handleInput: '',
        username: '',
        userStatus: 'online',
        msgInput: '',
        messages: [],
        galleryItems: [],
        selectedImage: null,
        showSettings: false,
        showTOS: false,
        showPrivacy: false,
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
        
        // Supabase Client
        supabase: null,
        
        init() {
            // Initialize audio context on first user interaction
            document.addEventListener('click', () => this.initAudio(), { once: true });
            
            // Check online status
            window.addEventListener('online', () => { this.isOnline = true; this.showNotification('Connection restored', 'success'); });
            window.addEventListener('offline', () => { this.isOnline = false; this.showNotification('Offline mode active', 'warning'); });
            
            // Request notification permission
            this.requestNotificationPermission();
            
            // Load saved preferences
            this.loadPreferences();
            
            // Initialize Supabase
            const SUPABASE_URL = 'https://your-project.supabase.co';
            const SUPABASE_ANON_KEY = 'your-anon-key';
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            this.checkSession();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            setTimeout(() => {
                this.weatherStatus = 'CLEAR • 22°C';
            }, 2000);
            
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
                }
            });
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
                notification: { freq: 1000, duration: 0.05, type: 'sine' }
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
        
        showNotification(title, body, icon = 'https://via.placeholder.com/100') {
            if (this.notifications && this.notificationPermission && document.hidden) {
                new Notification(title, {
                    body,
                    icon,
                    badge: icon,
                    tag: 'ministry-groove'
                });
            }
        },
        
        loadPreferences() {
            const prefs = JSON.parse(localStorage.getItem('mog_prefs') || '{}');
            this.soundEnabled = prefs.sound !== false;
            this.notifications = prefs.notifications !== false;
            this.darkMode = prefs.darkMode !== false;
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
            this.savePreferences();
            document.body.classList.toggle('light-mode', !this.darkMode);
        },
        
        async checkSession() {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.username = session.user.email || 'DIRECTORATE';
                this.view = 'grid';
            }
        },
        
        updateClock() {
            const now = new Date();
            this.currentTime = now.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                timeZone: 'Africa/Johannesburg'
            }) + ' SAST';
        },
        
        updateSessionDuration() {
            if (!this.sessionStart) return;
            const diff = Math.floor((Date.now() - this.sessionStart) / 60000);
            const hours = Math.floor(diff / 60).toString().padStart(2, '0');
            const mins = (diff % 60).toString().padStart(2, '0');
            this.sessionDuration = `${hours}:${mins}`;
        },
        
        async initializeUser() {
            if (!this.handleInput.trim()) return;
            this.isLoading = true;
            this.errorMsg = '';
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (this.handleInput.length < 3) throw new Error('HANDLE MUST BE 3+ CHARACTERS');
                
                this.username = this.handleInput.toUpperCase();
                this.view = 'grid';
                this.connectionStatus = 'CONNECTED';
                this.playSound('login');
                
            } catch (error) {
                this.errorMsg = error.message || 'AUTHENTICATION FAILED';
                this.playSound('error');
            } finally {
                this.isLoading = false;
            }
        },
        
        async signInWithEmail() {
            const email = this.$refs.emailInput.value;
            const password = this.$refs.passwordInput.value;
            
            if (!email || !password) {
                this.errorMsg = 'CREDENTIALS REQUIRED';
                return;
            }
            
            this.isLoading = true;
            this.errorMsg = '';
            
            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                
                this.username = 'DIRECTORATE';
                this.view = 'grid';
                this.connectionStatus = 'DIRECTORATE ACCESS GRANTED';
                this.playSound('login');
                
            } catch (error) {
                this.errorMsg = error.message || 'AUTHORIZATION FAILED';
                this.playSound('error');
            } finally {
                this.isLoading = false;
            }
        },
        
        async logout() {
            this.playSound('logout');
            await this.supabase.auth.signOut();
            this.view = 'auth';
            this.username = '';
            this.messages = [];
            this.galleryItems = [];
            this.showBypass = false;
            this.connectionStatus = 'STANDBY';
        },
        
        // Enhanced Chat Functions
        async loadMessages() {
            try {
                const { data, error } = await this.supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .limit(100);
                    
                if (error) throw error;
                this.messages = data || [];
                this.scrollToBottom();
            } catch (error) {
                // Offline fallback - load from localStorage
                const offlineMsgs = JSON.parse(localStorage.getItem('mog_offline_msgs') || '[]');
                this.messages = offlineMsgs.length > 0 ? offlineMsgs : [
                    { id: 1, username: 'SYSTEM', content: 'Grid connection established. Welcome, Operative.', created_at: new Date().toISOString() }
                ];
            }
        },
        
        subscribeToMessages() {
            this.supabase
                .channel('messages')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
                    if (payload.eventType === 'INSERT') {
                        this.messages.push(payload.new);
                        if (payload.new.username !== this.username) {
                            this.unreadCount++;
                            this.playSound('message');
                            this.showNotification('New Message', `${payload.new.username}: ${payload.new.content.substring(0, 50)}...`);
                        }
                        this.scrollToBottom();
                    }
                })
                .subscribe();
        },
        
        subscribeToTyping() {
            this.supabase
                .channel('typing')
                .on('broadcast', { event: 'typing' }, (payload) => {
                    if (payload.payload.user !== this.username) {
                        this.typingUsers = [...new Set([...this.typingUsers, payload.payload.user])];
                        setTimeout(() => {
                            this.typingUsers = this.typingUsers.filter(u => u !== payload.payload.user);
                        }, 3000);
                    }
                })
                .subscribe();
        },
        
        async sendMessage() {
            if (!this.msgInput.trim()) return;
            
            const message = {
                username: this.username,
                content: this.msgInput.trim(),
                created_at: new Date().toISOString(),
                recipient: this.privateMessageRecipient
            };
            
            // Optimistic update
            this.messages.push({ ...message, id: Date.now() });
            
            // Save to localStorage for offline support
            const offlineMsgs = JSON.parse(localStorage.getItem('mog_offline_msgs') || '[]');
            offlineMsgs.push(message);
            localStorage.setItem('mog_offline_msgs', JSON.stringify(offlineMsgs.slice(-100)));
            
            this.msgInput = '';
            this.scrollToBottom();
            this.playSound('message');
            
            // Broadcast typing stop
            this.supabase.channel('typing').send({
                type: 'broadcast',
                event: 'typing',
                payload: { user: this.username, typing: false }
            });
            
            try {
                if (this.isOnline) {
                    const { error } = await this.supabase.from('messages').insert([message]);
                    if (error) throw error;
                }
            } catch (error) {
                console.error('Failed to send message:', error);
                this.showNotification('Message saved offline', 'warning');
            }
        },
        
        onTyping() {
            this.supabase.channel('typing').send({
                type: 'broadcast',
                event: 'typing',
                payload: { user: this.username, typing: true }
            });
        },
        
        openPrivateMessage(user) {
            this.privateMessageRecipient = user;
            this.showPrivateModal = true;
        },
        
        async sendPrivateMessage() {
            if (!this.privateMsgInput.trim()) return;
            
            const message = {
                username: this.username,
                content: `[PM to ${this.privateMessageRecipient}]: ${this.privateMsgInput}`,
                created_at: new Date().toISOString(),
                recipient: this.privateMessageRecipient
            };
            
            this.messages.push({ ...message, id: Date.now() });
            this.privateMsgInput = '';
            this.showPrivateModal = false;
            this.scrollToBottom();
            this.playSound('message');
            
            try {
                const { error } = await this.supabase.from('messages').insert([message]);
                if (error) throw error;
            } catch (error) {
                console.error('Failed to send PM:', error);
            }
        },
        
        clearChat() {
            if (confirm('Clear all local messages?')) {
                this.messages = [];
                localStorage.removeItem('mog_offline_msgs');
            }
        },
        
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.chatContainer;
                if (container) container.scrollTop = container.scrollHeight;
            });
        },
        
        // Enhanced Gallery Functions
        async loadGallery() {
            try {
                const { data, error } = await this.supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                this.galleryItems = data || [];
                
                // Cache for offline
                localStorage.setItem('mog_gallery_cache', JSON.stringify(this.galleryItems));
            } catch (error) {
                // Load from cache
                this.galleryItems = JSON.parse(localStorage.getItem('mog_gallery_cache') || '[]');
            }
        },
        
        subscribeToGallery() {
            this.supabase
                .channel('gallery')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, payload => {
                    if (payload.eventType === 'INSERT') {
                        this.galleryItems.unshift(payload.new);
                        this.playSound('upload');
                        this.showNotification('New Asset', `Uploaded by ${payload.new.owner}`);
                    } else if (payload.eventType === 'DELETE') {
                        this.galleryItems = this.galleryItems.filter(item => item.id !== payload.old.id);
                    }
                })
                .subscribe();
        },
        
        async uploadImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                this.errorMsg = 'FILE TYPE NOT SUPPORTED';
                this.playSound('error');
                return;
            }
            
            this.isUploading = true;
            this.uploadProgress = 0;
            
            const progressInterval = setInterval(() => {
                this.uploadProgress += 5;
                if (this.uploadProgress >= 90) clearInterval(progressInterval);
            }, 100);
            
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await this.supabase.storage
                    .from('gallery')
                    .upload(fileName, file, {
                        onUploadProgress: (progress) => {
                            this.uploadProgress = Math.round((progress.loaded / progress.total) * 100);
                        }
                    });
                    
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = this.supabase.storage.from('gallery').getPublicUrl(fileName);
                
                const { error: dbError } = await this.supabase.from('gallery').insert([{
                    url: publicUrl,
                    name: file.name,
                    owner: this.username,
                    size: file.size,
                    type: file.type
                }]);
                    
                if (dbError) throw dbError;
                
                this.uploadProgress = 100;
                this.playSound('upload');
                setTimeout(() => { this.isUploading = false; this.uploadProgress = 0; }, 500);
                
            } catch (error) {
                console.error('Upload failed:', error);
                // Offline fallback
                const offlineItem = {
                    id: Date.now(),
                    url: URL.createObjectURL(file),
                    name: file.name,
                    owner: this.username,
                    created_at: new Date().toISOString(),
                    size: file.size,
                    type: file.type,
                    offline: true
                };
                this.galleryItems.unshift(offlineItem);
                
                // Queue for later upload
                const uploadQueue = JSON.parse(localStorage.getItem('mog_upload_queue') || '[]');
                uploadQueue.push({ file: file.name, data: offlineItem });
                localStorage.setItem('mog_upload_queue', JSON.stringify(uploadQueue));
                
                this.isUploading = false;
                this.playSound('upload');
            }
        },
        
        async deleteImage(id) {
            if (!confirm('Delete this asset?')) return;
            
            try {
                const { error } = await this.supabase.from('gallery').delete().eq('id', id);
                if (error) throw error;
                this.galleryItems = this.galleryItems.filter(item => item.id !== id);
            } catch (error) {
                this.galleryItems = this.galleryItems.filter(item => item.id !== id);
            }
        },
        
        // Utilities
        formatTime(isoString) {
            return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        },
        
        formatDate(isoString) {
            return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
        },
        
        formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        },
        
        get totalStorage() {
            return this.galleryItems.reduce((acc, item) => acc + (item.size || 0), 0);
        },
        
        get uniqueUsers() {
            return [...new Set(this.messages.map(m => m.username))];
        }
    }
}
