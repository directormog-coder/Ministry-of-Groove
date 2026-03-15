/**
 * Ministry of Groove - NCC Master Application
 * Main Application Controller
 * 
 * @version 5.1.0
 * @author Ministry of Groove
 * @license PROPRIETARY
 */

import { MogCrypto } from './crypto-utils.js';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    VERSION: '5.1.0',
    BUILD_DATE: '2026-03-15',
    API_TIMEOUT: 30000,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    
    SUPABASE: {
        URL: import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
        ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
        STORAGE_BUCKET: 'mog-assets'
    },
    
    ROLES: {
        DIRECTOR: 'director',
        OPERATIVE: 'operative',
        GUEST: 'guest'
    },
    
    PERMISSIONS: {
        [ROLES.DIRECTOR]: ['read', 'write', 'delete', 'admin', 'export'],
        [ROLES.OPERATIVE]: ['read', 'write', 'limited_export'],
        [ROLES.GUEST]: ['read']
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

class AppState {
    constructor() {
        this.data = {
            view: 'auth',
            user: null,
            userRole: null,
            isLoading: false,
            authError: null,
            loginAttempts: 0,
            lockoutUntil: null,
            
            // UI State
            sidebarOpen: false,
            notifications: [],
            activeModal: null,
            
            // Data Cache
            personnel: [],
            media: [],
            frequencies: [],
            
            // Real-time
            onlineUsers: 0,
            systemStatus: 'operational'
        };
        
        this.listeners = new Map();
        this.persistentKeys = ['user', 'userRole', 'loginAttempts', 'lockoutUntil'];
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        
        // Persist to localStorage if needed
        if (this.persistentKeys.includes(key)) {
            this.persist(key, value);
        }
        
        // Notify listeners
        this.notify(key, value, oldValue);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => this.listeners.get(key).delete(callback);
    }

    notify(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(cb => cb(newValue, oldValue));
        }
    }

    persist(key, value) {
        try {
            const storageKey = `mog_state_${key}`;
            if (value === null) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(storageKey, JSON.stringify(value));
            }
        } catch (e) {
            console.error('[STATE] Persistence failed:', e);
        }
    }

    restore() {
        this.persistentKeys.forEach(key => {
            try {
                const stored = localStorage.getItem(`mog_state_${key}`);
                if (stored) {
                    this.data[key] = JSON.parse(stored);
                }
            } catch (e) {
                console.error('[STATE] Restore failed for', key);
            }
        });
    }

    clear() {
        this.persistentKeys.forEach(key => {
            this.set(key, null);
        });
    }
}

// ==========================================
// AUTHENTICATION SERVICE
// ==========================================

class AuthService {
    constructor(supabase, state) {
        this.supabase = supabase;
        this.state = state;
        this.crypto = MogCrypto;
    }

    async initialize() {
        // Check existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session?.user) {
            const role = this.extractRole(session.user);
            this.state.set('user', session.user);
            this.state.set('userRole', role);
            this.state.set('view', 'grid');
            return true;
        }
        
        // Check for traditional auth restore
        this.state.restore();
        if (this.state.get('user') && this.state.get('userRole')) {
            this.state.set('view', 'grid');
            return true;
        }
        
        return false;
    }

    async loginWithCredentials(id, password) {
        // Check lockout
        const lockoutUntil = this.state.get('lockoutUntil');
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
            throw new Error(`Account locked. Try again in ${remaining} minutes.`);
        }

        this.state.set('isLoading', true);
        this.state.set('authError', null);

        try {
            const role = id.toLowerCase().trim();
            const credential = `${role}:${password}`;
            const hashed = await this.crypto.sha256(credential);

            // Attempt Supabase Auth first
            if (this.isSupabaseConfigured()) {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: `${role}@ministryofgroove.local`,
                    password: password
                });

                if (error) throw error;
                
                await this.handleSuccessfulAuth(data.user, role);
                return;
            }

            // Fallback to hashed comparison (development/emergency only)
            const expectedHash = await this.getExpectedHash(role);
            if (!expectedHash || hashed !== expectedHash) {
                throw new Error('Invalid credentials');
            }

            // Create mock user for offline mode
            const mockUser = {
                id: role,
                email: `${role}@ministryofgroove.local`,
                role: role,
                created_at: new Date().toISOString()
            };

            await this.handleSuccessfulAuth(mockUser, role);

        } catch (error) {
            this.handleFailedAuth(error);
            throw error;
        } finally {
            this.state.set('isLoading', false);
        }
    }

    async loginWithOAuth(provider) {
        this.state.set('isLoading', true);
        this.state.set('authError', null);

        try {
            if (!this.isSupabaseConfigured()) {
                throw new Error('Authentication service unavailable');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: provider === 'google' ? 'email profile' : 'openid email'
                }
            });

            if (error) throw error;
            
            // OAuth redirects - success handled in callback
            return data;

        } catch (error) {
            this.state.set('authError', `${provider} authentication failed`);
            this.state.set('isLoading', false);
            throw error;
        }
    }

    async handleOAuthCallback() {
        const hash = window.location.hash;
        if (!hash.includes('access_token')) return false;

        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session?.user) {
            const role = this.extractRole(session.user);
            await this.handleSuccessfulAuth(session.user, role);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
        
        return false;
    }

    async logout() {
        if (this.isSupabaseConfigured()) {
            await this.supabase.auth.signOut();
        }
        
        this.state.clear();
        this.state.set('view', 'auth');
        this.state.set('user', null);
        this.state.set('userRole', null);
        
        // Clear secure storage
        this.crypto.SecureStorage.clear();
    }

    // Helper methods
    extractRole(user) {
        return user.user_metadata?.role || 
               user.email?.split('@')[0] || 
               CONFIG.ROLES.OPERATIVE;
    }

    async handleSuccessfulAuth(user, role) {
        this.state.set('loginAttempts', 0);
        this.state.set('lockoutUntil', null);
        this.state.set('user', user);
        this.state.set('userRole', role);
        this.state.set('view', 'grid');

        // Generate session security token
        const sessionToken = await this.crypto.SessionSecurity.createSessionToken();
        sessionStorage.setItem('mog_session_token', sessionToken);

        this.logSecurityEvent('LOGIN_SUCCESS', { role, userId: user.id });
    }

    handleFailedAuth(error) {
        const attempts = (this.state.get('loginAttempts') || 0) + 1;
        this.state.set('loginAttempts', attempts);

        if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            const lockout = Date.now() + CONFIG.LOCKOUT_DURATION;
            this.state.set('lockoutUntil', lockout);
            this.state.set('authError', 'Too many failed attempts. Account locked.');
        } else {
            this.state.set('authError', 'Access denied: Invalid credentials');
        }

        this.logSecurityEvent('LOGIN_FAILURE', { 
            error: error.message, 
            attempts,
            remaining: CONFIG.MAX_LOGIN_ATTEMPTS - attempts 
        });
    }

    isSupabaseConfigured() {
        return CONFIG.SUPABASE.URL && 
               !CONFIG.SUPABASE.URL.includes('YOUR_') &&
               CONFIG.SUPABASE.ANON_KEY &&
               !CONFIG.SUPABASE.ANON_KEY.includes('YOUR_');
    }

    async getExpectedHash(role) {
        // In production, fetch from secure endpoint or environment
        const hashes = {
            [CONFIG.ROLES.DIRECTOR]: import.meta.env.VITE_DIRECTOR_HASH,
            [CONFIG.ROLES.OPERATIVE]: import.meta.env.VITE_OPERATIVE_HASH
        };
        return hashes[role];
    }

    logSecurityEvent(event, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            ip: 'client-side',
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        console.log('[MOG SECURITY]', entry);
        
        // Send to logging endpoint if available
        if (this.isSupabaseConfigured()) {
            this.supabase.from('security_logs').insert(entry).catch(() => {});
        }
    }
}

// ==========================================
// DATA SERVICE
// ==========================================

class DataService {
    constructor(supabase, state) {
        this.supabase = supabase;
        this.state = state;
        this.cache = new Map();
        this.subscriptions = new Map();
    }

    async fetchPersonnel(filters = {}) {
        const cacheKey = `personnel_${JSON.stringify(filters)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const { data, error } = await this.supabase
            .from('personnel')
            .select('*')
            .match(filters);

        if (error) throw error;
        
        this.cache.set(cacheKey, data);
        this.state.set('personnel', data);
        
        return data;
    }

    async fetchMedia(category = null) {
        let query = this.supabase
            .from('media')
            .select('*, personnel(name, codename)');
        
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        this.state.set('media', data);
        return data;
    }

    async uploadFile(file, metadata = {}) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${MogCrypto.generateSecureToken(16)}.${fileExt}`;
        const filePath = `${this.state.get('userRole')}/${fileName}`;

        // Encrypt sensitive files
        let uploadData = file;
        if (metadata.encrypt) {
            const password = await this.getEncryptionKey();
            uploadData = await MogCrypto.encryptForStorage(
                await file.arrayBuffer(), 
                password
            );
        }

        const { data, error } = await this.supabase.storage
            .from(CONFIG.SUPABASE.STORAGE_BUCKET)
            .upload(filePath, uploadData, {
                contentType: file.type,
                upsert: false
            });

        if (error) throw error;

        // Record in database
        await this.supabase.from('media').insert({
            filename: fileName,
            path: filePath,
            size: file.size,
            type: file.type,
            uploaded_by: this.state.get('user').id,
            metadata: metadata
        });

        return data;
    }

    subscribeToRealtime(channel, callback) {
        if (this.subscriptions.has(channel)) {
            this.subscriptions.get(channel).unsubscribe();
        }

        const subscription = this.supabase
            .channel(`public:${channel}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: channel }, callback)
            .subscribe();

        this.subscriptions.set(channel, subscription);
        return () => subscription.unsubscribe();
    }

    async getEncryptionKey() {
        // Derive from session or prompt
        const session = this.state.get('user');
        return session?.id || MogCrypto.generateSecureToken(32);
    }
}

// ==========================================
// UI CONTROLLER
// ==========================================

class UIController {
    constructor(state) {
        this.state = state;
        this.modals = new Map();
        this.toastContainer = null;
    }

    initialize() {
        this.createToastContainer();
        this.setupKeyboardShortcuts();
        this.setupBeforeUnload();
    }

    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'mog-toast-container';
        this.toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `glass-gold px-4 py-3 rounded-lg border-l-4 ${
            type === 'error' ? 'border-red-500' :
            type === 'success' ? 'border-green-500' :
            type === 'warning' ? 'border-yellow-500' :
            'border-electric'
        } animate-slide-in`;
        
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-xs font-mono uppercase tracking-wider">${type}</span>
                <p class="text-sm text-white">${message}</p>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showModal(id, content) {
        const modal = document.createElement('div');
        modal.id = `modal-${id}`;
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="glass-gold p-8 rounded-2xl max-w-lg w-full mx-4 relative animate-scale-in">
                <button class="absolute top-4 right-4 text-zinc-500 hover:text-white" onclick="app.ui.closeModal('${id}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        this.modals.set(id, modal);
        this.state.set('activeModal', id);
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.add('animate-fade-out');
            setTimeout(() => {
                modal.remove();
                this.modals.delete(id);
            }, 300);
        }
        this.state.set('activeModal', null);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                const activeModal = this.state.get('activeModal');
                if (activeModal) this.closeModal(activeModal);
            }

            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showSearch();
            }

            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }

    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            const isUploading = this.state.get('isUploading');
            if (isUploading) {
                e.preventDefault();
                e.returnValue = 'Upload in progress. Leave anyway?';
            }
        });
    }

    showSearch() {
        this.showModal('search', `
            <h3 class="text-lg font-bold text-gold mb-4">Grid Search</h3>
            <input type="text" 
                   placeholder="Search personnel, media, frequencies..." 
                   class="ncc-input w-full"
                   id="search-input">
            <div id="search-results" class="mt-4 max-h-64 overflow-y-auto"></div>
        `);
        
        setTimeout(() => {
            document.getElementById('search-input')?.focus();
        }, 100);
    }

    showHelp() {
        this.showModal('help', `
            <h3 class="text-lg font-bold text-gold mb-4">Keyboard Shortcuts</h3>
            <div class="space-y-2 text-sm font-mono">
                <div class="flex justify-between"><span>Ctrl + K</span><span class="text-zinc-400">Search</span></div>
                <div class="flex justify-between"><span>Ctrl + /</span><span class="text-zinc-400">Help</span></div>
                <div class="flex justify-between"><span>ESC</span><span class="text-zinc-400">Close modal</span></div>
                <div class="flex justify-between"><span>Ctrl + Shift + L</span><span class="text-zinc-400">Logout</span></div>
            </div>
        `);
    }
}

// ==========================================
// MAIN APPLICATION CLASS
// ==========================================

class MinistryOfGrooveApp {
    constructor() {
        this.state = new AppState();
        this.supabase = null;
        this.auth = null;
        this.data = null;
        this.ui = null;
        
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        console.log(`[MOG] Initializing NCC Master v${CONFIG.VERSION}`);

        // Initialize Supabase if configured
        if (CONFIG.SUPABASE.URL && !CONFIG.SUPABASE.URL.includes('YOUR_')) {
            this.supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            });
        }

        // Initialize services
        this.auth = new AuthService(this.supabase, this.state);
        this.data = new DataService(this.supabase, this.state);
        this.ui = new UIController(this.state);

        // Setup UI
        this.ui.initialize();

        // Check for existing session
        const hasSession = await this.auth.initialize();
        
        if (hasSession) {
            this.ui.showToast('Session restored', 'success');
        }

        // Setup global error handling
        this.setupErrorHandling();

        // Register service worker
        this.registerServiceWorker();

        this.initialized = true;
        console.log('[MOG] Initialization complete');

        // Expose for debugging (development only)
        if (import.meta.env.DEV) {
            window.mogApp = this;
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[MOG ERROR]', e.error);
            this.ui.showToast('System error occurred', 'error');
            
            // Report to monitoring
            this.reportError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('[MOG REJECTION]', e.reason);
            this.ui.showToast('Async operation failed', 'error');
            this.reportError(e.reason);
        });
    }

    reportError(error) {
        // Send to error tracking service
        if (window.Sentry) {
            Sentry.captureException(error);
        }
        
        // Log to Supabase if available
        if (this.supabase) {
            this.supabase.from('error_logs').insert({
                message: error.message,
                stack: error.stack,
                user_id: this.state.get('user')?.id,
                timestamp: new Date().toISOString()
            }).catch(() => {});
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('[MOG] Service Worker registered');
                    
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.ui.showToast('Update available. Refresh to apply.', 'warning', 10000);
                            }
                        });
                      });
                })
                .catch(err => console.log('[MOG] SW registration failed:', err));
        }
    }

    // Public API methods for Alpine.js integration
    getState() {
        return this.state.data;
    }

    async login(id, password) {
        try {
            await this.auth.loginWithCredentials(id, password);
            return true;
        } catch (error) {
            return false;
        }
    }

    async oauthLogin(provider) {
        try {
            await this.auth.loginWithOAuth(provider);
            return true;
        } catch (error) {
            return false;
        }
    }

    async logout() {
        await this.auth.logout();
    }

    hasPermission(permission) {
        const role = this.state.get('userRole');
        const permissions = CONFIG.PERMISSIONS[role] || [];
        return permissions.includes(permission);
    }

    isAuthenticated() {
        return !!this.state.get('user');
    }
}

// ==========================================
// ALPINE.JS INTEGRATION
// ==========================================

/**
 * Alpine.js data function for backward compatibility
 * This bridges the new class-based architecture with Alpine's reactivity
 */
function nccMasterEngine() {
    // Initialize app on first call
    if (!window.mogApp) {
        window.mogApp = new MinistryOfGrooveApp();
        window.mogApp.initialize();
    }

    const app = window.mogApp;
    const state = app.state;

    return {
        // Reactive state (mirrors Alpine's expected structure)
        view: state.get('view'),
        userRole: state.get('userRole'),
        user: state.get('user'),
        isLoading: state.get('isLoading'),
        authError: state.get('authError'),
        
        // Form data
        authForm: { id: '', pass: '' },

      // Initialize Alpine component
        async init() {
            // Sync with app state
            state.subscribe('view', (v) => this.view = v);
            state.subscribe('userRole', (v) => this.userRole = v);
            state.subscribe('user', (v) => this.user = v);
            state.subscribe('isLoading', (v) => this.isLoading = v);
            state.subscribe('authError', (v) => this.authError = v);

            // Check for OAuth callback
            await app.auth.handleOAuthCallback();
            
            // Initialize icons
            this.$nextTick(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        },

        // Actions
        async attemptAccess() {
            const success = await app.login(this.authForm.id, this.authForm.pass);
            if (success) {
                this.authForm = { id: '', pass: '' };
            }
        },

        async loginWithGoogle() {
            await app.oauthLogin('google');
        },

        terminateSession() {
            app.logout();
        },

        // Computed
        get isDirector() {
            return this.userRole === CONFIG.ROLES.DIRECTOR;
        },

        get isOperative() {
            return this.userRole === CONFIG.ROLES.OPERATIVE;
        }
    };
}

// ==========================================
// EXPORTS
// ==========================================

// ES Module exports
export {
    MinistryOfGrooveApp,
    AppState,
    AuthService,
    DataService,
    UIController,
    CONFIG,
    nccMasterEngine
};

// Global exposure for non-module contexts
if (typeof window !== 'undefined') {
    window.MinistryOfGrooveApp = MinistryOfGrooveApp;
    window.nccMasterEngine = nccMasterEngine;
    window.MOG_CONFIG = CONFIG;
}
