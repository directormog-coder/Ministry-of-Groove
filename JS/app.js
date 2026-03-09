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
        notifications: true,
        currentTime: '00:00:00',
        weatherStatus: 'SYNCING...',
        connectionStatus: 'STANDBY',
        onlineCount: 0,
        unreadCount: 0,
        uploadProgress: 0,
        sessionStart: null,
        sessionDuration: '00:00',
        
        // Supabase Client (replace with your credentials)
        supabase: null,
        
        init() {
            // Initialize Supabase - REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
            const SUPABASE_URL = 'https://your-project.supabase.co';
            const SUPABASE_ANON_KEY = 'your-anon-key';
            
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Check for existing session
            this.checkSession();
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Simulate weather sync
            setTimeout(() => {
                this.weatherStatus = 'CLEAR • 22°C';
            }, 2000);
            
            // Initialize Lucide icons
            lucide.createIcons();
            
            // Setup realtime subscriptions if in grid view
            this.$watch('view', (value) => {
                if (value === 'grid') {
                    this.sessionStart = Date.now();
                    this.updateSessionDuration();
                    setInterval(() => this.updateSessionDuration(), 60000);
                    this.subscribeToMessages();
                    this.subscribeToGallery();
                    this.loadMessages();
                    this.loadGallery();
                }
            });
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
                // Simulate API call for operative handle
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Check if handle is valid (mock validation)
                if (this.handleInput.length < 3) {
                    throw new Error('HANDLE MUST BE 3+ CHARACTERS');
                }
                
                this.username = this.handleInput.toUpperCase();
                this.view = 'grid';
                this.connectionStatus = 'CONNECTED';
                
            } catch (error) {
                this.errorMsg = error.message || 'AUTHENTICATION FAILED';
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
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                this.username = 'DIRECTORATE';
                this.view = 'grid';
                this.connectionStatus = 'DIRECTORATE ACCESS GRANTED';
                
            } catch (error) {
                this.errorMsg = error.message || 'AUTHORIZATION FAILED';
            } finally {
                this.isLoading = false;
            }
        },
        
        async logout() {
            await this.supabase.auth.signOut();
            this.view = 'auth';
            this.username = '';
            this.messages = [];
            this.galleryItems = [];
            this.showBypass = false;
            this.connectionStatus = 'STANDBY';
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
                this.messages = data || [];
                this.scrollToBottom();
            } catch (error) {
                console.error('Failed to load messages:', error);
                // Load mock data for demo
                this.messages = [
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
                        }
                        this.scrollToBottom();
                    }
                })
                .subscribe();
        },
        
        async sendMessage() {
            if (!this.msgInput.trim()) return;
            
            const message = {
                username: this.username,
                content: this.msgInput.trim(),
                created_at: new Date().toISOString()
            };
            
            // Optimistic update
            this.messages.push({ ...message, id: Date.now() });
            this.msgInput = '';
            this.scrollToBottom();
            
            try {
                const { error } = await this.supabase
                    .from('messages')
                    .insert([message]);
                    
                if (error) throw error;
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        },
        
        clearChat() {
            if (confirm('Clear all local messages?')) {
                this.messages = [];
            }
        },
        
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.chatContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        
        // Gallery Functions
        async loadGallery() {
            try {
                const { data, error } = await this.supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                this.galleryItems = data || [];
            } catch (error) {
                console.error('Failed to load gallery:', error);
                this.galleryItems = [];
            }
        },
        
        subscribeToGallery() {
            this.supabase
                .channel('gallery')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, payload => {
                    if (payload.eventType === 'INSERT') {
                        this.galleryItems.unshift(payload.new);
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
            
            try {
                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    this.uploadProgress += 10;
                    if (this.uploadProgress >= 90) clearInterval(progressInterval);
                }, 200);
                
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await this.supabase.storage
                    .from('gallery')
                    .upload(fileName, file);
                    
                if (uploadError) throw uploadError;
                
                // Get public URL
                const { data: { publicUrl } } = this.supabase.storage
                    .from('gallery')
                    .getPublicUrl(fileName);
                
                // Save to database
                const { error: dbError } = await this.supabase
                    .from('gallery')
                    .insert([{
                        url: publicUrl,
                        name: file.name,
                        owner: this.username,
                        size: file.size
                    }]);
                    
                if (dbError) throw dbError;
                
                this.uploadProgress = 100;
                setTimeout(() => {
                    this.isUploading = false;
                    this.uploadProgress = 0;
                }, 500);
                
            } catch (error) {
                console.error('Upload failed:', error);
                this.errorMsg = 'UPLOAD FAILED: ' + error.message;
                this.isUploading = false;
                
                // Mock upload for demo
                setTimeout(() => {
                    this.galleryItems.unshift({
                        id: Date.now(),
                        url: URL.createObjectURL(file),
                        name: file.name,
                        owner: this.username,
                        created_at: new Date().toISOString(),
                        size: file.size
                    });
                    this.isUploading = false;
                }, 1500);
            }
        },
        
        async deleteImage(id) {
            if (!confirm('Delete this asset?')) return;
            
            try {
                const { error } = await this.supabase
                    .from('gallery')
                    .delete()
                    .eq('id', id);
                    
                if (error) throw error;
                this.galleryItems = this.galleryItems.filter(item => item.id !== id);
            } catch (error) {
                console.error('Delete failed:', error);
                this.galleryItems = this.galleryItems.filter(item => item.id !== id);
            }
        },
        
        // Utilities
        formatTime(isoString) {
            return new Date(isoString).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        formatDate(isoString) {
            return new Date(isoString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            });
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
        }
    }
                                         }
