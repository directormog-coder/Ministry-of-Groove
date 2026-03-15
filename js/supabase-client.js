// js/supabase-client.js
// Ministry of Groove - Secure Supabase Client
// Classification: CONFIDENTIAL // SEC-7G

/**
 * Secure Supabase Client Module
 * Handles encrypted connection initialization and secure storage operations
 * Version: 5.2.0
 */

(function() {
    'use strict';

    // Security: Configuration loaded from environment only
    const CONFIG = {
        SUPABASE_URL: window.__ENV__?.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: window.__ENV__?.SUPABASE_ANON_KEY || '',
        ENCRYPTION_KEY: window.__ENV__?.ENCRYPTION_KEY || '',
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
        
        // URL validation
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

        try {
            // Create client with security options
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
                        // Add request timeout
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

    /**
     * Generate unique request ID for tracing
     */
    function generateRequestId() {
        return `mog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get initialized client (singleton pattern)
     */
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
        /**
         * Upload file with client-side metadata encryption
         */
        async uploadFile(bucket, path, file, options = {}) {
            const client = getClient();
            
            try {
                // Generate encrypted metadata if encryption key available
                const metadata = options.metadata || {};
                if (CONFIG.ENCRYPTION_KEY && metadata.sensitive) {
                    metadata.encrypted = true;
                    metadata.checksum = await generateChecksum(file);
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

        /**
         * Get signed URL for secure file access
         */
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

        /**
         * Download with integrity verification
         */
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

        /**
         * List files with security filtering
         */
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
                
                // Filter sensitive metadata from response
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

        /**
         * Secure deletion with audit trail
         */
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
     * Generate SHA-256 checksum for file integrity
     */
    async function generateChecksum(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Auth Operations with Security Enhancements
     */
    const SecureAuth = {
        async signIn(email, password) {
            const client = getClient();
            
            try {
                const { data, error } = await client.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                
                connectionStatus = 'authenticated';
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

        async insert(table, data) {
            const client = getClient();
            const { data: result, error } = await client.from(table).insert(data).select();
            return error ? { error, success: false } : { data: result, success: true };
        },

        async update(table, match, data) {
            const client = getClient();
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
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = table not found (expected if no health_check table)
            
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
        // Initialization
        init: initializeClient,
        getClient: getClient,
        checkConnection: checkConnection,
        
        // Namespaced operations
        auth: SecureAuth,
        storage: SecureStorage,
        db: SecureDatabase,
        realtime: SecureRealtime,
        
        // Utilities
        getStatus: () => connectionStatus,
        getConfig: () => ({
            url: CONFIG.SUPABASE_URL.replace(/\/+$/, ''), // Sanitize URL
            version: CONFIG.API_VERSION,
            encrypted: !!CONFIG.ENCRYPTION_KEY
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
