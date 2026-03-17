/**
 * Ministry of Groove - Supabase Client
 * NCC Master v5.2.3
 */

(function() {
    'use strict';
    
    window.MOGSupabase = {
        client: null,
        
        init: function() {
            if (!window.ENV) {
                console.error('ENV not loaded');
                return null;
            }
            
            const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ENV;
            
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.error('Supabase credentials missing');
                return null;
            }
            
            this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    storage: localStorage,
                    storageKey: 'mog-auth-token'
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });
            
            return this.client;
        },
        
        getClient: function() {
            if (!this.client) {
                return this.init();
            }
            return this.client;
        }
    };
})();
