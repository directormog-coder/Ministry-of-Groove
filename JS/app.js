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
        
        showNotification(title, body, icon = 'assets/images/logo.png') {
            if (this.notifications && this.notificationPermission && document.hidden) {
                new Notification(title, { body, icon, badge: icon, tag: 'ministry-groove' });
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
            
            if (this.handleInput.length < 3) {
                this.errorMsg = 'HANDLE MUST BE 3+ CHARACTERS';
                return;
            }
            
            this.isLoading = true;
            this.errorMsg = '';
            
            try {
                // Check if director (silently)
                const isDirector = await this.checkIfDirector(this.emailInput);
                
                // Register with Supabase Auth
                const { data, error } = await this.supabase.auth.signUp({
                    email: this.emailInput,
                    password: this.passwordInput,
                    options: {
                        data: {
                            handle: this.handleInput.toUpperCase(),
                            is_director: isDirector
                        }
                    }
                });
                
                if (error) throw error;
                
                // Create profile in database
                const { error: profileError } = await this.supabase
                    .from('profiles')
                    .insert([{
                        id: data.user.id,
                        email: this.emailInput,
                        handle: this.handleInput.toUpperCase(),
                        is_director: isDirector,
                        created_at: new Date().toISOString()
                    }]);
                
                if (profileError) throw profileError;
                
                // Auto-login after registration
                await this.loginUser();
                
            } catch (error) {
                this.errorMsg = error.message || 'REGISTRATION FAILED';
                this.playSound('error');
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
                // Check if director first
                this.isDirector = await this.checkIfDirector(this.emailInput);
                
                // Sign in with Supabase
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: this.emailInput,
                    password: this.passwordInput
                });
                
                if (error) throw error;
                
                // Get user profile
                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                if (profileError && profileError.code !== 'PGRST116') {
                    // Profile doesn't exist, create it
                    const { error: createError } = await this.supabase
                        .from('profiles')
                        .insert([{
                            id: data.user.id,
                            email: this.emailInput,
                            handle: this.handleInput || this.emailInput.split('@')[0].toUpperCase(),
                            is_director: this.isDirector
                        }]);
                    
                    if (createError) throw createError;
                }
                
                // Set user data
                this.userEmail = this.emailInput;
                this.username = profile?.handle || this.emailInput.split('@')[0].toUpperCase();
                this.isDirector = profile?.is_director || this.isDirector;
                
                // Route based on role
                if (this.isDirector) {
                    this.connectionStatus = 'DIRECTORATE ACCESS GRANTED';
                    window.location.href = 'directorate.html';
                } else {
                    this.connectionStatus = 'OPERATIVE ACCESS GRANTED';
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
        
        async checkSession() {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                this.userEmail = session.user.email;
                this.username = profile?.handle || session.user.email.split('@')[0].toUpperCase();
                this.isDirector = profile?.is_director || await this.checkIfDirector(session.user.email);
                
                // Check current page and redirect if needed
                const currentPage = window.location.pathname.split('/').pop();
                
                if (this.isDirector && currentPage !== 'directorate.html') {
                    window.location.href = 'directorate.html';
                } else if (!this.isDirector && currentPage === 'directorate.html') {
                    window.location.href = 'index.html';
                } else if (!this.isDirector) {
                    this.view = 'grid';
                }
            }
        },
        
        async logout() {
            this.playSound('logout');
            await this.supabase.auth.signOut();
            localStorage.removeItem('mog_email');
            localStorage.removeItem('mog_handle');
            localStorage.removeItem('mog_is_director');
            this.view = 'auth';
            this.username = '';
            this.userEmail = '';
            this.isDirector = false;
            this.messages = [];
            this.galleryItems = [];
            this.authMode = 'login';
            this.connectionStatus = 'STANDBY';
        },
        
        // Voice Recording Functions
        async startRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.recordedChunks = [];
                
                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) this.recordedChunks.push(e.data);
                };
                
                this.mediaRecorder.onstop = () => {
                    this.recordedBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());
                };
                
                this.mediaRecorder.start();
                this.isRecording = true;
                this.playSound('recordStart');
                
                let seconds = 0;
                this.recordingInterval = setInterval(() => {
                    seconds++;
                    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                    const secs = (seconds % 60).toString().padStart(2, '0');
                    this.recordingTime = `${mins}:${secs}`;
                }, 1000);
                
            } catch (err) {
                alert('Microphone access denied');
                console.error(err);
            }
        },
        
        stopRecording() {
            if (this.mediaRecorder && this.isRecording) {
                this.mediaRecorder.stop();
                this.isRecording = false;
                clearInterval(this.recordingInterval);
                this.playSound('recordStop');
            }
        },
        
        cancelRecording() {
            if (this.isRecording) {
                this.mediaRecorder.stop();
                this.isRecording = false;
                clearInterval(this.recordingInterval);
            }
            this.recordedBlob = null;
            this.recordingTime = '0:00';
        },
        
        async sendVoiceMessage() {
            if (!this.recordedBlob) return;
            
            const duration = this.recordingTime;
            const fileName = `voice_${Date.now()}.webm`;
            const localUrl = URL.createObjectURL(this.recordedBlob);
            
            const message = {
                id: Date.now(),
                username: this.username,
                type: 'voice',
                url: localUrl,
                duration: duration,
                created_at: new Date().toISOString(),
                progress: 0,
                isPlaying: false
            };
            
            this.messages.push(message);
            this.scrollToBottom();
            this.playSound('upload');
            
            try {
                const { data: uploadData, error: uploadError } = await this.supabase.storage
                    .from('gallery')
                    .upload(fileName, this.recordedBlob);
                    
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = this.supabase.storage.from('gallery').getPublicUrl(fileName);
                
                await this.supabase.from('messages').insert([{
                    username: this.username,
                    type: 'voice',
                    url: publicUrl,
                    duration: duration,
                    created_at: new Date().toISOString()
                }]);
                
            } catch (error) {
                console.error('Voice upload failed:', error);
            }
            
            this.showVoiceRecorder = false;
            this.cancelRecording();
        },
        
        playVoiceMessage(url) {
            const msg = this.messages.find(m => m.url === url);
            if (!msg) return;
            
            const audio = new Audio(url);
            
            if (msg.isPlaying) {
                audio.pause();
                msg.isPlaying = false;
            } else {
                this.messages.forEach(m => { if (m.isPlaying) m.isPlaying = false; });
                
                msg.isPlaying = true;
                audio.play();
                
                audio.ontimeupdate = () => {
                    msg.progress = (audio.currentTime / audio.duration) * 100;
                };
                
                audio.onended = () => {
                    msg.isPlaying = false;
                    msg.progress = 0;
                };
            }
        },
        
        // Encryption Functions
        prepareEncryptedUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            this.pendingFile = file;
            this.showEncryptionModal = true;
        },
        
        async confirmEncryption() {
            if (!this.encryptionPassword || !this.pendingFile) return;
            
            this.isUploading = true;
            this.showEncryptionModal = false;
            
            try {
                const arrayBuffer = await this.pendingFile.arrayBuffer();
                const encrypted = await this.encryptData(arrayBuffer, this.encryptionPassword);
                const encryptedBlob = new Blob([encrypted], { type: 'application/encrypted' });
                const fileName = `encrypted_${Date.now()}.mog`;
                
                const { data: uploadData, error: uploadError } = await this.supabase.storage
                    .from('gallery')
                    .upload(fileName, encryptedBlob);
                    
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = this.supabase.storage.from('gallery').getPublicUrl(fileName);
                
                await this.supabase.from('gallery').insert([{
                    url: publicUrl,
                    name: this.pendingFile.name,
                    owner: this.username,
                    size: this.pendingFile.size,
                    isEncrypted: true,
                    created_at: new Date().toISOString()
                }]);
                
                await this.supabase.from('messages').insert([{
                    username: this.username,
                    type: 'encrypted',
                    fileName: this.pendingFile.name,
                    url: publicUrl,
                    created_at: new Date().toISOString()
                }]);
                
                this.playSound('upload');
                this.showNotification('File Encrypted', 'Secure upload complete');
                
            } catch (error) {
                console.error('Encryption failed:', error);
                alert('Encryption failed: ' + error.message);
            }
            
            this.isUploading = false;
            this.pendingFile = null;
            this.encryptionPassword = '';
        },
        
        async encryptData(buffer, password) {
            const encoder = new TextEncoder();
            const key = encoder.encode(password);
            const data = new Uint8Array(buffer);
            
            for (let i = 0; i < data.length; i++) {
                data[i] ^= key[i % key.length];
            }
            
            const header = encoder.encode('MOG_ENCRYPTED:' + this.pendingFile.name + ':');
            const result = new Uint8Array(header.length + data.length);
            result.set(header);
            result.set(data, header.length);
            
            return result;
        },
        
        async decryptFile(msg) {
            if (!msg.decryptInput) return;
            
            try {
                const response = await fetch(msg.url);
                const encrypted = await response.arrayBuffer();
                
                const decoder = new TextDecoder();
                const headerEnd = new Uint8Array(encrypted).indexOf(58, 50);
                const header = decoder.decode(encrypted.slice(0, headerEnd + 1));
                const data = new Uint8Array(encrypted.slice(headerEnd + 1));
                
                const key = new TextEncoder().encode(msg.decryptInput);
                for (let i = 0; i < data.length; i++) {
                    data[i] ^= key[i % key.length];
                }
                
                const isValid = data[0] === 0xFF || data[0] === 0x89 || data[0] === 0x25;
                
                if (!isValid) {
                    alert('Invalid decryption key');
                    return;
                }
                
                const blob = new Blob([data]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = header.split(':')[1] || 'decrypted_file';
                a.click();
                
                this.showNotification('Decryption successful', 'File downloaded');
                
            } catch (error) {
                console.error('Decryption failed:', error);
                alert('Decryption failed');
            }
        },
        
        // Chat Functions
        async loadMessages() {
            try {
                const { data, error } = await this.supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .limit(100);
                    
                if (error) throw error;
                this.messages = (data || []).map(m => ({ ...m, decryptInput: '' }));
                this.scrollToBottom();
            } catch (error) {
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
                        this.messages.push({ ...payload.new, decryptInput: '' });
                        if (payload.new.username !== this.username) {
                            this.unreadCount++;
                            this.playSound('message');
                            this.showNotification('New Message', `${payload.new.username}: ${payload.new.content?.substring(0, 50) || 'Voice message'}...`);
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
                type: 'text',
                created_at: new Date().toISOString(),
                recipient: this.privateMessageRecipient
            };
            
            this.messages.push({ ...message, id: Date.now(), decryptInput: '' });
            
            const offlineMsgs = JSON.parse(localStorage.getItem('mog_offline_msgs') || '[]');
            offlineMsgs.push(message);
            localStorage.setItem('mog_offline_msgs', JSON.stringify(offlineMsgs.slice(-100)));
            
            this.msgInput = '';
            this.scrollToBottom();
            this.playSound('message');
            
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
                type: 'text',
                recipient: this.privateMessageRecipient,
                created_at: new Date().toISOString()
            };
            
            this.messages.push({ ...message, id: Date.now(), decryptInput: '' });
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
        
        async loadGallery() {
            try {
                const { data, error } = await this.supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                this.galleryItems = data || [];
                localStorage.setItem('mog_gallery_cache', JSON.stringify(this.galleryItems));
            } catch (error) {
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
                    .upload(fileName, file);
                    
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = this.supabase.storage.from('gallery').getPublicUrl(fileName);
                
                const { error: dbError } = await this.supabase.from('gallery').insert([{
                    url: publicUrl,
                    name: file.name,
                    owner: this.username,
                    size: file.size,
                    created_at: new Date().toISOString()
                }]);
                    
                if (dbError) throw dbError;
                
                this.uploadProgress = 100;
                this.playSound('upload');
                setTimeout(() => { this.isUploading = false; this.uploadProgress = 0; }, 500);
                
            } catch (error) {
                const offlineItem = {
                    id: Date.now(),
                    url: URL.createObjectURL(file),
                    name: file.name,
                    owner: this.username,
                    created_at: new Date().toISOString(),
                    size: file.size,
                    offline: true
                };
                this.galleryItems.unshift(offlineItem);
                
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
