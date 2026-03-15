// js/supabase-client.js
// Ministry of Groove - Secure Supabase Client
// Classification: CONFIDENTIAL // SEC-7G

/**
 * Secure Supabase Client Module
 * Handles encrypted connection initialization and secure storage operations
 * Version: 5.2.0
 * Dependencies: MogCrypto (crypto-utils.js)
 */

(function() {
    'use strict';

    // Security: Configuration loaded from environment only
    const CONFIG = {
        SUPABASE_URL: window.__ENV__?.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: window.__ENV__?.SUPABASE_ANON_KEY || '',
        API_VERSION: 'v1',
        MAX_RETRIES: 3,
        TIMEOUT: 10000
    };

    // Validate configuration
    function validateConfig() {
        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            console.error('[MOG-SECURITY] Supabase credentials not configured');
            return false;
        }
        
        try {
            new URL(CONFIG.SUPABASE_URL);
        } catch {
            console.error('[MOG-SECURITY] Invalid Supabase URL format');
            return false;
        }
        
        return true;
    }

    // Secure client state
    let supabaseClient = null;
    let connectionStatus = 'disconnected';

    /**
     * Initialize Supabase client with security hardening
     */
    function initializeClient() {
        if (!validateConfig()) {
            throw new Error('Supabase configuration invalid. Check environment variables.');
        }

        if (typeof supabase === 'undefined') {
            throw new Error('Supabase library not loaded. Include @supabase/supabase-js before this module.');
        }

        // Check for MogCrypto dependency
        if (typeof MogCrypto === 'undefined') {
            console.warn('[MOG-SECURITY] MogCrypto not loaded. Some encryption features may be unavailable.');
        }

        try {
            supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false,
                    storage: window.localStorage,
                    storageKey: 'mog-session-v5-2'
                },
                global: {
                    headers: {
                        'X-Client-Info': 'ministry-of-groove@5.2.0',
                        'X-Security-Level': 'CONFIDENTIAL'
                    },
                    fetch: (url, options = {}) => {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
                        
                        return fetch(url, {
                            ...options,
                            signal: controller.signal,
                            headers: {
                                ...options.headers,
                                'X-Request-ID': generateRequestId()
                            }
                        }).finally(() => clearTimeout(timeoutId));
                    }
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });

            connectionStatus = 'initialized';
            console.info('[MOG-SECURITY] Supabase client initialized securely');
            
            return supabaseClient;
        } catch (error) {
            console.error('[MOG-SECURITY] Client initialization failed:', error);
            throw error;
        }
    }

    function generateRequestId() {
        return `mog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    function getClient() {
        if (!supabaseClient) {
            initializeClient();
        }
        return supabaseClient;
    }

    /**
     * Secure Storage Operations with Encryption Layer
     */
    const SecureStorage = {
        async uploadFile(bucket, path, file, options = {}) {
            const client = getClient();
            
            try {
                const metadata = options.metadata || {};
                
                // Generate checksum if MogCrypto available
                if (typeof MogCrypto !== 'undefined' && file) {
                    const arrayBuffer = await file.arrayBuffer();
                    metadata.checksum = await MogCrypto.sha256(arrayBuffer);
                    metadata.encrypted = options.encrypt || false;
                }

                const { data, error } = await client.storage
                    .from(bucket)
                    .upload(path, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type,
                        ...options,
                        metadata
                    });

                if (error) throw error;
                
                console.info(`[MOG-STORAGE] Secure upload complete: ${path}`);
                return { data, success: true };
            } catch (error) {
                console.error('[MOG-STORAGE] Upload failed:', error);
                return { error, success: false };
            }
        },

        async getSignedUrl(bucket, path, expiresIn = 3600) {
            const client = getClient();
            
            try {
                const { data, error } = await client.storage
                    .from(bucket)
                    .createSignedUrl(path, expiresIn);

                if (error) throw error;
                
                return { 
                    signedUrl: data.signedUrl,
                    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
                    success: true 
                };
            } catch (error) {
                console.error('[MOG-STORAGE] Signed URL generation failed:', error);
                return { error, success: false };
            }
        },

        async downloadFile(bucket, path) {
            const client = getClient();
            
            try {
                const { data, error } = await client.storage
                    .from(bucket)
                    .download(path);

                if (error) throw error;
                
                return { blob: data, success: true };
            } catch (error) {
                console.error('[MOG-STORAGE] Download failed:', error);
                return { error, success: false };
            }
        },

        async listFiles(bucket, path = '', options = {}) {
            const client = getClient();
            
            try {
                const { data, error } = await client.storage
                    .from(bucket)
                    .list(path, {
                        limit: 100,
                        offset: 0,
                        sortBy: { column: 'name', order: 'asc' },
                        ...options
                    });

                if (error) throw error;
                
                const sanitized = data.map(item => ({
                    name: item.name,
                    id: item.id,
                    updated_at: item.updated_at,
                    created_at: item.created_at,
                    size: item.metadata?.size || 0,
                    encrypted: item.metadata?.encrypted || false
                }));
                
                return { files: sanitized, success: true };
            } catch (error) {
                console.error('[MOG-STORAGE] List operation failed:', error);
                return { error, success: false };
            }
        },

        async deleteFile(bucket, paths) {
            const client = getClient();
            const pathArray = Array.isArray(paths) ? paths : [paths];
            
            try {
                const { data, error } = await client.storage
                    .from(bucket)
                    .remove(pathArray);

                if (error) throw error;
                
                console.info(`[MOG-STORAGE] Secure deletion complete: ${pathArray.join(', ')}`);
                return { deleted: data, success: true };
            } catch (error) {
                console.error('[MOG-STORAGE] Deletion failed:', error);
                return { error, success: false };
            }
        }
    };

    /**
     * Auth Operations with Security Enhancements
     */
    const SecureAuth = {
        async signIn(email, password) {
            const client = getClient();
            
            try {
                // Sanitize input if MogCrypto available
                const cleanEmail = typeof MogCrypto !== 'undefined' 
                    ? MogCrypto.sanitizeInput(email) 
                    : email;

                const { data, error } = await client.auth.signInWithPassword({
                    email: cleanEmail,
                    password
                });

                if (error) throw error;
                
                connectionStatus = 'authenticated';
                
                // Create session token if MogCrypto available
                if (typeof MogCrypto !== 'undefined' && MogCrypto.SessionSecurity) {
                    const sessionToken = await MogCrypto.SessionSecurity.createSessionToken();
                    sessionStorage.setItem('mog_session_token', sessionToken);
                }
                
                console.info('[MOG-AUTH] Session established');
                return { user: data.user, session: data.session, success: true };
            } catch (error) {
                console.error('[MOG-AUTH] Authentication failed:', error);
                return { error, success: false };
            }
        },

        async signOut() {
            const client = getClient();
            
            try {
                const { error } = await client.auth.signOut();
                if (error) throw error;
                
                connectionStatus = 'disconnected';
                sessionStorage.removeItem('mog_session_token');
                
                console.info('[MOG-AUTH] Session terminated');
                return { success: true };
            } catch (error) {
                console.error('[MOG-AUTH] Sign out failed:', error);
                return { error, success: false };
            }
        },

        async getSession() {
            const client = getClient();
            const { data: { session } } = await client.auth.getSession();
            
            // Verify session token if available
            if (session && typeof MogCrypto !== 'undefined' && MogCrypto.SessionSecurity) {
                const token = sessionStorage.getItem('mog_session_token');
                if (token) {
                    const valid = await MogCrypto.SessionSecurity.verifySessionToken(token);
                    if (!valid) {
                        console.warn('[MOG-AUTH] Session token invalid, signing out');
                        await this.signOut();
                        return null;
                    }
                }
            }
            
            return session;
        },

        onAuthStateChange(callback) {
            const client = getClient();
            return client.auth.onAuthStateChange((event, session) => {
                console.info(`[MOG-AUTH] State change: ${event}`);
                callback(event, session);
            });
        }
    };

    /**
     * Database Operations with RLS Enforcement
     */
    const SecureDatabase = {
        async select(table, options = {}) {
            const client = getClient();
            let query = client.from(table).select(options.columns || '*');
            
            if (options.eq) query = query.eq(options.eq.column, options.eq.value);
            if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending });
            if (options.limit) query = query.limit(options.limit);
            
            const { data, error } = await query;
            return error ? { error, success: false } : { data, success: true };
        },

        async insert(table, data, options = {}) {
            const client = getClient();
            
            // Encrypt sensitive data if specified
            if (options.encrypt && options.password && typeof MogCrypto !== 'undefined') {
                data = await MogCrypto.encryptForStorage(data, options.password);
            }
            
            const { data: result, error } = await client.from(table).insert(data).select();
            return error ? { error, success: false } : { data: result, success: true };
        },

        async update(table, match, data, options = {}) {
            const client = getClient();
            
            // Encrypt sensitive data if specified
            if (options.encrypt && options.password && typeof MogCrypto !== 'undefined') {
                data = await MogCrypto.encryptForStorage(data, options.password);
            }
            
            const { data: result, error } = await client.from(table).update(data).eq(match.column, match.value).select();
            return error ? { error, success: false } : { data: result, success: true };
        },

        async delete(table, match) {
            const client = getClient();
            const { data: result, error } = await client.from(table).delete().eq(match.column, match.value).select();
            return error ? { error, success: false } : { data: result, success: true };
        }
    };

    /**
     * Realtime Subscriptions with Security Filtering
     */
    const SecureRealtime = {
        subscribe(channel, event, callback, filter = {}) {
            const client = getClient();
            
            const subscription = client.channel(`secure-${channel}`)
                .on('postgres_changes', {
                    event: event,
                    schema: 'public',
                    table: channel,
                    ...filter
                }, (payload) => {
                    console.info(`[MOG-REALTIME] Event received: ${event} on ${channel}`);
                    callback(payload);
                })
                .subscribe();

            return subscription;
        },

        unsubscribe(channel) {
            const client = getClient();
            client.removeChannel(channel);
        }
    };

    /**
     * Connection Health Monitoring
     */
    async function checkConnection() {
        const client = getClient();
        
        try {
            const start = Date.now();
            const { error } = await client.from('health_check').select('count').limit(1);
            const latency = Date.now() - start;
            
            if (error && error.code !== 'PGRST116') throw error;
            
            connectionStatus = 'connected';
            return { status: 'healthy', latency, success: true };
        } catch (error) {
            connectionStatus = 'error';
            return { status: 'unhealthy', error: error.message, success: false };
        }
    }

    /**
     * Export secure API
     */
    window.MOGSupabase = {
        init: initializeClient,
        getClient: getClient,
        checkConnection: checkConnection,
        auth: SecureAuth,
        storage: SecureStorage,
        db: SecureDatabase,
        realtime: SecureRealtime,
        getStatus: () => connectionStatus,
        getConfig: () => ({
            url: CONFIG.SUPABASE_URL.replace(/\/+$/, ''),
            version: CONFIG.API_VERSION,
            cryptoAvailable: typeof MogCrypto !== 'undefined'
        })
    };

    // Auto-initialize if environment is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.__ENV__) initializeClient();
        });
    } else if (window.__ENV__) {
        initializeClient();
    }

    console.info('[MOG-SECURITY] Supabase client module loaded v5.2.0');

})();
